# 部署指南

本文档提供 B2B SaaS 平台的完整部署指南，包括主服务和 Node Agent 的安装、配置和部署。

---

## 目录

- [1. 环境要求](#1-环境要求)
- [2. 安装步骤](#2-安装步骤)
- [3. 配置说明](#3-配置说明)
- [4. 开发环境](#4-开发环境)
- [5. 生产环境部署](#5-生产环境部署)
- [6. Docker 部署](#6-docker-部署)
- [7. 节点代理部署](#7-节点代理部署)
- [8. 监控和日志](#8-监控和日志)
- [9. 故障排除](#9-故障排除)

---

## 1. 环境要求

### 1.1 软件要求

| 软件 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | 18.x 或更高 | 推荐使用 LTS 版本 |
| npm | 9.x 或更高 | 随 Node.js 一起安装 |
| yarn | 1.22+ (可选) | 可替代 npm |
| Git | 2.x | 用于克隆仓库 |

### 1.2 操作系统支持

| 操作系统 | 支持状态 | 备注 |
|----------|----------|------|
| Windows 10/11 | ✅ 完全支持 | 推荐使用 PowerShell |
| Windows Server 2019+ | ✅ 完全支持 | 生产环境推荐 |
| macOS 11+ | ✅ 完全支持 | 开发环境推荐 |
| Ubuntu 20.04+ | ✅ 完全支持 | 生产环境推荐 |
| CentOS 8+ | ✅ 完全支持 | 需安装开发工具 |
| Debian 11+ | ✅ 完全支持 | 生产环境可用 |

### 1.3 硬件要求

| 环境 | CPU | 内存 | 存储 |
|------|-----|------|------|
| 开发环境 | 2 核 | 4 GB | 10 GB |
| 生产环境（最小） | 4 核 | 8 GB | 50 GB |
| 生产环境（推荐） | 8 核 | 16 GB | 100 GB |

### 1.4 网络要求

- 主服务默认端口：`3000`
- Node Agent 默认端口：`3100`
- WebSocket 路径：`/ws/node`
- 确保防火墙允许相关端口通信

---

## 2. 安装步骤

### 2.1 克隆仓库

```bash
# 使用 HTTPS
git clone https://github.com/your-org/b2b-over-sever-framework.git

# 或使用 SSH
git clone git@github.com:your-org/b2b-over-sever-framework.git

# 进入项目目录
cd b2b-over-sever-framework
```

### 2.2 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

> **注意**：`better-sqlite3` 需要编译原生模块，Windows 用户可能需要安装 Visual Studio Build Tools。

### 2.3 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑环境变量
# Windows
notepad .env

# Linux/macOS
nano .env
```

编辑 `.env` 文件，配置必要的环境变量：

```env
# AI API Keys（至少配置一个）
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
KIMI_API_KEY=
VOLCENGINE_API_KEY=
MINIMAX_API_KEY=

# Server Config
PORT=3000
NODE_ENV=development
NODE_SECRET_KEY=your-secret-key-change-in-production
```

### 2.4 初始化数据库

数据库会在首次启动时自动初始化。如需手动初始化：

```bash
# 启动服务会自动创建 main.db 并初始化表结构
npm run dev
```

数据库文件位置：`./main.db`

### 2.5 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

服务启动后访问：http://localhost:3000

---

## 3. 配置说明

### 3.1 环境变量配置

#### AI 服务配置

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `GEMINI_API_KEY` | 可选 | Google Gemini API 密钥 |
| `OPENAI_API_KEY` | 可选 | OpenAI API 密钥 |
| `KIMI_API_KEY` | 可选 | Kimi（月之暗面）API 密钥 |
| `VOLCENGINE_API_KEY` | 可选 | 火山引擎 API 密钥 |
| `MINIMAX_API_KEY` | 可选 | Minimax API 密钥 |

> 至少配置一个 AI 服务的 API 密钥以使用智能对话功能。

#### 服务配置

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | `3000` | 服务监听端口 |
| `NODE_ENV` | `development` | 运行环境 |
| `NODE_SECRET_KEY` | - | 节点认证密钥（生产环境必须修改） |

### 3.2 数据库配置

项目使用 SQLite 数据库，无需额外配置。数据库文件位于项目根目录的 `main.db`。

#### 数据库表结构

主要数据表包括：

| 表名 | 说明 |
|------|------|
| `projects` | 项目管理 |
| `user_stats` | 用户统计 |
| `model_configs` | AI 模型配置 |
| `service_nodes` | 服务节点管理 |
| `node_apps` | 节点应用管理 |
| `crawler_tasks` | 爬虫任务 |
| `polymarket_*` | Polymarket 相关表 |

### 3.3 AI 服务配置

#### 通过管理界面配置

1. 登录管理后台
2. 进入「系统管理」→「AI 模型配置」
3. 添加 AI 服务提供商的 API 密钥

#### 通过数据库配置

```sql
INSERT INTO model_configs (provider, api_key, base_url, is_active)
VALUES ('openai', 'sk-your-api-key', 'https://api.openai.com/v1', 1);
```

#### 支持的 AI 提供商

| 提供商 | provider 值 | 默认 Base URL |
|--------|-------------|---------------|
| Google Gemini | `gemini` | - |
| OpenAI | `openai` | `https://api.openai.com/v1` |
| Kimi | `kimi` | `https://api.moonshot.cn/v1` |
| 火山引擎 | `volcengine` | `https://ark.cn-beijing.volces.com/api/v3` |
| Minimax | `minimax` | `https://api.minimax.chat/v1` |

---

## 4. 开发环境

### 4.1 启动开发服务器

```bash
npm run dev
```

开发服务器特性：
- 自动热重载（HMR）
- 实时编译 TypeScript
- 开发者工具集成

### 4.2 热重载

项目使用 Vite 提供热重载功能：

- 前端代码修改自动刷新
- 后端代码修改自动重启（通过 `tsx`）

如需禁用 HMR：

```env
DISABLE_HMR=true
```

### 4.3 调试技巧

#### VS Code 调试配置

创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

#### 日志调试

```typescript
console.log('[Debug]', data);
```

查看实时日志：

```bash
# Linux/macOS
npm run dev 2>&1 | tee debug.log

# Windows PowerShell
npm run dev 2>&1 | Tee-Object -FilePath debug.log
```

---

## 5. 生产环境部署

### 5.1 构建项目

```bash
# 清理旧的构建文件
npm run clean

# 构建生产版本
npm run build
```

构建产物位于 `dist/` 目录。

### 5.2 启动生产服务

```bash
# 设置生产环境
export NODE_ENV=production

# 启动服务
npm start
```

### 5.3 进程管理（PM2）

#### 安装 PM2

```bash
npm install -g pm2
```

#### 创建 PM2 配置文件

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [
    {
      name: 'b2b-main',
      script: 'server.ts',
      interpreter: 'node',
      interpreter_args: '--import tsx',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production'
      },
      error_file: './logs/main-error.log',
      out_file: './logs/main-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      max_memory_restart: '1G',
      autorestart: true,
      watch: false
    }
  ]
};
```

#### PM2 常用命令

```bash
# 启动服务
pm2 start ecosystem.config.js --env production

# 查看状态
pm2 status

# 查看日志
pm2 logs b2b-main

# 重启服务
pm2 restart b2b-main

# 停止服务
pm2 stop b2b-main

# 删除服务
pm2 delete b2b-main

# 保存进程列表（开机自启）
pm2 save
pm2 startup
```

### 5.4 Nginx 反向代理配置

#### 基础配置

创建 `/etc/nginx/sites-available/b2b-platform`：

```nginx
upstream b2b_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 日志
    access_log /var/log/nginx/b2b-access.log;
    error_log /var/log/nginx/b2b-error.log;

    # 静态资源
    location /dist/ {
        alias /var/www/b2b-platform/dist/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # WebSocket 代理
    location /ws/node {
        proxy_pass http://b2b_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # API 代理
    location /api/ {
        proxy_pass http://b2b_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 前端应用
    location / {
        proxy_pass http://b2b_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/b2b-platform /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo nginx -s reload
```

---

## 6. Docker 部署

### 6.1 Dockerfile 示例

创建 `Dockerfile`：

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建
RUN npm run build

# 生产阶段
FROM node:20-alpine AS production

WORKDIR /app

# 安装生产依赖
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/src/db.ts ./src/

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 设置权限
RUN chown -R nodejs:nodejs /app

USER nodejs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/auth/me || exit 1

# 启动命令
CMD ["node", "--import", "tsx", "server.ts"]
```

### 6.2 docker-compose.yml 示例

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  main-server:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: b2b-main-server
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - KIMI_API_KEY=${KIMI_API_KEY}
      - VOLCENGINE_API_KEY=${VOLCENGINE_API_KEY}
      - MINIMAX_API_KEY=${MINIMAX_API_KEY}
      - NODE_SECRET_KEY=${NODE_SECRET_KEY}
    volumes:
      - ./main.db:/app/main.db
      - ./logs:/app/logs
    networks:
      - b2b-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/auth/me"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

  node-agent:
    build:
      context: ./node-agent
      dockerfile: Dockerfile
    container_name: b2b-node-agent
    restart: unless-stopped
    ports:
      - "3100:3100"
    environment:
      - NODE_ENV=production
      - NODE_PORT=3100
      - NODE_NAME=worker-node-1
      - NODE_REGION=us-east
      - NODE_TYPE=worker
      - MASTER_URL=http://main-server:3000
      - SECRET_KEY=${NODE_SECRET_KEY}
    depends_on:
      main-server:
        condition: service_healthy
    networks:
      - b2b-network

networks:
  b2b-network:
    driver: bridge

volumes:
  db-data:
  logs:
```

### 6.3 构建和运行命令

```bash
# 构建镜像
docker build -t b2b-platform:latest .

# 运行容器
docker run -d \
  --name b2b-server \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e GEMINI_API_KEY=your-key \
  -e OPENAI_API_KEY=your-key \
  -e NODE_SECRET_KEY=your-secret \
  -v $(pwd)/main.db:/app/main.db \
  b2b-platform:latest

# 使用 docker-compose
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重新构建并启动
docker-compose up -d --build
```

---

## 7. 节点代理部署

### 7.1 Node Agent 安装

```bash
# 进入 node-agent 目录
cd node-agent

# 安装依赖
npm install

# 复制配置文件（如需自定义）
cp config/default.json config/custom.json
```

### 7.2 配置说明

Node Agent 配置文件位于 `node-agent/config/default.json`：

```json
{
  "node": {
    "name": "Node-Agent-1",
    "region": "default",
    "type": "worker",
    "port": 3100
  },
  "master": {
    "url": "http://localhost:3000",
    "heartbeatInterval": 30000,
    "reconnectDelay": 5000,
    "maxReconnectAttempts": 10
  },
  "security": {
    "secretKey": "your-secret-key-change-in-production",
    "tokenExpiry": 3600
  },
  "apps": {
    "directory": "./apps",
    "autoLoad": true,
    "hotReload": true
  },
  "monitoring": {
    "enabled": true,
    "interval": 10000,
    "metrics": ["cpu", "memory", "disk", "network"]
  },
  "logging": {
    "level": "info",
    "file": "logs/agent.log",
    "maxSize": 10485760,
    "maxFiles": 5
  }
}
```

#### 配置项说明

| 配置项 | 说明 |
|--------|------|
| `node.name` | 节点名称，用于标识 |
| `node.region` | 节点区域 |
| `node.type` | 节点类型：`worker`、`proxy`、`trading` |
| `node.port` | HTTP 服务端口 |
| `master.url` | 主服务地址 |
| `security.secretKey` | 认证密钥（必须与主服务一致） |
| `apps.directory` | 应用目录 |
| `apps.autoLoad` | 是否自动加载应用 |
| `apps.hotReload` | 是否启用热重载 |

### 7.3 启动命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 生产模式
npm start
```

### 7.4 PM2 管理 Node Agent

创建 `node-agent/ecosystem.config.js`：

```javascript
module.exports = {
  apps: [
    {
      name: 'b2b-node-agent',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

启动命令：

```bash
pm2 start ecosystem.config.js
```

---

## 8. 监控和日志

### 8.1 健康检查端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/me` | GET | 用户认证状态检查 |
| `/api/admin/nodes` | GET | 节点状态列表 |
| `/api/user/stats` | GET | 用户统计信息 |

#### 健康检查脚本

创建 `scripts/health-check.sh`：

```bash
#!/bin/bash

MAIN_URL="${1:-http://localhost:3000}"

echo "Checking main server health..."

response=$(curl -s -o /dev/null -w "%{http_code}" "$MAIN_URL/api/auth/me")

if [ "$response" -eq 200 ]; then
    echo "✅ Main server is healthy (HTTP $response)"
else
    echo "❌ Main server is unhealthy (HTTP $response)"
    exit 1
fi
```

### 8.2 日志配置

#### 主服务日志

主服务输出到控制台，可通过 PM2 管理日志：

```bash
# 查看实时日志
pm2 logs b2b-main

# 查看错误日志
pm2 logs b2b-main --err

# 清空日志
pm2 flush
```

#### Node Agent 日志

Node Agent 使用 Winston 日志库，日志文件位于 `node-agent/logs/agent.log`。

日志级别：
- `error`：错误信息
- `warn`：警告信息
- `info`：一般信息
- `debug`：调试信息

### 8.3 性能监控

#### PM2 监控

```bash
# 实时监控
pm2 monit

# 查看进程信息
pm2 show b2b-main

# 查看资源使用
pm2 list
```

#### 系统监控

Node Agent 内置系统监控功能：

- CPU 使用率
- 内存使用率
- 磁盘使用率
- 网络流量

监控数据通过心跳上报到主服务。

---

## 9. 故障排除

### 9.1 常见问题

#### 问题 1：依赖安装失败

**症状**：
```
gyp ERR! build error
gyp ERR! stack Error: `make` failed with exit code: 2
```

**解决方案**：

Windows：
```bash
# 安装 Visual Studio Build Tools
npm install -g windows-build-tools

# 或使用管理员权限运行
npm install --msvs_version=2022
```

Linux：
```bash
# Ubuntu/Debian
sudo apt-get install build-essential python3

# CentOS/RHEL
sudo yum groupinstall "Development Tools"
sudo yum install python3
```

#### 问题 2：端口被占用

**症状**：
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**：

Windows：
```powershell
# 查找占用端口的进程
netstat -ano | findstr :3000

# 终止进程
taskkill /PID <PID> /F
```

Linux/macOS：
```bash
# 查找占用端口的进程
lsof -i :3000

# 终止进程
kill -9 <PID>
```

#### 问题 3：数据库锁定

**症状**：
```
Error: SQLITE_BUSY: database is locked
```

**解决方案**：
```bash
# 停止所有服务
pm2 stop all

# 检查是否有其他进程访问数据库
lsof main.db

# 重启服务
pm2 start all
```

#### 问题 4：Node Agent 连接失败

**症状**：
```
[ERROR] Failed to connect to master server
```

**解决方案**：

1. 检查主服务是否运行
2. 检查网络连接
3. 验证 `SECRET_KEY` 是否一致
4. 检查防火墙设置

```bash
# 测试主服务连接
curl http://localhost:3000/api/auth/me

# 检查密钥配置
echo $NODE_SECRET_KEY  # 主服务
echo $SECRET_KEY       # Node Agent
```

#### 问题 5：AI 服务调用失败

**症状**：
```
Error: No API key configured for openai
```

**解决方案**：

1. 检查环境变量配置
2. 通过管理界面添加 API 密钥
3. 验证 API 密钥有效性

```bash
# 检查环境变量
echo $OPENAI_API_KEY

# 测试 API 连接
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### 9.2 日志分析

#### 查看错误日志

```bash
# PM2 错误日志
pm2 logs b2b-main --err --lines 100

# Node Agent 日志
tail -f node-agent/logs/agent.log | grep ERROR
```

#### 常见错误代码

| 错误代码 | 说明 | 解决方案 |
|----------|------|----------|
| `ECONNREFUSED` | 连接被拒绝 | 检查目标服务是否运行 |
| `ETIMEDOUT` | 连接超时 | 检查网络连接和防火墙 |
| `EADDRINUSE` | 端口被占用 | 更换端口或终止占用进程 |
| `SQLITE_BUSY` | 数据库锁定 | 等待或重启服务 |
| `401 Unauthorized` | 认证失败 | 检查 API 密钥或 Token |

### 9.3 性能问题排查

#### 内存泄漏排查

```bash
# 使用 Node.js 内置分析
node --inspect server.ts

# 使用 heapdump
npm install heapdump
```

#### CPU 使用过高

```bash
# 使用 clinic.js 分析
npm install -g clinic
clinic doctor -- node server.ts
```

### 9.4 获取帮助

如遇到无法解决的问题，请：

1. 查看项目文档：[README.md](README.md)、[ARCHITECTURE.md](ARCHITECTURE.md)
2. 搜索 Issues：https://github.com/your-org/b2b-over-sever-framework/issues
3. 提交新 Issue，包含：
   - 错误信息
   - 环境信息（OS、Node.js 版本）
   - 复现步骤

---

## 附录

### A. 快速命令参考

```bash
# 开发
npm run dev              # 启动开发服务器
npm run dev:node         # 启动 Node Agent 开发模式
npm run lint             # 类型检查

# 生产
npm run build            # 构建生产版本
npm start                # 启动生产服务器

# PM2
pm2 start ecosystem.config.js
pm2 logs
pm2 monit
pm2 restart all
pm2 stop all

# Docker
docker-compose up -d
docker-compose logs -f
docker-compose down
```

### B. 端口清单

| 服务 | 默认端口 | 说明 |
|------|----------|------|
| 主服务 | 3000 | HTTP + WebSocket |
| Node Agent | 3100 | HTTP 服务 |

### C. 文件结构

```
b2b-over-sever-framework/
├── server.ts              # 主服务入口
├── src/                   # 前端源代码
│   ├── db.ts             # 数据库配置
│   ├── apps/             # 应用模块
│   └── pages/            # 页面组件
├── node-agent/           # Node Agent
│   ├── src/              # 源代码
│   ├── apps/             # 应用目录
│   └── config/           # 配置文件
├── .env.example          # 环境变量示例
├── package.json          # 依赖配置
└── main.db               # SQLite 数据库
```
