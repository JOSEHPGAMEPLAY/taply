# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
WORKDIR /app

# Copy workspace configuration files first for better caching
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# NEXT_PUBLIC_* variables must be available at BUILD time for Next.js to bake them into the JS bundles.
# Pass via docker compose build arg: docker compose build web --build-arg NEXT_PUBLIC_API_URL=...
# Or set in .env and reference in docker-compose.yml under build.args.
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build Next.js with standalone output
# Tailwind CSS genera los estilos automáticamente durante este paso:
# 1. PostCSS procesa globals.css
# 2. Tailwind escanea los archivos .tsx y genera las clases CSS necesarias
# 3. Next.js compila todo en .next/static/css/ y .next/static/js/
# 4. El standalone output copia solo lo necesario en .next/standalone/
RUN pnpm --filter @taply/web build

# Next.js standalone output does NOT include .next/static/ (CSS, JS bundles, images).
# Copy static assets to the standalone directory so the server can serve them.
# This is done INSIDE the container, not from the host.
RUN cp -r /app/apps/web/.next/static /app/apps/web/.next/standalone/apps/web/.next/static

# Stage 2: Production
FROM node:22-alpine AS production
RUN corepack enable && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder --chown=nodejs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nodejs:nodejs /app/apps/web/public ./apps/web/public

# Production config
ENV NODE_ENV=production
USER nodejs
EXPOSE 3000

CMD ["node", "apps/web/server.js"]
