FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN cd backend && npm ci
RUN cd frontend && npm ci

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build backend
RUN cd backend && npm run build

# Build frontend
RUN cd frontend && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install PostgreSQL client, MySQL client, and MongoDB tools
RUN apk add --no-cache \
    postgresql-client \
    mysql-client \
    mongodb-tools \
    redis \
    curl

# Copy backend production files
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package*.json ./

# Copy frontend build
COPY --from=builder /app/frontend/dist ./public

# Install production dependencies
RUN npm ci --only=production

# Create backup directory
RUN mkdir -p /app/backups

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001
ENV BACKUP_DIR=/app/backups

CMD ["node", "dist/main.js"]
