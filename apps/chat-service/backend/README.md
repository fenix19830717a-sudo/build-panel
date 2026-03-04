# ChatService Backend

智能客服系统后端 API

## 技术栈
- NestJS + TypeScript + TypeORM + PostgreSQL + Socket.io

## 安装
```bash
npm install
```

## 运行
```bash
npm run start:dev
```

## API 端点

### Chat
- `POST /api/v1/chat/sessions` - 创建会话
- `GET /api/v1/chat/sessions` - 获取会话列表
- `POST /api/v1/chat/messages` - 发送消息

### Tickets
- `POST /api/v1/tickets` - 创建工单
- `GET /api/v1/tickets` - 获取工单列表

### Knowledge
- `GET /api/v1/knowledge/articles` - 获取文章
- `GET /api/v1/knowledge/articles/search?q=xxx` - 搜索

### Agents
- `POST /api/v1/agents/login` - 登录
- `GET /api/v1/agents/online` - 获取在线客服

### AI
- `POST /api/v1/ai/chat/reply` - AI自动回复
- `POST /api/v1/ai/tickets/classify` - AI工单分类
