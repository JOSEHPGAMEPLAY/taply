FROM node:20-alpine
RUN corepack enable && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
WORKDIR /app

# Copy all workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/ ./apps/api/
COPY apps/web/ ./apps/web/
COPY packages/ ./packages/
COPY prisma/ ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the API first
RUN pnpm --filter @taply/api build

# Generate Prisma Client and copy to all resolution paths
WORKDIR /app/apps/api
RUN npx prisma generate --schema ../../prisma/schema.prisma && \
  cp -r /app/node_modules/.pnpm/@prisma+client@6.19.3_prisma@6.19.3_typescript@5.7.2__typescript@5.7.2/node_modules/.prisma/client/* \
    /app/node_modules/.pnpm/@prisma+client@6.19.3_prisma@6.19.3_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma/client/
WORKDIR /app

# Production config
ENV NODE_ENV=production
USER nodejs
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/v1/health || exit 1

WORKDIR /app/apps/api
CMD ["node", "dist/main"]
