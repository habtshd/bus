# Production Multi-Stage Dockerfile for Ethiopian Bus Platform API
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root monorepo package manifests
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci

# Copy shared source code and build it
COPY packages/shared ./packages/shared
RUN npm --prefix packages/shared run build

# Copy API source and Prisma schema
COPY apps/api ./apps/api
RUN cd apps/api && npx prisma generate
RUN cd apps/api && npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Install production dependencies only
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/api/package*.json ./apps/api/
RUN npm ci --omit=dev

# Copy compiled artifacts from builder
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["node", "apps/api/dist/main.js"]
