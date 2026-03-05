# WebsiteTemplate - 多租户网站模板系统

## 简介

WebsiteTemplate 是 BuildAI Framework 的核心应用，提供多租户网站构建和管理能力。支持 SaaS 模式，允许用户通过子域名创建独立的网站实例，并支持自定义域名绑定。

主要功能包括：
- 多租户架构：每个租户拥有独立的数据和配置
- 主题系统：支持多套主题切换和自定义
- 内容管理：动态内容区块管理
- 产品展示：产品目录和展示功能
- 页面管理：自定义页面创建
- AI 辅助：内容生成和优化

## 功能特性

### 核心功能
- ✅ **多租户管理** - 基于子域名的租户隔离，支持自定义域名
- ✅ **主题系统** - 多主题切换，支持主题自定义配置
- ✅ **内容管理** - 动态内容区块，支持多语言
- ✅ **产品管理** - 产品目录、分类、标签管理
- ✅ **页面管理** - 自定义页面创建和编辑
- ✅ **媒体库** - 图片上传和管理
- ✅ **SEO 优化** - 页面级 SEO 配置
- ✅ **AI 功能** - 内容生成、翻译、优化建议

### 管理后台
- 租户概览 Dashboard
- 主题配置管理
- 内容区块编辑
- 产品/分类/标签管理
- 页面编辑器
- 媒体库管理
- 系统设置

### 前端展示
- 响应式设计
- 主题切换
- 动态内容渲染
- 产品展示页面
- 文章/新闻展示

## 技术栈

### 后端
- **Framework**: NestJS 10
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL 14+
- **Cache**: Redis (可选)
- **Auth**: JWT + Passport
- **API Docs**: Swagger/OpenAPI
- **Validation**: class-validator

### 前端
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI
- **Animation**: Framer Motion
- **State**: React Context
- **HTTP**: Axios

### 管理后台
- **Framework**: React 18
- **Build Tool**: Vite 5
- **UI Library**: Ant Design + ProComponents
- **State**: Zustand
- **Editor**: Rich Text Editor

## 快速开始

### 环境要求
- Node.js 20+
- PostgreSQL 14+
- Redis 7+ (可选)

### 安装依赖

```bash
# 克隆项目
cd /root/.openclaw/workspace/buildai-framework

# 安装后端依赖
cd apps/website-template/backend
npm install

# 安装前端依赖
cd ../frontend
npm install

# 安装管理后台依赖
cd ../admin
npm install
```

### 环境配置

```bash
# 后端环境配置
cd apps/website-template/backend
cp .env.example .env

# 编辑 .env 文件，配置以下关键变量：
# - 数据库连接信息
# - JWT 密钥
# - Redis 配置（可选）
```

### 数据库初始化

```bash
# 运行数据库迁移
cd apps/website-template/backend
npm run migration:run

# 或者使用 TypeORM CLI
npm run typeorm -- migration:run -d src/database/data-source.ts
```

### 启动开发服务器

```bash
# 启动后端 (端口 3000)
cd apps/website-template/backend
npm run start:dev

# 启动前端 (端口 5173)
cd apps/website-template/frontend
npm run dev

# 启动管理后台 (端口 3001)
cd apps/website-template/admin
npm run dev
```

### 生产构建

```bash
# 后端构建
cd apps/website-template/backend
npm run build

# 前端构建
cd apps/website-template/frontend
npm run build

# 管理后台构建
cd apps/website-template/admin
npm run build
```

## API 文档

启动后端服务后，访问 Swagger 文档：

```
http://localhost:3000/api/docs
```

### 主要 API 模块

