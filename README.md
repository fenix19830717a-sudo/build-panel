# BuildAI Framework

一个功能完整的 B2B SaaS 开发框架，提供多租户应用开发、部署和管理能力。支持企业官网、电商商城、内容管理、智能客服等多种应用场景，集成 AI 能力，帮助开发者快速构建现代化的 SaaS 产品。

## 系统架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BuildAI SaaS Platform                          │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────────────┐ │
│  │   Web UI     │   │   API GW     │   │      Admin Dashboard         │ │
│  │  (React)     │◄──┤  (Nginx)     │──►│   (System Management)        │ │
│  └──────────────┘   └──────┬───────┘   └──────────────────────────────┘ │
└────────────────────────────┼────────────────────────────────────────────┘
                             │ HTTPS/WSS
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Controller Service (NestJS)                         │
│                    SaaS 中控服务 - 租户/应用/资源管理                      │
└────────────────────────────┬────────────────────────────────────────────┘
                             │ mTLS + gRPC/HTTP2
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       Data Layer (PostgreSQL + Redis)                    │
└─────────────────────────────────────────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│       Agent Node #1         │   │       Agent Node #2         │
│  ┌───────────────────────┐  │   │  ┌───────────────────────┐  │
│  │     Agent Service     │  │   │  │     Agent Service     │  │
│  │  ┌─────────────────┐  │  │   │  │  ┌─────────────────┐  │  │
│  │  │ WebsiteTemplate │  │  │   │  │  │    StoreApp     │  │  │
│  │  │    CMSApp       │  │  │   │  │  │  ChatService    │  │  │
│  │  │    (Docker)     │  │  │   │  │  │  PolymarketBot  │  │  │
│  │  └─────────────────┘  │  │   │  │  └─────────────────┘  │  │
│  └───────────────────────┘  │   │  └───────────────────────┘  │
└─────────────────────────────┘   └─────────────────────────────┘
```

## 应用矩阵

| 应用 | 类型 | 描述 | 技术栈 |
|------|------|------|--------|
| [WebsiteTemplate](apps/website-template) | 核心应用 | 多租户网站模板系统 | NestJS + React + PostgreSQL |
| [StoreApp](apps/store-app) | 电商 | 电商独立站解决方案 | NestJS + React + TypeORM |
| [CMSApp](apps/cms-app) | 内容管理 | 企业内容管理系统 | NestJS + React + PostgreSQL |
| [ChatService](apps/chat-service) | 客服 | 智能客服系统 | NestJS + Socket.io + React |
| [SiteMonitor](apps/sitemonitor) | 运维工具 | 网站可用性监控 | NestJS + React + Redis |
| [LogCollector](apps/logcollector) | 运维工具 | 日志收集分析平台 | NestJS + Elasticsearch + React |
| [DBBackup](apps/dbbackup) | 运维工具 | 数据库备份管理 | NestJS + React |
| [ServerManager](apps/server-manager) | 运维工具 | 服务器 Web 管理 | Express + React + WebSocket |
| [PolymarketBot](apps/polymarket-bot) | 交易机器人 | 预测市场自动交易 | Python + FastAPI |

## 功能特性

### 核心功能
- ✅ **多租户架构** - 基于子域名的租户隔离，支持自定义域名
- ✅ **主题系统** - 多套主题切换，支持自定义配置
- ✅ **AI 集成** - 内容生成、翻译、SEO 优化、智能客服
- ✅ **应用市场** - 一键部署应用到远程服务器
- ✅ **权限管理** - RBAC 基于角色的权限控制

### 电商功能
- ✅ **商品管理** - 完整的商品目录管理
- ✅ **订单系统** - 订单处理、物流跟踪
- ✅ **营销工具** - 优惠券、满减活动
- ✅ **AI 推荐** - 智能商品推荐

### 内容管理
- ✅ **文章管理** - 富文本编辑、分类标签
- ✅ **媒体库** - 图片上传和管理
- ✅ **SEO 优化** - 完整的 SEO 字段配置
- ✅ **全文搜索** - 基于 Elasticsearch 的搜索

### 客服系统
- ✅ **实时聊天** - WebSocket 双向通信
- ✅ **AI 自动回复** - 基于知识库的自动回答
- ✅ **工单系统** - 完整的工单管理
- ✅ **多渠道** - 网页组件、API 接入

### 运维工具
- ✅ **网站监控** - HTTP/HTTPS/TCP/Ping 监控
- ✅ **日志收集** - 集中式日志管理
- ✅ **数据库备份** - 自动备份和恢复
- ✅ **服务器管理** - Web 终端、文件管理

## 技术栈

### 后端
- **Framework**: NestJS 10
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **Cache**: Redis 7+
- **Search**: Elasticsearch 8+
- **ORM**: TypeORM
- **API Docs**: Swagger/OpenAPI

### 前端
- **Framework**: React 18/19
- **Build Tool**: Vite 5
- **Language**: TypeScript
- **UI Library**: Ant Design / Tailwind CSS
- **State**: Zustand / React Context

### 基础设施
- **Container**: Docker + Docker Compose
- **Web Server**: Nginx
- **Message Queue**: Redis / Bull
- **Object Storage**: MinIO

## 快速开始

### 环境要求
- Node.js 20+
- PostgreSQL 14+
- Redis 7+
- Docker 24+ (可选)

### 完整部署

```bash
# 克隆仓库
git clone https://github.com/your-org/buildai-framework.git
cd buildai-framework

