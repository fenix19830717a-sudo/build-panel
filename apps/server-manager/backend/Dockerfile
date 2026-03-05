# BuildAI Framework - ServerManager
# Backend Dockerfile - Express + Socket.io + node-pty

# ===================
# 依赖安装阶段
# ===================
FROM node:20-alpine AS deps

WORKDIR /app

# 安装构建依赖（包括 python 和 make，某些原生模块需要）
RUN apk add --no-cache python3 make g++ linux-headers

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

# 安装运行所需工具和 SSH 客户端
RUN apk add --no-cache curl openssh-client bash

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeapp -u 1001 -G nodejs

COPY --from=builder --chown=nodeapp:nodejs /app/dist ./dist
COPY --from=builder --chown=nodeapp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeapp:nodejs /app/package.json ./

USER nodeapp

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
