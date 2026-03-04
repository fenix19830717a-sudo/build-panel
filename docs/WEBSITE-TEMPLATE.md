# BuildAI Framework - 独立站模板设计

## 核心理念
**一个模板，无限可能**

客户使用流程：
1. 选择独立站模板
2. 配置主题/颜色/内容
3. 一键部署到服务器
4. 拥有自己的独立站

---

## 模板架构

```
apps/website-template/
├── frontend/              # 前端模板 (可切换主题)
│   ├── src/
│   │   ├── themes/        # 主题库
│   │   │   ├── default/   # 默认主题
│   │   │   ├── elegant/   # 优雅主题 (珠宝/奢侈品)
│   │   │   ├── modern/    # 现代主题 (科技/B2B)
│   │   │   ├── minimal/   # 极简主题 (设计/艺术)
│   │   │   └── luxury/    # 奢华主题 (高端定制)
│   │   ├── pages/         # 页面组件
│   │   │   ├── Home/      # 首页
│   │   │   ├── About/     # 关于我们
│   │   │   ├── Products/  # 产品/服务
│   │   │   ├── News/      # 新闻/博客
│   │   │   ├── Contact/   # 联系我们
│   │   │   └── Custom/    # 自定义页面
│   │   └── App.tsx
│   └── package.json
│
├── admin/                 # 管理后台
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard/     # 仪表盘
│   │   │   ├── Theme/         # 主题配置
│   │   │   ├── Content/       # 内容管理
│   │   │   ├── Products/      # 产品管理
│   │   │   ├── Pages/         # 页面管理
│   │   │   ├── Media/         # 媒体库
│   │   │   ├── SEO/           # SEO设置
│   │   │   ├── Settings/      # 站点设置
│   │   │   └── AI/            # AI助手
│   │   └── App.tsx
│   └── package.json
│
├── backend/               # 后端API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── tenants/       # 多租户管理
│   │   │   ├── themes/        # 主题管理
│   │   │   ├── contents/      # 内容管理
│   │   │   ├── products/      # 产品管理
│   │   │   ├── pages/         # 页面管理
│   │   │   ├── media/         # 媒体管理
│   │   │   ├── seo/           # SEO管理
│   │   │   ├── settings/      # 站点设置
│   │   │   └── ai/            # AI接口
│   │   └── main.ts
│   └── package.json
│
├── database/
│   └── migrations/
│       ├── 001_tenants.sql
│       ├── 002_themes.sql
│       ├── 003_contents.sql
│       ├── 004_products.sql
│       └── 005_pages.sql
│
└── docker-compose.yml     # 一键部署
```

---

## 主题系统

### 主题配置 (theme.config.json)
```json
{
  "name": "elegant",
  "colors": {
    "primary": "#1a1a1a",
    "secondary": "#c9a962",
    "background": "#ffffff",
    "text": "#333333",
    "accent": "#d4af37"
  },
  "fonts": {
    "heading": "Playfair Display",
    "body": "Inter"
  },
  "layout": {
    "maxWidth": "1400px",
    "header": "fixed",
    "footer": "minimal"
  },
  "components": {
    "button": "rounded",
    "card": "shadow",
    "image": "rounded"
  }
}
```

### 主题预览
| 主题 | 适用行业 | 特点 |
|------|---------|------|
| **Default** | 通用 | 简洁现代 |
| **Elegant** | 珠宝/奢侈品 | 优雅金色、大图展示 |
| **Modern** | 科技/B2B | 深蓝科技感 |
| **Minimal** | 设计/艺术 | 大量留白、排版 |
| **Luxury** | 高端定制 | 黑色金色、沉浸感 |

---

## 多租户设计

### 数据库设计 (PostgreSQL)
```sql
-- 租户表
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  domain VARCHAR(255) UNIQUE,      -- 独立域名
  subdomain VARCHAR(100) UNIQUE,   -- 子域名
  theme_id UUID,
  settings JSONB,                   -- 站点配置
  status VARCHAR(20),
  created_at TIMESTAMP
);

-- 内容表 (带 tenant_id)
CREATE TABLE contents (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  key VARCHAR(100),                 -- hero_title, about_text
  value JSONB,
  language VARCHAR(10),
  updated_at TIMESTAMP
);

-- 产品表 (带 tenant_id)
CREATE TABLE products (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255),
  description TEXT,
  images JSONB,
  price DECIMAL(10,2),
  category_id UUID,
  status VARCHAR(20),
  created_at TIMESTAMP
);
```

