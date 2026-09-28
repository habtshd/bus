# Production Multi-Stage Dockerfile for Ethiopian Bus Platform Web Portal
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root monorepo manifests
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/web/package*.json ./apps/web/

# Install dependencies
RUN npm ci

# Copy shared package and build
COPY packages/shared ./packages/shared
RUN npm --prefix packages/shared run build

# Copy web source and build production bundle
COPY apps/web ./apps/web
RUN npm --prefix apps/web run build

# Stage 2: High Performance Nginx Server
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Custom Nginx configuration for single-page application routing and caching
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $$uri $$uri/ /index.html; \
    } \
    location /assets/ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
