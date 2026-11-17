# Stage 1: Build
FROM node:24-alpine AS builder
ARG DATABASE_URL=postgresql://prisma:prisma@localhost:5432/taply
RUN corepack enable && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
WORKDIR /app

# Copy package.json first for better caching (npm install will generate package-lock.json)
COPY package.json ./
# Copy source code
COPY . .

# Install all dependencies
RUN npm install

# Generate Prisma Client (npx fetches the latest version automatically)
RUN DATABASE_URL=${DATABASE_URL} npx prisma generate

# Build the API
RUN npm run build

# Stage 2: Production
FROM node:24-alpine AS production
RUN corepack enable && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
WORKDIR /app

# Copy built code and generated Prisma client from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/src/generated ./src/generated
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/package-lock.json ./package-lock.json
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/prisma.config.ts ./prisma.config.ts

# Install production dependencies only
RUN npm install --omit=dev

# Production config
ENV NODE_ENV=production
USER nodejs
EXPOSE 3001

CMD ["node", "dist/main"]