#### 认证模块
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/refresh` - 刷新 Token
- `POST /api/v1/auth/logout` - 用户登出

#### 租户模块
- `GET /api/v1/tenants` - 获取租户列表
- `POST /api/v1/tenants` - 创建租户
- `GET /api/v1/tenants/:id` - 获取租户详情
- `PUT /api/v1/tenants/:id` - 更新租户
- `DELETE /api/v1/tenants/:id` - 删除租户

#### 主题模块
- `GET /api/v1/themes` - 获取主题列表
- `POST /api/v1/themes` - 创建主题
- `PUT /api/v1/themes/:id` - 更新主题
- `POST /api/v1/themes/:id/activate` - 激活主题

#### 内容模块
- `GET /api/v1/contents` - 获取内容列表
- `POST /api/v1/contents` - 创建内容
- `PUT /api/v1/contents/:id` - 更新内容
- `GET /api/v1/contents/:key` - 根据 key 获取内容

#### 产品模块
- `GET /api/v1/products` - 获取产品列表
- `POST /api/v1/products` - 创建产品
- `GET /api/v1/products/:id` - 获取产品详情
- `PUT /api/v1/products/:id` - 更新产品
- `DELETE /api/v1/products/:id` - 删除产品

#### 页面模块
- `GET /api/v1/pages` - 获取页面列表
- `POST /api/v1/pages` - 创建页面
- `GET /api/v1/pages/:slug` - 根据 slug 获取页面
- `PUT /api/v1/pages/:id` - 更新页面

#### AI 模块
- `POST /api/v1/ai/content/generate` - AI 生成内容
- `POST /api/v1/ai/content/translate` - AI 翻译内容
- `POST /api/v1/ai/seo/optimize` - AI SEO 优化建议

## 部署

### Docker 部署

```bash
# 使用 Docker Compose 部署
cd apps/website-template
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 生产环境部署步骤

1. **准备服务器**
   - Linux 服务器 (Ubuntu 22.04 LTS 推荐)
   - 安装 Docker 和 Docker Compose
   - 配置域名解析

2. **配置环境变量**
   ```bash
   # 生产环境 .env
   NODE_ENV=production
   PORT=3000
   DB_HOST=postgres
   DB_PORT=5432
   DB_USERNAME=buildai
   DB_PASSWORD=your_secure_password
   DB_DATABASE=website_template
   JWT_SECRET=your_production_jwt_secret
   JWT_EXPIRES_IN=7d
   ```

3. **启动服务**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **配置 Nginx 反向代理** (如需要)
   ```nginx
   server {
       listen 80;
       server_name *.buildai.local;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

5. **配置 SSL** (推荐使用 Let's Encrypt)
   ```bash
   certbot --nginx -d buildai.local -d *.buildai.local
   ```

## 目录结构

```
apps/website-template/
├── backend/                 # 后端 API
│   ├── src/
│   │   ├── modules/        # 业务模块
│   │   │   ├── auth/       # 认证模块
│   │   │   ├── tenants/    # 租户模块
│   │   │   ├── themes/     # 主题模块
│   │   │   ├── contents/   # 内容模块
│   │   │   ├── products/   # 产品模块
│   │   │   ├── pages/      # 页面模块
│   │   │   ├── media/      # 媒体模块
│   │   │   └── ai/         # AI 功能模块
│   │   ├── database/
│   │   │   ├── entities/   # 数据库实体
│   │   │   ├── migrations/ # 数据库迁移
│   │   │   └── data-source.ts
│   │   ├── common/         # 公共工具
│   │   └── main.ts         # 入口文件
│   ├── .env.example
│   └── package.json
├── frontend/               # 前端展示
│   ├── src/
│   │   ├── components/     # 组件
│   │   │   ├── sections/   # 页面区块
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   └── Layout/
│   │   ├── pages/          # 页面
│   │   ├── contexts/       # React Context
│   │   └── App.tsx
│   └── package.json
├── admin/                  # 管理后台
│   ├── src/
│   │   ├── pages/          # 管理页面
│   │   ├── components/     # 组件
│   │   └── App.tsx
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 数据库实体关系

```
Tenant (租户)
├── Theme (主题) - N:1
├── Content (内容) - 1:N
├── Product (产品) - 1:N
│   └── ProductCategory (分类) - N:1
│   └── ProductTag (标签) - N:M
├── Page (页面) - 1:N
└── Media (媒体) - 1:N
```

## 环境变量说明

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| NODE_ENV | 运行环境 | development | 是 |
| PORT | 服务端口 | 3000 | 是 |
| DB_HOST | 数据库主机 | localhost | 是 |
| DB_PORT | 数据库端口 | 5432 | 是 |
| DB_USERNAME | 数据库用户名 | postgres | 是 |
| DB_PASSWORD | 数据库密码 | - | 是 |
| DB_DATABASE | 数据库名称 | website_template | 是 |
| JWT_SECRET | JWT 密钥 | - | 是 |
| JWT_EXPIRES_IN | JWT 过期时间 | 7d | 否 |
| REDIS_HOST | Redis 主机 | localhost | 否 |
| REDIS_PORT | Redis 端口 | 6379 | 否 |
| UPLOAD_DIR | 上传目录 | uploads | 否 |
| MAX_FILE_SIZE | 最大文件大小 | 10485760 | 否 |

## 许可证

MIT
