# StoreApp - 电商独立站

一个现代化的电商独立站解决方案，包含用户端、管理后台和AI功能。

## 应用结构

```
apps/store-app/
├── frontend/          # 用户端前端 (React + Vite + Tailwind CSS + Framer Motion)
├── admin/             # 管理后台 (React + Ant Design)
├── backend/           # 后端API (NestJS + TypeORM + PostgreSQL)
└── database/          # 数据库迁移
```

## 技术栈

### 前端
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **State**: Zustand
- **HTTP**: Axios

### 管理后台
- **Framework**: React 18
- **UI Library**: Ant Design + ProComponents
- **Build Tool**: Vite

### 后端
- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **API Docs**: Swagger

## 功能特性

### 用户端
- ✅ 首页 Hero 区域、产品轮播
- ✅ 产品列表（筛选、排序、分页）
- ✅ 产品详情（图片画廊、规格选择）
- ✅ AI 产品推荐
- ✅ 购物车管理
- ✅ 结账流程
- ✅ 用户认证（登录/注册）
- ✅ 订单历史

### 管理后台
- ✅ Dashboard 数据概览
- ✅ 产品管理（CRUD + AI生成描述）
- ✅ 订单管理（处理、发货）
- ✅ 分类管理
- ✅ 客户管理
- ✅ 系统设置

### AI 功能
- ✅ AI 生成产品描述
- ✅ AI 翻译产品内容
- ✅ AI 商品推荐
- ✅ AI 客服聊天

## 快速开始

### 1. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install

# 管理后台
cd ../admin
npm install
```

### 2. 配置环境变量

```bash
# backend/.env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=storeapp
JWT_SECRET=your-secret-key
```

### 3. 启动服务

```bash
# 启动后端 (端口 3000)
cd backend
npm run start:dev

# 启动前端 (端口 5173)
cd frontend
npm run dev

# 启动管理后台 (端口 3001)
cd admin
npm run dev
```

### 4. 访问应用

- 用户端: http://localhost:5173
- 管理后台: http://localhost:3001
- API 文档: http://localhost:3000/api/docs

## API 端点

### 认证
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录

### 产品
- `GET /api/v1/products` - 产品列表
- `GET /api/v1/products/:id` - 产品详情
- `POST /api/v1/products` - 创建产品
- `PUT /api/v1/products/:id` - 更新产品
- `DELETE /api/v1/products/:id` - 删除产品

### 订单
- `GET /api/v1/orders` - 订单列表
- `POST /api/v1/orders` - 创建订单
- `PUT /api/v1/orders/:id` - 更新订单

### 购物车
- `GET /api/v1/cart` - 获取购物车
- `POST /api/v1/cart/items` - 添加商品
- `PUT /api/v1/cart/items/:id` - 更新商品
- `DELETE /api/v1/cart/items/:id` - 删除商品

### AI
- `POST /api/v1/ai/products/generate` - AI生成产品描述
- `POST /api/v1/ai/products/translate` - AI翻译
- `POST /api/v1/ai/recommendations` - AI商品推荐
- `POST /api/v1/ai/chat` - AI客服

## 数据库实体

- **User** - 用户
- **Product** - 产品
- **Category** - 分类
- **Order** - 订单
- **OrderItem** - 订单项
- **Cart** - 购物车
- **CartItem** - 购物车项

## 许可证

MIT