### 租户隔离
- 行级安全策略 (RLS)
- 请求头 `X-Tenant-ID` 自动过滤
- 每个租户独立数据空间

---

## AI API 接口

### 内容生成
```typescript
// POST /api/v1/ai/content/generate
{
  "type": "hero_title",
  "industry": "jewelry",
  "keywords": ["luxury", "gold", "handmade"],
  "language": "zh-CN"
}

// Response
{
  "content": "臻选手工金饰，传承百年工艺",
  "alternatives": ["奢华金饰，匠心独运", ...]
}
```

### 产品描述
```typescript
// POST /api/v1/ai/products/description
{
  "product_name": "18K Gold Necklace",
  "features": ["handmade", "vintage design", "natural pearl"],
  "tone": "luxury"
}

// Response
{
  "description": "这款18K金项链采用传统手工打造...",
  "highlights": ["纯手工打造", "复古设计", "天然珍珠"],
  "seo_keywords": ["18K金项链", "手工珠宝", ...]
}
```

### 多语言翻译
```typescript
// POST /api/v1/ai/translate
{
  "content": "欢迎来到我们的珠宝店",
  "target_language": "en",
  "context": "website_header"
}
```

### SEO优化
```typescript
// POST /api/v1/ai/seo/optimize
{
  "title": "珠宝店",
  "description": "我们卖珠宝",
  "keywords": ["珠宝", "金饰"]
}

// Response
{
  "title": "高端手工珠宝定制 | 18K金饰专家",
  "description": "传承百年工艺，匠心打造每一件18K金饰...",
  "keywords": ["手工珠宝", "18K金", "定制首饰", ...]
}
```

### 图片生成
```typescript
// POST /api/v1/ai/images/generate
{
  "prompt": "luxury gold jewelry on black velvet",
  "size": "1920x1080",
  "style": "product_photography"
}
```

---

## 管理后台功能

### 1. 主题配置
- 选择预设主题
- 自定义颜色
- 上传Logo/Favicon
- 字体选择
- 布局设置

### 2. 内容管理
- 首页内容编辑
- 关于我们
- 服务介绍
- 自定义页面
- AI一键生成内容

### 3. 产品管理
- 产品CRUD
- 分类管理
- 图片上传
- AI生成产品描述
- 批量导入/导出

### 4. 页面管理
- 导航菜单
- 页面结构
- SEO设置
- 自定义代码 (CSS/JS)

### 5. 媒体库
- 图片管理
- AI生成图片
- 批量上传
- 图片优化

### 6. SEO设置
- 站点标题/描述
- 关键词
- Robots.txt
- Sitemap
- AI SEO优化建议

### 7. AI助手
- 一键生成全站内容
- 智能推荐产品描述
- SEO优化建议
- 多语言翻译

---

## 一键部署流程

### 1. 创建租户
```bash
POST /api/v1/admin/tenants
{
  "name": "Fara Global Jewelry",
  "domain": "faraglobal.com"
}
```

### 2. 配置主题
在管理后台选择主题，自定义颜色

### 3. 生成内容
使用AI助手一键生成：
- 首页文案
- 产品描述
- 关于我们
- SEO设置

### 4. 一键部署
```bash
# 自动执行：
# 1. 构建前端
# 2. 配置Nginx
# 3. 申请SSL证书
# 4. 启动容器
# 5. 配置DNS

curl -X POST /api/v1/admin/tenants/:id/deploy
```

### 5. 完成
客户获得：
- 自己的独立域名
- 完整的独立站
- 管理后台
- AI助手

---

## 扩展性

### 新增主题
1. 在 `frontend/src/themes/` 创建新主题
2. 在数据库注册主题
3. 客户即可选择使用

### 新增功能模块
- 博客系统
- 会员系统
- 预约系统
- 多语言
- 支付集成

### API扩展
```typescript
// 插件系统
POST /api/v1/plugins/install
{
  "plugin": "booking-system",
  "config": {...}
}
```
