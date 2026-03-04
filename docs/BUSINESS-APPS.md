# BuildAI Framework - 业务应用开发计划

## 应用标准（必须遵守）
每个应用必须包含：
1. **酷炫前端页面** - 面向终端用户的现代化展示界面
2. **人工管理后台** - 管理员操作界面（产品/内容/订单管理）
3. **数据库** - PostgreSQL + TypeORM
4. **AI使用的API接口** - 提供给AI Agent调用的RESTful API

---

## Phase 1: 已完成 ✅

| 应用 | 功能 | 状态 |
|------|------|------|
| ServerManager | 服务器管理工具 | ✅ 完成 |
| PolymarketBot | 交易机器人 | ✅ 完成 |

---

## Phase 2: 业务应用开发中 🏗️

### 应用 1: StoreApp (电商独立站)
**面向用户**: B2C/B2B 电商网站

**前端页面**:
- 首页 - 产品轮播、分类展示、热门商品
- 产品列表 - 筛选、排序、分页
- 产品详情 - 图片画廊、规格选择、评价
- 购物车 - 商品管理、数量调整
- 结账 - 地址、支付、订单确认
- 用户中心 - 订单历史、个人信息

**管理后台**:
- 产品管理 - CRUD、库存、上下架
- 订单管理 - 订单列表、状态更新、发货
- 分类管理 - 产品分类、属性
- 用户管理 - 客户列表、等级
- 营销工具 - 优惠券、活动

**AI API**:
- `POST /api/v1/products/ai-generate` - AI生成产品描述
- `POST /api/v1/products/ai-translate` - AI翻译多语言
- `POST /api/v1/chat/ai-reply` - AI客服回复
- `POST /api/v1/recommendations/ai` - AI商品推荐
- `GET /api/v1/analytics/ai-insights` - AI数据分析

---

### 应用 2: CMSApp (内容管理系统)
**面向用户**: 博客、新闻、企业官网

**前端页面**:
- 首页 - 文章流、热门标签
- 文章列表 - 分类筛选、搜索
- 文章详情 - 富文本内容、相关推荐
- 分类页 - 按分类浏览
- 标签云 - 标签聚合
- 搜索页 - 全文搜索

**管理后台**:
- 文章管理 - 富文本编辑、草稿、发布
- 分类管理 - 层级分类
- 标签管理 - 标签云
- 媒体库 - 图片/视频管理
- SEO设置 - 标题、描述、关键词
- 评论管理 - 审核、回复

**AI API**:
- `POST /api/v1/articles/ai-write` - AI写文章
- `POST /api/v1/articles/ai-summary` - AI生成摘要
- `POST /api/v1/seo/ai-optimize` - AI SEO优化
- `POST /api/v1/images/ai-generate` - AI生成配图
- `POST /api/v1/translate/ai` - AI多语言翻译

---

### 应用 3: ChatService (智能客服系统)
**面向用户**: 网站客服、工单系统

**前端页面**:
- 聊天窗口 - 悬浮/嵌入客服组件
- FAQ页面 - 常见问题
- 工单提交 - 问题描述、附件
- 工单追踪 - 状态查询
- 帮助中心 - 知识库浏览

**管理后台**:
- 客服工作台 - 实时聊天、转接
- 工单管理 - 分配、处理、关闭
- 知识库 - 文章管理、分类
- 机器人配置 - 意图识别、回复模板
- 数据统计 - 响应时间、满意度

**AI API**:
- `POST /api/v1/chat/ai-reply` - AI自动回复
- `POST /api/v1/tickets/ai-classify` - AI工单分类
- `POST /api/v1/knowledge/ai-build` - AI构建知识库
- `POST /api/v1/intent/ai-recognize` - AI意图识别
- `GET /api/v1/sentiment/ai-analysis` - AI情感分析

---

## Phase 3: 更多业务应用 📋

| 优先级 | 应用 | 功能 |
|--------|------|------|
| P2 | GalleryApp | 图片库管理、CDN、AI识图 |
| P2 | MemberApp | 会员系统、积分、等级 |
| P2 | BookingApp | 预约系统、日历、提醒 |
| P3 | ForumApp | 论坛社区、帖子、回复 |
| P3 | FormApp | 表单构建器、数据收集 |
| P3 | NewsletterApp | 邮件订阅、群发 |

---

## 应用结构示例 (StoreApp)

```
apps/store-app/
├── frontend/                 # 面向终端用户的前端
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home/        # 首页
│   │   │   ├── Products/    # 产品列表/详情
│   │   │   ├── Cart/        # 购物车
│   │   │   ├── Checkout/    # 结账
│   │   │   └── Account/     # 用户中心
│   │   └── App.tsx
│   └── package.json
├── admin/                    # 管理后台
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Products/    # 产品管理
│   │   │   ├── Orders/      # 订单管理
│   │   │   ├── Categories/  # 分类管理
│   │   │   └── Customers/   # 客户管理
│   │   └── App.tsx
│   └── package.json
├── backend/                  # 后端API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── products/    # 产品模块
│   │   │   ├── orders/      # 订单模块
│   │   │   ├── categories/  # 分类模块
│   │   │   └── ai/          # AI接口模块
│   │   └── main.ts
│   └── package.json
├── database/
│   └── migrations/
└── docker-compose.yml        # 一键部署
```

---

## AI API 设计规范

所有AI接口统一前缀: `/api/v1/ai/`

```typescript
// 统一响应格式
interface AIApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  usage: {
    tokens: number;
    cost: number;
    model: string;
  };
  metadata: {
    requestId: string;
    timestamp: string;
    duration: number;
  };
}
```

---

## 部署流程

1. 在中控平台选择应用
2. 配置域名、SSL
3. 选择部署服务器
4. 一键部署
5. 自动配置Nginx
6. 提供管理后台地址
