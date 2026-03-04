# Website Template Backend

BuildAI 多租户独立站模板系统的后端 API。

## 技术栈

- **框架**: NestJS 11.x
- **数据库**: PostgreSQL + TypeORM
- **多租户**: 行级安全策略 (RLS)
- **文档**: Swagger/OpenAPI
- **AI集成**: OpenAI API (可配置)

## 项目结构

```
src/
├── database/
│   ├── entities/          # 数据库实体
│   ├── migrations/        # 数据库迁移
│   ├── data-source.ts     # TypeORM 数据源配置
│   └── database.module.ts # 数据库模块
├── common/
│   ├── middleware/        # 中间件
│   └── tenant-context/    # 多租户上下文
├── modules/
│   ├── tenants/          # 租户管理
│   ├── themes/           # 主题管理
│   ├── contents/         # 内容管理 (多租户)
│   ├── products/         # 产品管理 (多租户)
│   ├── pages/            # 页面管理 (多租户)
│   ├── media/            # 媒体管理 (多租户)
│   └── ai/               # AI 接口
├── app.module.ts
└── main.ts
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件配置数据库连接
```

### 3. 创建数据库

```bash
# 使用 PostgreSQL 创建数据库
createdb website_template

# 运行初始迁移
psql -d website_template -f src/database/migrations/001_initial_schema.sql
```

### 4. 启动开发服务器

```bash
npm run start:dev
```

## API 文档

启动后访问: http://localhost:3000/api/docs

## 多租户实现

### 1. 租户识别

- **Header**: `X-Tenant-ID: <tenant_id>`
- **Subdomain**: `tenant.example.com`
- **Custom Domain**: `tenant.com`

### 2. 数据库隔离 (RLS)

```sql
-- 启用行级安全
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 创建隔离策略
CREATE POLICY tenant_products_isolation ON products
    USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

## API 端点

### 租户管理 (Admin)

```
POST   /api/v1/admin/tenants              # 创建租户
GET    /api/v1/admin/tenants              # 租户列表
GET    /api/v1/admin/tenants/:id          # 租户详情
PUT    /api/v1/admin/tenants/:id          # 更新租户
POST   /api/v1/admin/tenants/:id/deploy   # 部署租户站点
```

### 主题管理

```
GET    /api/v1/themes                     # 可用主题列表
POST   /api/v1/admin/themes               # 创建主题
GET    /api/v1/admin/themes/:id/config    # 主题配置
```

### 内容管理

```
GET    /api/v1/contents?key=xxx           # 获取内容 (自动识别租户)
POST   /api/v1/admin/contents             # 创建内容
PUT    /api/v1/admin/contents/:id         # 更新内容
```

### 产品管理

```
GET    /api/v1/products                   # 产品列表
GET    /api/v1/products/:id               # 产品详情
POST   /api/v1/admin/products             # 创建产品
PUT    /api/v1/admin/products/:id         # 更新产品
DELETE /api/v1/admin/products/:id         # 删除产品
GET    /api/v1/product-categories         # 分类列表
GET    /api/v1/product-tags               # 标签列表
```

### 页面管理

```
GET    /api/v1/pages                      # 页面列表
GET    /api/v1/pages/:slug                # 页面详情
GET    /api/v1/pages/homepage             # 获取首页
POST   /api/v1/admin/pages                # 创建页面
PUT    /api/v1/admin/pages/:id            # 更新页面
DELETE /api/v1/admin/pages/:id            # 删除页面
```

### AI 接口

```
POST   /api/v1/ai/content/generate        # 生成内容
POST   /api/v1/ai/products/description    # 产品描述
POST   /api/v1/ai/translate               # 翻译
POST   /api/v1/ai/seo/optimize            # SEO优化
POST   /api/v1/ai/images/generate         # 生成图片
```

## 数据库实体

### Tenant (租户)
- id, name, domain, subdomain, theme_id, settings, status

### Theme (主题)
- id, name, display_name, config (colors, fonts, layout)

### Content (内容) - 多租户
- id, tenant_id, key, value, language, section

### Product (产品) - 多租户
- id, tenant_id, name, description, price, images, category_id, status

### Page (页面) - 多租户
- id, tenant_id, title, slug, content, blocks, seo, is_homepage

### Media (媒体) - 多租户
- id, tenant_id, filename, url, type, size

## 开发计划

- [x] 项目初始化
- [x] 数据库实体定义
- [x] 多租户架构
- [x] 租户管理 API
- [x] 主题管理 API
- [x] 内容管理 API
- [x] 产品管理 API
- [x] 页面管理 API
- [x] 媒体管理 API
- [x] AI 接口
- [ ] MinIO 文件存储集成
- [ ] 真实 AI API 集成
- [ ] 单元测试
- [ ] 部署脚本

## License

MIT
