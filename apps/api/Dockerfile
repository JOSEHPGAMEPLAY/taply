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

# Generate Prisma Client using locally installed version
RUN ./node_modules/.bin/prisma generate

# Build the API
RUN npm run build

# Stage 2: Production
FROM node:24-alpine AS production
RUN corepack enable && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
WORKDIR /app

# Copy built code from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Install production dependencies only
RUN npm install --omit=dev

# Generate Prisma Client for production runtime using locally installed version
RUN ./node_modules/.bin/prisma generate

# Production config
ENV NODE_ENV=production
USER nodejs
EXPOSE 3001

CMD ["node", "dist/main"]
