# Stage 1: Build
FROM node:24-alpine AS builder
RUN corepack enable && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./
# Copy source code
COPY . .

# Install dependencies
RUN npm install

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
RUN npm run build

# Stage 2: Production
FROM node:24-alpine AS production
RUN corepack enable && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
WORKDIR /app

# Copy built Next.js standalone output from builder
COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nodejs:nodejs /app/public ./public

# Production config
ENV NODE_ENV=production
USER nodejs
EXPOSE 3000

# Next.js standalone output requires running the server.js directly,
# not 'next start' which is incompatible with output: standalone.
CMD ["node", "server.js"]