# 启动完整环境
docker-compose up -d

# 查看状态
docker-compose ps
```

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问
# - Web UI: http://localhost:3000
# - API: http://localhost:3001
# - API Docs: http://localhost:3001/api/docs
```

## 项目结构

```
buildai-framework/
├── framework/              # 核心框架
│   ├── controller/         # 中控服务 (NestJS)
│   │   ├── src/
│   │   │   ├── modules/    # 业务模块
│   │   │   │   ├── auth/   # 认证模块
│   │   │   │   ├── users/  # 用户管理
│   │   │   │   ├── tenants/# 租户管理
│   │   │   │   ├── apps/   # 应用管理
│   │   │   │   └── ai/     # AI 功能
│   │   │   └── main.ts
│   │   └── package.json
│   ├── web/                # Web 前端 (React)
│   └── sdk/                # 应用开发 SDK
│
├── apps/                   # 应用集合
│   ├── website-template/   # 多租户网站模板
│   ├── store-app/          # 电商独立站
│   ├── cms-app/            # 内容管理系统
│   ├── chat-service/       # 智能客服系统
│   ├── sitemonitor/        # 网站监控
│   ├── logcollector/       # 日志收集
│   ├── dbbackup/           # 数据库备份
│   ├── server-manager/     # 服务器管理
│   └── polymarket-bot/     # 交易机器人
│
├── docs/                   # 文档
│   ├── ARCHITECTURE.md     # 架构文档
│   ├── DEPLOYMENT.md       # 部署文档
│   ├── user-guide.md       # 用户指南
│   ├── DESIGN.md           # 设计文档
│   └── SPEC.md             # 规格说明书
│
├── deploy/                 # 部署配置
│   ├── docker-compose.yml
│   └── nginx.conf
│
└── README.md
```

## 文档

### 开发文档
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - 系统架构设计
- [DESIGN.md](docs/DESIGN.md) - 系统设计文档
- [SPEC.md](docs/SPEC.md) - 项目规格说明书

### 部署文档
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - 部署指南
- [Docker 部署](#docker-部署) - 快速 Docker 部署

### 用户文档
- [user-guide.md](docs/user-guide.md) - 用户操作手册

### 应用文档
每个应用都有独立的 README.md，包含详细的安装和使用说明：
- [WebsiteTemplate](apps/website-template/README.md)
- [StoreApp](apps/store-app/README.md)
- [CMSApp](apps/cms-app/README.md)
- [ChatService](apps/chat-service/README.md)
- [SiteMonitor](apps/sitemonitor/README.md)
- [LogCollector](apps/logcollector/README.md)
- [DBBackup](apps/dbbackup/README.md)
- [ServerManager](apps/server-manager/README.md)
- [PolymarketBot](apps/polymarket-bot/README.md)

## Docker 部署

### 开发环境

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 生产环境

```bash
# 使用生产配置
docker-compose -f docker-compose.prod.yml up -d

# 查看状态
docker-compose -f docker-compose.prod.yml ps
```

### 仅启动特定应用

```bash
# 启动 WebsiteTemplate
cd apps/website-template
docker-compose up -d

# 启动 StoreApp
cd apps/store-app
docker-compose up -d
```

## 环境变量

### 核心配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| NODE_ENV | 运行环境 | development |
| PORT | 服务端口 | 3000 |
| JWT_SECRET | JWT 密钥 | - |
| DB_HOST | 数据库主机 | localhost |
| DB_PORT | 数据库端口 | 5432 |
| DB_USERNAME | 数据库用户名 | postgres |
| DB_PASSWORD | 数据库密码 | - |
| REDIS_HOST | Redis 主机 | localhost |
| REDIS_PORT | Redis 端口 | 6379 |

详见 [DEPLOYMENT.md](docs/DEPLOYMENT.md) 获取完整的环境变量说明。

## 贡献指南

### 代码规范
- 使用 TypeScript 编写代码
- 遵循 ESLint 和 Prettier 配置
- 编写单元测试
- 提交信息遵循 Conventional Commits

### 提交代码

```bash
# 创建分支
git checkout -b feature/your-feature

# 提交更改
git add .
git commit -m "feat: add new feature"

# 推送分支
git push origin feature/your-feature

# 创建 Pull Request
```

## 路线图

### Phase 1 - 框架核心 ✅
- [x] 多租户架构
- [x] 用户认证授权
- [x] 主题系统
- [x] 基础 AI 功能

### Phase 2 - 核心应用 ✅
- [x] WebsiteTemplate
- [x] StoreApp
- [x] CMSApp
- [x] ChatService

### Phase 3 - 运维工具 ✅
- [x] SiteMonitor
- [x] LogCollector
- [x] DBBackup
- [x] ServerManager

### Phase 4 - 高级功能 🚧
- [ ] 工作流引擎
- [ ] 数据分析平台
- [ ] 更多 AI 功能
- [ ] 移动端 App

## 许可证

MIT License

Copyright (c) 2024 BuildAI Framework

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 支持

- 文档：https://docs.buildai.local
- 社区：https://community.buildai.local
- 邮箱：support@buildai.local

---

**BuildAI Framework** - 让 SaaS 开发更简单 🚀
