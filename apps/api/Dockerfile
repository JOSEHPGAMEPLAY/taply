# Stage 1: Build
FROM node:24-alpine AS builder
ARG DATABASE_URL=postgresql://user:pass@localhost:5432/db
RUN corepack enable && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
WORKDIR /app

# Copy package.json first for better caching
COPY package.json ./

# Copy all source code
COPY . .

# Install dependencies (npm install generates a fresh package-lock.json compatible with Node 24)
RUN npm install

# Generate Prisma Client (needs DATABASE_URL for prisma.config.ts, placeholder is fine for generate)
RUN DATABASE_URL=$DATABASE_URL ./node_modules/.bin/prisma generate --schema=./prisma/schema.prisma

# Build the API
RUN npm run build

# Stage 2: Production
FROM node:24-alpine AS production
RUN corepack enable && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
WORKDIR /app

# Copy built code, generated Prisma client, and config from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/src/generated ./src/generated
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/prisma.config.ts ./prisma.config.ts

# Install production dependencies only
RUN npm install --omit=dev

# Production config
ENV NODE_ENV=production
USER nodejs
EXPOSE 3001

CMD ["node", "dist/main"]
