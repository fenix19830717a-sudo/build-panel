# CMSApp - 内容管理系统

## 简介

CMSApp 是一个现代化的内容管理系统，专为构建企业官网、博客、新闻站点等内容驱动型网站而设计。提供完整的内容创作、分类管理、标签系统、媒体管理等功能。

主要功能包括：
- 文章管理：支持富文本编辑、草稿/发布状态
- 分类管理：树形分类结构，支持无限层级
- 标签系统：文章标签化管理
- 媒体库：图片上传和管理
- AI 辅助：内容生成、摘要生成、SEO 优化
- SEO 优化：完善的 SEO 字段配置

## 功能特性

### 核心功能
- ✅ **文章管理** - 创建、编辑、发布文章，支持富文本编辑
- ✅ **分类管理** - 树形分类结构，无限层级嵌套
- ✅ **标签系统** - 文章标签化管理，支持标签云
- ✅ **媒体库** - 图片上传、管理，支持缩略图
- ✅ **SEO 优化** - 自定义 meta 标题、描述、关键词
- ✅ **AI 功能** - 文章生成、摘要提取、SEO 建议
- ✅ **搜索功能** - 全文搜索，支持高亮
- ✅ **统计功能** - 文章浏览量统计

### 前端展示
- 响应式设计
- 文章列表页
- 文章详情页
- 分类浏览
- 标签云
- 搜索页面

### 管理后台
- Dashboard 统计
- 文章管理
- 分类管理
- 标签管理
- 媒体库
- 系统设置

## 技术栈

### 后端
- **Framework**: NestJS 10
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL 14+
- **Auth**: JWT + Passport
- **API Docs**: Swagger/OpenAPI
- **AI Integration**: OpenAI API

### 前端
- **Framework**: React 19
- **Build Tool**: Vite 5
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP**: Axios
- **Routing**: React Router v7

## 快速开始

### 环境要求
- Node.js 20+
- PostgreSQL 14+

### 安装依赖

```bash
# 克隆项目
cd /root/.openclaw/workspace/buildai-framework

# 安装后端依赖
cd apps/cms-app/backend
npm install

# 安装前端依赖
cd ../frontend
npm install

# 安装管理后台依赖（如存在）
cd ../admin
npm install
```

### 环境配置

```bash
# 后端环境配置
cd apps/cms-app/backend
cp .env .env.local

# 编辑 .env.local 文件
# 配置数据库连接信息
# 配置 AI API Key（可选）
```

### 数据库初始化

```bash
# 运行数据库迁移
cd apps/cms-app/backend
npm run typeorm migration:run
```

### 启动开发服务器

```bash
# 启动后端 (端口 3000)
cd apps/cms-app/backend
npm run start:dev

# 启动前端 (端口 5173)
cd apps/cms-app/frontend
npm run dev
```

### 生产构建

```bash
# 后端构建
cd apps/cms-app/backend
npm run build

# 前端构建
cd apps/cms-app/frontend
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

#### 文章模块
- `GET /api/v1/articles` - 获取文章列表
- `POST /api/v1/articles` - 创建文章
- `GET /api/v1/articles/:id` - 获取文章详情
- `GET /api/v1/articles/slug/:slug` - 根据 slug 获取文章
- `PUT /api/v1/articles/:id` - 更新文章
- `DELETE /api/v1/articles/:id` - 删除文章
- `POST /api/v1/articles/:id/publish` - 发布文章

#### 分类模块
- `GET /api/v1/categories` - 获取分类列表
- `POST /api/v1/categories` - 创建分类
- `GET /api/v1/categories/tree` - 获取分类树
- `PUT /api/v1/categories/:id` - 更新分类
- `DELETE /api/v1/categories/:id` - 删除分类

#### 标签模块
- `GET /api/v1/tags` - 获取标签列表
- `POST /api/v1/tags` - 创建标签
- `GET /api/v1/tags/:id` - 获取标签详情
- `PUT /api/v1/tags/:id` - 更新标签
- `DELETE /api/v1/tags/:id` - 删除标签
- `GET /api/v1/tags/cloud` - 获取标签云

#### 媒体模块
- `POST /api/v1/media/upload` - 上传文件
- `GET /api/v1/media` - 获取媒体列表
- `DELETE /api/v1/media/:id` - 删除媒体

#### AI 模块
- `POST /api/v1/ai/articles/generate` - AI 生成文章
- `POST /api/v1/ai/articles/summarize` - AI 生成摘要
- `POST /api/v1/ai/seo/suggest` - AI SEO 建议

## 部署

### Docker 部署

```bash
# 使用 Docker Compose 部署
cd apps/cms-app
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 生产环境部署

1. **准备服务器**
   - Linux 服务器
   - 安装 Node.js 20+
   - 安装 PostgreSQL 14+
   - 配置 Nginx

2. **配置环境变量**
   ```bash
   # 生产环境配置
   NODE_ENV=production
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_secure_password
   DB_NAME=cms_app
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRATION=7d
   AI_API_KEY=your_openai_api_key
   ```

3. **启动服务**
   ```bash
   # 启动后端
   cd backend
   npm run build
   npm run start:prod
   
   # 前端静态文件通过 Nginx 提供
   ```

4. **配置 Nginx**
   ```nginx
   server {
       listen 80;
       server_name cms.yourdomain.com;
       
       location / {
           root /path/to/cms-app/frontend/dist;
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 目录结构

```
apps/cms-app/
├── backend/                 # 后端 API
│   ├── src/
│   │   ├── modules/        # 业务模块
│   │   │   ├── auth/       # 认证模块
│   │   │   ├── articles/   # 文章模块
│   │   │   ├── categories/ # 分类模块
│   │   │   ├── tags/       # 标签模块
│   │   │   ├── media/      # 媒体模块
│   │   │   └── ai/         # AI 功能模块
│   │   ├── database/       # 数据库配置
│   │   └── main.ts         # 入口文件
│   ├── .env
│   └── package.json
├── frontend/               # 前端展示
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   ├── layouts/        # 布局
│   │   └── services/       # API 服务
│   └── package.json
├── admin/                  # 管理后台（如存在）
│   └── src/
├── docker-compose.yml
└── README.md
```

## 数据库实体关系

```
Category (分类)
├── parent (父分类) - 自关联
├── children (子分类) - 自关联
└── articles (文章) - 1:N

Article (文章)
├── category (分类) - N:1
├── tags (标签) - N:M
└── author (作者) - N:1

Tag (标签)
└── articles (文章) - N:M

Media (媒体)
└── 独立实体，用于图片管理
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
| DB_NAME | 数据库名称 | cms_app | 是 |
| JWT_SECRET | JWT 密钥 | - | 是 |
| JWT_EXPIRATION | JWT 过期时间 | 7d | 否 |
| AI_API_KEY | OpenAI API Key | - | 否 |
| AI_API_URL | AI API 地址 | https://api.openai.com/v1 | 否 |
| AI_MODEL | AI 模型 | gpt-4 | 否 |

## 许可证

MIT
