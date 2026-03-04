# CMS App Frontend

基于 React + Vite + Tailwind CSS 的博客前端。

## 功能特性

- 🏠 **首页** - 精选文章、最新文章、热门标签
- 📄 **文章列表** - 分类筛选、分页、网格/列表视图
- 📖 **文章详情** - 富文本渲染、相关文章推荐
- 📂 **分类页** - 层级分类浏览
- 🏷️ **标签云** - 按标签浏览文章
- 🔍 **搜索** - 全文搜索功能

## 页面结构

```
src/
├── components/      # 可复用组件
│   ├── ArticleCard.tsx
│   └── TagCloud.tsx
├── layouts/         # 布局组件
│   └── MainLayout.tsx
├── pages/           # 页面组件
│   ├── HomePage.tsx
│   ├── ArticlesPage.tsx
│   ├── ArticleDetailPage.tsx
│   ├── CategoriesPage.tsx
│   ├── TagsPage.tsx
│   └── SearchPage.tsx
├── services/        # API 服务
│   └── api.ts
├── types/           # TypeScript 类型
│   └── index.ts
└── ...
```

## 快速开始

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 构建
npm run build
```

## 环境变量

创建 `.env` 文件:

```env
VITE_API_URL=http://localhost:3000/api/v1
```
