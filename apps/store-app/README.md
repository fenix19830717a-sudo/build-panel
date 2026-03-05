# StoreApp - 电商独立站系统

## 简介

StoreApp 是一个功能完整的电商独立站解决方案，为中小企业提供快速搭建在线商城的能力。支持多租户架构，每个租户可以拥有独立的电商网站，包含商品管理、订单管理、购物车、支付等完整的电商功能。

主要功能：
- 完整的商品管理和展示
- 购物车和结算流程
- 订单管理和物流跟踪
- 会员系统和积分
- 促销活动和优惠券
- AI 辅助的商品推荐和描述生成

## 功能特性

### 前端商城
- ✅ **首页展示** - Hero 区域、产品轮播、分类导航
- ✅ **商品列表** - 筛选、排序、分页、关键词搜索
- ✅ **商品详情** - 图片画廊、规格选择、库存显示
- ✅ **购物车** - 添加、修改数量、删除、批量操作
- ✅ **结算流程** - 地址管理、配送方式、支付方式
- ✅ **会员中心** - 订单历史、收货地址、个人资料
- ✅ **AI 推荐** - 基于浏览历史的智能推荐

### 管理后台
- ✅ **Dashboard** - 销售统计、订单概览、访客数据
- ✅ **商品管理** - CRUD、批量导入/导出、库存管理
- ✅ **订单管理** - 订单处理、发货、退款、打印
- ✅ **分类管理** - 多级分类、分类属性
- ✅ **会员管理** - 会员列表、等级、积分
- ✅ **营销工具** - 优惠券、满减活动、限时折扣
- ✅ **数据分析** - 销售报表、商品分析、流量分析

### AI 功能
- ✅ **AI 商品描述** - 自动生成商品详情
- ✅ **AI 翻译** - 多语言商品信息
- ✅ **AI 推荐** - 智能商品推荐
- ✅ **AI 客服** - 智能问答和导购

## 技术栈

### 后端
- **Framework**: NestJS 10
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL 14+
- **Cache**: Redis
- **Auth**: JWT + Passport
- **API Docs**: Swagger/OpenAPI

### 前端（用户端）
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **State**: Zustand
- **Icons**: Lucide React

### 管理后台
- **Framework**: React 18
- **UI Library**: Ant Design + ProComponents
- **Build Tool**: Vite
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
cd apps/store-app/backend
npm install

# 前端
cd ../frontend
npm install

# 管理后台
cd ../admin
npm install
```

### 环境配置

```bash
# 后端配置
cd apps/store-app/backend
cp .env.example .env

# 编辑 .env 文件，配置：
# - 数据库连接
# - Redis 连接
# - JWT 密钥
# - 支付配置（可选）
```

### 数据库初始化

```bash
cd apps/store-app/backend
npm run migration:run
```

### 启动开发服务器

```bash
# 后端 (端口 3000)
cd apps/store-app/backend
npm run start:dev

# 前端 (端口 5173)
cd apps/store-app/frontend
npm run dev

# 管理后台 (端口 3001)
cd apps/store-app/admin
npm run dev
```

### 生产构建

```bash
# 后端
cd apps/store-app/backend
npm run build

# 前端
cd apps/store-app/frontend
npm run build

# 管理后台
cd apps/store-app/admin
npm run build
```

## API 文档

启动后端后访问：
```
http://localhost:3000/api/docs
```

### 主要 API

#### 认证
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `GET /api/v1/auth/me` - 获取当前用户

#### 商品
- `GET /api/v1/products` - 商品列表
- `GET /api/v1/products/:id` - 商品详情
- `POST /api/v1/products` - 创建商品（Admin）
- `PUT /api/v1/products/:id` - 更新商品（Admin）
- `DELETE /api/v1/products/:id` - 删除商品（Admin）

#### 购物车
- `GET /api/v1/cart` - 获取购物车
- `POST /api/v1/cart/items` - 添加商品
- `PUT /api/v1/cart/items/:id` - 更新数量
- `DELETE /api/v1/cart/items/:id` - 删除商品

#### 订单
- `GET /api/v1/orders` - 订单列表
- `POST /api/v1/orders` - 创建订单
- `GET /api/v1/orders/:id` - 订单详情
- `PUT /api/v1/orders/:id/status` - 更新订单状态（Admin）

#### 分类
- `GET /api/v1/categories` - 分类列表
- `GET /api/v1/categories/:id` - 分类详情
- `POST /api/v1/categories` - 创建分类（Admin）

#### AI
- `POST /api/v1/ai/products/generate` - AI 生成商品描述
- `POST /api/v1/ai/products/translate` - AI 翻译
- `POST /api/v1/ai/recommendations` - AI 推荐商品

## 部署

### Docker 部署

```bash
cd apps/store-app
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
   DB_DATABASE=storeapp
   JWT_SECRET=your_jwt_secret
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

2. **配置 Nginx**
   ```nginx
   server {
       listen 80;
       server_name shop.yourdomain.com;
       
       location / {
           root /path/to/store-app/frontend/dist;
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
apps/store-app/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/         # 认证模块
│   │   │   ├── users/        # 用户模块
│   │   │   ├── products/     # 商品模块
│   │   │   ├── categories/   # 分类模块
│   │   │   ├── cart/         # 购物车模块
│   │   │   ├── orders/       # 订单模块
│   │   │   ├── payments/     # 支付模块
│   │   │   └── ai/           # AI 模块
│   │   ├── database/
│   │   └── main.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # 组件
│   │   ├── pages/            # 页面
│   │   ├── stores/           # Zustand stores
│   │   └── App.tsx
│   └── package.json
├── admin/
│   ├── src/
│   │   ├── pages/            # 管理页面
│   │   └── App.tsx
│   └── package.json
└── docker-compose.yml
```

## 数据库实体

```
User (用户)
├── Cart (购物车) - 1:1
│   └── CartItem - 1:N
├── Order (订单) - 1:N
│   └── OrderItem - 1:N
└── Address (地址) - 1:N

Product (商品)
├── Category (分类) - N:1
├── ProductTag (标签) - N:M
└── ProductImage (图片) - 1:N

Category (分类)
├── parent (父分类) - 自关联
└── children (子分类) - 自关联
```

## 支付集成

支持支付方式：
- 微信支付
- 支付宝
- PayPal
- Stripe

配置示例：
```bash
# 微信支付
WECHAT_APPID=your_appid
WECHAT_MCHID=your_mchid
WECHAT_KEY=your_key

# 支付宝
ALIPAY_APPID=your_appid
ALIPAY_PRIVATE_KEY=your_private_key
ALIPAY_PUBLIC_KEY=your_public_key
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
| JWT_SECRET | JWT 密钥 | 是 |
| REDIS_HOST | Redis 主机 | 是 |
| REDIS_PORT | Redis 端口 | 是 |
| AI_API_KEY | AI API Key | 否 |
| WECHAT_APPID | 微信支付 AppID | 否 |
| ALIPAY_APPID | 支付宝 AppID | 否 |

## 许可证

MIT
