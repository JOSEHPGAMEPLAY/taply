# ============================================================
# Taply Web - Dockerfile
# Node 24 + Next.js 16 + TailwindCSS 4
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

# Install all dependencies
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci; else npm install --package-lock-only && npm ci; fi

# Copy source code (changes more frequently than package.json)
COPY . .

# NEXT_PUBLIC_* variables must be set at build time for Next.js
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build Next.js with standalone output
# - TypeScript → JavaScript
# - TailwindCSS → CSS (via PostCSS)
# - Standalone output for minimal production image
RUN npm run build

# ---------------------
# Stage 2: Production
# ---------------------
FROM node:24-alpine AS production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

WORKDIR /app

# Copy only the standalone output from builder
# Next.js standalone includes only the files needed for production
COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nodejs:nodejs /app/public ./public

# Production environment
ENV NODE_ENV=production
USER nodejs
EXPOSE 3000

# Healthcheck: verify Next.js is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "const http = require('http'); const req = http.get('http://localhost:3000/', (res) => { process.exit(res.statusCode < 500 ? 0 : 1) }); req.on('error', () => process.exit(1));"

# Start Next.js standalone server
CMD ["node", "server.js"]
