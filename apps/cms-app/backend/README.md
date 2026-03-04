# CMS App Backend

基于 NestJS + TypeORM + PostgreSQL 的内容管理系统后端。

## 功能模块

- **Articles** - 文章CRUD管理
- **Categories** - 层级分类管理
- **Tags** - 标签管理
- **Media** - 媒体库（文件上传）
- **AI** - AI辅助写作、摘要生成、SEO优化

## AI API端点

| 端点 | 描述 |
|------|------|
| `POST /api/v1/ai/articles/write` | AI写文章 |
| `POST /api/v1/ai/articles/summary` | AI生成摘要 |
| `POST /api/v1/ai/seo/optimize` | AI SEO优化 |
| `POST /api/v1/ai/images/generate` | AI生成配图 |

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动数据库
docker-compose up -d

# 3. 运行开发服务器
npm run start:dev

# 4. 访问 API
# API: http://localhost:3000/api/v1
# Docs: http://localhost:3000/api/docs
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| DB_HOST | 数据库主机 | localhost |
| DB_PORT | 数据库端口 | 5432 |
| DB_NAME | 数据库名 | cms_app |
| AI_API_KEY | AI API密钥 | - |
| AI_MODEL | AI模型 | gpt-4 |
| PORT | 服务端口 | 3000 |
