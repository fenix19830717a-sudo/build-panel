# SiteMonitor Application

一个功能完整的网站可用性监控平台，支持 HTTP/HTTPS 监控、告警通知、数据可视化。

## 功能特性

- **监控管理**: HTTP/HTTPS/TCP/Ping 监控
- **告警通知**: 邮件、Webhook、Telegram、钉钉、Slack、Discord
- **数据可视化**: 实时仪表盘、响应时间趋势、可用率统计
- **SSL 证书监控**: 自动检查证书过期
- **关键字匹配**: 检测页面内容
- **历史记录**: 完整的检查历史和告警记录

## 技术栈

- **后端**: NestJS + TypeScript + TypeORM + PostgreSQL + Redis
- **前端**: React + Vite + Ant Design + Recharts
- **任务调度**: Bull + node-cron

## 快速开始

### 使用 Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 本地开发

1. **安装依赖**

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

2. **配置环境变量**

```bash
cp backend/.env.example backend/.env
# 编辑 .env 文件
```

3. **启动数据库和 Redis**

```bash
docker-compose up -d postgres redis
```

4. **启动后端**

```bash
cd backend
npm run start:dev
```

5. **启动前端**

```bash
cd frontend
npm run dev
```

## 访问应用

- 前端: http://localhost:5173
- 后端 API: http://localhost:3001/api/v1
- Swagger 文档: http://localhost:3001/api/docs

## API 端点

### 监控管理
- `GET /api/v1/monitors` - 获取监控列表
- `POST /api/v1/monitors` - 创建监控
- `GET /api/v1/monitors/:id` - 获取监控详情
- `PUT /api/v1/monitors/:id` - 更新监控
- `DELETE /api/v1/monitors/:id` - 删除监控
- `GET /api/v1/monitors/:id/status` - 获取监控状态
- `GET /api/v1/monitors/:id/history` - 获取检查历史
- `POST /api/v1/monitors/:id/check` - 立即检查

### 告警管理
- `GET /api/v1/alerts` - 获取告警列表
- `POST /api/v1/alerts/:id/acknowledge` - 确认告警
- `POST /api/v1/alerts/:id/resolve` - 解决告警

### 告警渠道
- `GET /api/v1/alert-channels` - 获取渠道列表
- `POST /api/v1/alert-channels` - 创建渠道
- `POST /api/v1/alert-channels/:id/test` - 测试渠道

### 仪表盘
- `GET /api/v1/dashboard/overview` - 获取概览数据
- `GET /api/v1/dashboard/status-distribution` - 状态分布
- `GET /api/v1/dashboard/uptime-trend` - 可用率趋势

## 项目结构

```
sitemonitor/
├── backend/              # NestJS 后端
│   ├── src/
│   │   ├── entities/     # TypeORM 实体
│   │   ├── modules/      # 业务模块
│   │   ├── config/       # 配置文件
│   │   └── main.ts       # 入口文件
│   └── Dockerfile
├── frontend/             # React 前端
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── pages/        # 页面
│   │   └── services/     # API 服务
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 许可证

MIT
