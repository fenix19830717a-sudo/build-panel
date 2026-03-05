# SiteMonitor - 网站可用性监控平台

## 简介

SiteMonitor 是一个功能完整的网站可用性监控平台，支持 HTTP/HTTPS 监控、TCP/Ping 监控、SSL 证书监控，以及多种告警通知渠道。帮助企业实时掌握网站运行状态，及时发现和解决问题。

核心功能：
- 多类型监控（HTTP/HTTPS/TCP/Ping）
- 多种告警通知方式
- 实时数据可视化
- SSL 证书过期监控
- 页面关键字匹配检测
- 历史数据记录和分析

## 功能特性

### 监控类型
- ✅ **HTTP/HTTPS 监控** - 监控网站可访问性、响应时间、状态码
- ✅ **TCP 监控** - 监控端口连通性
- ✅ **Ping 监控** - 监控网络延迟
- ✅ **SSL 证书监控** - 自动检查证书过期时间
- ✅ **关键字监控** - 检测页面内容是否包含指定关键字
- ✅ **内容匹配** - 检测页面内容变化

### 告警通知
- ✅ **邮件通知** - SMTP 邮件告警
- ✅ **Webhook** - 自定义 Webhook 回调
- ✅ **Telegram** - Telegram Bot 通知
- ✅ **钉钉** - 钉钉群机器人
- ✅ **Slack** - Slack 消息通知
- ✅ **Discord** - Discord 消息通知

### 数据可视化
- ✅ **仪表盘** - 实时监控总览
- ✅ **状态分布** - 监控状态统计图表
- ✅ **响应时间趋势** - 历史响应时间曲线
- ✅ **可用率统计** - SLA 可用率计算
- ✅ **告警历史** - 完整的告警记录

### 监控配置
- ✅ **检查间隔** - 支持 1-60 分钟间隔
- ✅ **超时设置** - 自定义超时时间
- ✅ **重试机制** - 失败重试配置
- ✅ **全局告警** - 批量配置告警规则
- ✅ **维护窗口** - 设置维护时间段

## 技术栈

### 后端
- **Framework**: NestJS 10
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **Cache**: Redis
- **ORM**: TypeORM
- **Task Scheduler**: Bull + node-cron

### 前端
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Ant Design
- **Charts**: Recharts
- **State**: Zustand

## 快速开始

### 环境要求
- Node.js 20+
- PostgreSQL 14+
- Redis 7+

### 安装依赖

```bash
# 后端
cd apps/sitemonitor/backend
npm install

# 前端
cd ../frontend
npm install
```

### 环境配置

```bash
# 后端配置
cd apps/sitemonitor/backend
cp .env.example .env

# 编辑 .env 文件
```

### 数据库初始化

```bash
cd apps/sitemonitor/backend
npm run migration:run
```

### 启动开发服务器

```bash
# 后端 (端口 3000)
cd apps/sitemonitor/backend
npm run start:dev

# 前端 (端口 5173)
cd apps/sitemonitor/frontend
npm run dev
```

### 生产构建

```bash
# 后端
cd apps/sitemonitor/backend
npm run build

# 前端
cd apps/sitemonitor/frontend
npm run build
```

## API 文档

启动后端后访问：
```
http://localhost:3000/api/docs
```

### 主要 API

#### 监控管理
- `GET /api/v1/monitors` - 获取监控列表
- `POST /api/v1/monitors` - 创建监控
- `GET /api/v1/monitors/:id` - 获取监控详情
- `PUT /api/v1/monitors/:id` - 更新监控
- `DELETE /api/v1/monitors/:id` - 删除监控
- `POST /api/v1/monitors/:id/pause` - 暂停监控
- `POST /api/v1/monitors/:id/resume` - 恢复监控
- `POST /api/v1/monitors/:id/check` - 立即检查

#### 告警管理
- `GET /api/v1/alerts` - 获取告警列表
- `POST /api/v1/alerts/:id/acknowledge` - 确认告警
- `POST /api/v1/alerts/:id/resolve` - 解决告警

#### 告警渠道
- `GET /api/v1/alert-channels` - 获取渠道列表
- `POST /api/v1/alert-channels` - 创建渠道
- `POST /api/v1/alert-channels/:id/test` - 测试渠道

#### 仪表盘
- `GET /api/v1/dashboard/overview` - 获取概览数据
- `GET /api/v1/dashboard/status-distribution` - 状态分布
- `GET /api/v1/dashboard/uptime-trend` - 可用率趋势
- `GET /api/v1/dashboard/response-time-trend` - 响应时间趋势

#### 历史记录
- `GET /api/v1/monitors/:id/history` - 获取检查历史
- `GET /api/v1/monitors/:id/uptime` - 获取可用率统计

## 部署

### Docker 部署

```bash
cd apps/sitemonitor
docker-compose up -d
```

### 生产环境部署

1. **配置环境变量**
   ```bash
   NODE_ENV=production
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=sitemonitor
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

2. **配置 Nginx**
   ```nginx
   server {
       listen 80;
       server_name monitor.yourdomain.com;
       
       location / {
           root /path/to/sitemonitor/frontend/dist;
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. **启动服务**
   ```bash
   cd backend
   npm run build
   npm run start:prod
   ```

## 目录结构

```
apps/sitemonitor/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── monitors/     # 监控模块
│   │   │   ├── alerts/       # 告警模块
│   │   │   ├── channels/     # 告警渠道模块
│   │   │   └── dashboard/    # 仪表盘模块
│   │   ├── scheduler/        # 定时任务
│   │   └── main.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/            # 页面
│   │   └── App.tsx
│   └── package.json
└── docker-compose.yml
```

## 监控配置示例

### HTTP 监控

```json
{
  "name": "公司官网",
  "type": "http",
  "url": "https://www.example.com",
  "method": "GET",
  "interval": 5,
  "timeout": 10,
  "expectedStatus": 200,
  "followRedirect": true,
  "sslVerify": true
}
```

### SSL 证书监控

```json
{
  "name": "SSL 证书检查",
  "type": "ssl",
  "url": "https://www.example.com",
  "interval": 60,
  "expireDaysWarning": 30
}
```

### 关键字监控

```json
{
  "name": "页面内容检查",
  "type": "keyword",
  "url": "https://www.example.com",
  "keyword": "欢迎访问",
  "interval": 10
}
```

## 告警渠道配置

### 邮件配置

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=monitor@yourdomain.com
```

### Webhook 配置

```json
{
  "type": "webhook",
  "name": "企业微信",
  "config": {
    "url": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    }
  }
}
```

### Telegram 配置

```json
{
  "type": "telegram",
  "name": "Telegram Bot",
  "config": {
    "botToken": "your-bot-token",
    "chatId": "your-chat-id"
  }
}
```

## 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| NODE_ENV | 运行环境 | 是 |
| PORT | 服务端口 | 是 |
| DB_HOST | 数据库主机 | 是 |
| DB_PORT | 数据库端口 | 是 |
| DB_USERNAME | 数据库用户名 | 是 |
| DB_PASSWORD | 数据库密码 | 是 |
| DB_DATABASE | 数据库名称 | 是 |
| REDIS_HOST | Redis 主机 | 是 |
| REDIS_PORT | Redis 端口 | 是 |
| SMTP_HOST | SMTP 主机 | 否 |
| SMTP_PORT | SMTP 端口 | 否 |
| SMTP_USER | SMTP 用户 | 否 |
| SMTP_PASS | SMTP 密码 | 否 |

## 许可证

MIT
