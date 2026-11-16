# Stage 1: Build
FROM node:24-alpine AS builder
RUN corepack enable && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
WORKDIR /app

# Copy workspace configuration files first for better caching
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY prisma/ ./prisma/
COPY apps/api/ ./apps/api/

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build the API
RUN pnpm --filter @taply/api build

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
COPY prisma/ ./prisma/
COPY apps/api/ ./apps/api/

# Install only production dependencies with proper symlinks
RUN pnpm install --frozen-lockfile --filter @taply/api...

# Generate Prisma Client for production
RUN npx prisma generate --schema=./prisma/schema.prisma

# Production config
ENV NODE_ENV=production
USER nodejs
EXPOSE 3001

WORKDIR /app/apps/api
CMD ["node", "dist/main"]
