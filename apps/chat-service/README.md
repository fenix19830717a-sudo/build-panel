# ChatService - 智能客服系统

全栈智能客服解决方案，包含实时聊天、工单系统、知识库和AI自动回复功能。

## 项目结构

```
apps/chat-service/
├── backend/     # NestJS + TypeORM + Socket.io 后端API
├── widget/      # React + Web Components 可嵌入聊天组件
├── admin/       # React + Ant Design 客服工作台
└── database/    # 数据库迁移脚本
```

## 快速开始

### 1. 启动后端服务

```bash
cd backend
npm install
npm run start:dev
```

后端服务运行在 http://localhost:3000

### 2. 启动管理后台

```bash
cd admin
npm install
npm run dev
```

管理后台运行在 http://localhost:3001

### 3. 使用聊天组件

```bash
cd widget
npm install
npm run build
```

将构建后的 `dist/chat-widget.js` 嵌入到任何网站。

## 技术栈

- **Backend**: NestJS, TypeORM, PostgreSQL, Socket.io
- **Widget**: React, Web Components, Socket.io Client
- **Admin**: React, Ant Design, Socket.io Client

## API 文档

### AI API

- `POST /api/v1/ai/chat/reply` - AI自动回复
- `POST /api/v1/ai/tickets/classify` - AI工单分类
- `POST /api/v1/ai/knowledge/build` - AI构建知识库
- `POST /api/v1/ai/intent/recognize` - AI意图识别

## 功能特性

- 实时双向聊天 (WebSocket)
- AI自动回复和意图识别
- 工单管理系统
- 知识库文章管理
- 客服在线状态管理
- 多客服分配
