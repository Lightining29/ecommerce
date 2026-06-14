# Frontend Dockerfile (multi-stage) - builds Vite app and serves with nginx

# --- Build stage ---
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend sources and build
COPY frontend/ ./
RUN npm run build

# --- Production stage ---
FROM nginx:alpine AS runner

# Copy built static site
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose nginx default port
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
