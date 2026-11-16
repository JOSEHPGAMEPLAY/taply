# Stage 1: Build
FROM node:24-alpine AS builder
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

# Stage 2: Production
FROM node:24-alpine AS production
RUN corepack enable && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
WORKDIR /app

# Copy workspace structure needed for pnpm
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY package.json ./package.json
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

# Install only production dependencies with proper symlinks
RUN pnpm install --frozen-lockfile --filter @taply/web...

# Copy built Next.js standalone output from builder
COPY --from=builder --chown=nodejs:nodejs /app/apps/web/.next/standalone ./apps/web/.next/standalone
COPY --from=builder --chown=nodejs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nodejs:nodejs /app/apps/web/public ./apps/web/public

# Production config
ENV NODE_ENV=production
USER nodejs
EXPOSE 3000

# Next.js standalone output requires running the server.js directly,
# not 'next start' which is incompatible with output: standalone.
CMD ["node", "apps/web/.next/standalone/apps/web/server.js"]
