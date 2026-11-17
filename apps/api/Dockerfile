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

# Copy package files first for better layer caching
# If package.json hasn't changed, npm ci is skipped
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
# npm ci uses package-lock.json for deterministic builds
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci; else npm install --package-lock-only && npm ci; fi

# Copy source code (changes more frequently than package.json)
COPY . .

# Generate Prisma Client from schema (no database connection needed)
RUN ./node_modules/.bin/prisma generate --schema=./prisma/schema.prisma

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

# Install production dependencies only (no devDependencies)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Production environment
ENV NODE_ENV=production
USER nodejs
EXPOSE 3001

# Healthcheck: verify API is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "const http = require('http'); const req = http.get('http://localhost:3001/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }); req.on('error', () => process.exit(1));"

# Start the API server
CMD ["node", "dist/main"]
