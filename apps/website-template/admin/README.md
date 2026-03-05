# Website Template Admin

WebsiteTemplate 独立站模板的管理后台系统。

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 组件库**: Ant Design 5 + Ant Design Pro Components
- **状态管理**: Zustand
- **数据获取**: TanStack Query (React Query)
- **路由**: React Router v6
- **图表**: Ant Design Charts

## 功能特性

### 1. Dashboard (仪表盘)
- 站点访问统计图表
- 内容发布统计
- 快速操作入口
- 最近活动列表

### 2. Theme (主题配置) ⭐ 核心
- 预设主题选择器 (卡片展示)
- 颜色配置器 (实时预览)
- Logo/Favicon 上传
- 字体选择
- 布局设置 (默认/侧边栏/顶部导航)

### 3. Content (内容管理)
- 首页内容编辑
- 关于我们编辑
- 服务介绍编辑
- AI 一键生成内容按钮

### 4. Products (产品管理)
- 产品列表 (表格展示)
- 产品编辑/创建 (表单)
- 多图上传
- AI 生成产品描述
- 分类管理

### 5. Pages (页面管理)
- 页面列表
- 页面编辑 (标题、内容、SEO)
- 导航菜单配置

### 6. Media (媒体库)
- 图片网格展示
- 上传/删除
- AI 生成图片

### 7. SEO (SEO设置)
- 站点标题/描述
- 关键词设置
- Robots.txt 编辑
- Sitemap 生成
- AI SEO 优化按钮

### 8. AI Assistant (AI助手) ⭐
- 一键生成全站内容
- 智能推荐
- 批量翻译

## 项目结构

```
src/
├── api/           # API 客户端和接口定义
├── components/    # 公共组件
├── hooks/         # 自定义 Hooks (React Query)
├── layouts/       # 布局组件
├── pages/         # 页面组件
├── stores/        # Zustand 状态管理
├── types/         # TypeScript 类型定义
├── utils/         # 工具函数
├── App.tsx        # 主应用组件
└── main.tsx       # 入口文件
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 环境变量

创建 `.env.local` 文件：

```env
VITE_API_URL=http://localhost:8000/api
```

## 开发规范

- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 状态管理使用 Zustand
- API 请求使用 TanStack Query
- UI 组件优先使用 Ant Design

## 许可证

MIT
