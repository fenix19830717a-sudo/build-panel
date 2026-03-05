# BuildAI Framework - WebsiteTemplate
# Backend Dockerfile - NestJS

# ===================
# 依赖安装阶段
# ===================
FROM node:20-alpine AS deps

WORKDIR /app

# 安装构建依赖
RUN apk add --no-cache python3 make g++

# 复制包管理文件
COPY package*.json ./

# 安装所有依赖（包括开发依赖）
RUN npm ci

# ===================
# 构建阶段
# ===================
FROM node:20-alpine AS builder

WORKDIR /app

# 从 deps 阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 清理开发依赖
RUN npm prune --production

# ===================
# 生产阶段
# ===================
FROM node:20-alpine AS production

WORKDIR /app

# 安装必要工具
RUN apk add --no-cache curl

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# 从构建阶段复制必要文件
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

# 切换到非 root 用户
USER nestjs

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
