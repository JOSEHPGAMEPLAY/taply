# ============================================================
# Taply API - Dockerfile
# Node 24 + NestJS 12 + Prisma 7
# Multi-stage build: builder → production
# ============================================================

# ---------------------
# Stage 1: Builder
# ---------------------
FROM node:24-alpine AS builder

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

WORKDIR /app

# Copy package files and Prisma schema first for better layer caching
# Prisma schema is needed for the postinstall hook (prisma generate)
COPY package.json package-lock.json* ./
COPY prisma/ ./prisma/

# Install all dependencies (including devDependencies for build)
# Use --legacy-peer-deps for @nestjs/schedule compatibility with NestJS 12
# The postinstall hook runs `prisma generate` which needs the schema
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; else npm install --legacy-peer-deps; fi

# Copy source code (changes more frequently than package.json)
COPY . .

# Build NestJS (TypeScript → JavaScript)
RUN npm run build

# ---------------------
# Stage 2: Production
# ---------------------
FROM node:24-alpine AS production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

WORKDIR /app

# Copy only what's needed for runtime from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/package-lock.json ./package-lock.json
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/prisma.config.ts ./prisma.config.ts

# Install production dependencies + Prisma CLI for runtime migrations
# Prisma is needed at runtime for `prisma migrate deploy` in onModuleInit
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --legacy-peer-deps --ignore-scripts && \
    npm install prisma --no-save --legacy-peer-deps --ignore-scripts

# Copy the generated Prisma client (.prisma/client) from builder after npm ci
# so it's not overwritten by the fresh node_modules
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Fix permissions on node_modules so the nodejs user can run prisma migrate deploy
RUN chown -R nodejs:nodejs /app/node_modules

# Production environment
ENV NODE_ENV=production
USER nodejs
EXPOSE 3001

# Healthcheck: verify API is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "const http = require('http'); const req = http.get('http://localhost:3001/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }); req.on('error', () => process.exit(1));"

# Start the API server
CMD ["node", "dist/main"]
