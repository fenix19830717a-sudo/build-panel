# BuildAI Framework - Framework Controller
# Backend Dockerfile - NestJS

# ===================
# 依赖安装阶段
# ===================
FROM node:20-alpine AS deps

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

# ===================
# 构建阶段
# ===================
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY . .

RUN npm run build
RUN npm prune --production

# ===================
# 生产阶段
# ===================
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache curl openssh-client postgresql-client redis

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nestjs:nodejs /app/migrations ./migrations

USER nestjs

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/api/v1 || exit 1

EXPOSE 8080

ENV NODE_ENV=production

CMD ["sh", "-c", "./scripts/startup-check.sh && node dist/main.js"]
