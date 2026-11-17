# Stage 1: Build
FROM node:24-alpine AS builder
RUN corepack enable && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
WORKDIR /app

# Copy all source code first (no package-lock.json — npm will generate a fresh one compatible with Node 24)
COPY . .

# Install dependencies (npm install generates a fresh package-lock.json)
RUN npm install

# Generate Prisma Client (DATABASE_URL placeholder is enough for generate, real URL is set at runtime)
RUN DATABASE_URL=postgresql://prisma:prisma@localhost:5432/taply ./node_modules/.bin/prisma generate --schema=./prisma/schema.prisma

# Build the API
RUN npm run build

# Stage 2: Production
FROM node:24-alpine AS production
RUN corepack enable && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
WORKDIR /app

# Copy built code, generated Prisma client, and source from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/src/generated ./src/generated
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/prisma.config.ts ./prisma.config.ts

# Install production dependencies only (npm generates its own lock file)
RUN npm install --omit=dev

# Production config
ENV NODE_ENV=production
USER nodejs
EXPOSE 3001

CMD ["node", "dist/main"]
