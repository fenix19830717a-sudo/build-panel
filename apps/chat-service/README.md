# ChatService - 智能客服系统

## 简介

ChatService 是 BuildAI Framework 的智能客服解决方案，提供全渠道客服接入能力。支持网页组件嵌入、实时聊天、工单系统、知识库管理，以及 AI 自动回复功能。

核心功能：
- 可嵌入任何网站的聊天组件
- 实时双向通信（WebSocket）
- AI 自动回复和意图识别
- 工单管理系统
- 知识库文章管理
- 多客服分配和协作

## 功能特性

### 聊天组件
- ✅ **Web 组件** - 可嵌入任何网站的聊天窗口
- ✅ **响应式设计** - 适配桌面和移动端
- ✅ **自定义外观** - 主题颜色、欢迎语、头像
- ✅ **离线留言** - 非工作时间收集客户信息
- ✅ **文件传输** - 支持图片、文档发送

### 客服工作台
- ✅ **实时对话** - 同时处理多个会话
- ✅ **访客信息** - 显示访客浏览轨迹
- ✅ **快捷回复** - 预设常用回复模板
- ✅ **内部转接** - 会话转给其他客服
- ✅ **满意度评价** - 会话结束后收集反馈

### AI 功能
- ✅ **自动回复** - 基于知识库的自动回答
- ✅ **意图识别** - 识别用户问题意图
- ✅ **智能推荐** - 推荐相关帮助文章
- ✅ **情绪分析** - 检测用户情绪状态
- ✅ **工单分类** - 自动分类工单类型

### 工单系统
- ✅ **工单创建** - 从聊天自动创建
- ✅ **工单分配** - 手动或自动分配
- ✅ **状态追踪** - 全程状态更新
- ✅ **优先级管理** - 紧急程度标识
- ✅ **SLA 监控** - 服务级别协议

### 知识库
- ✅ **文章管理** - 创建、编辑、分类
- ✅ **智能搜索** - 全文检索
- ✅ **AI 训练** - 基于知识库训练机器人
- ✅ **多级分类** - 组织文章结构
- ✅ **权限控制** - 内部/公开文章

## 技术栈

### 后端
- **Framework**: NestJS 10
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **Cache**: Redis
- **Real-time**: Socket.io
- **ORM**: TypeORM
- **AI**: OpenAI API / Claude API

### 聊天组件
- **Framework**: React 18
- **Type**: Web Components
- **Build**: Vite
- **Style**: CSS Variables
- **Size**: < 100KB gzipped

### 管理后台
- **Framework**: React 18
- **UI**: Ant Design
- **Build**: Vite
- **State**: Zustand

## 快速开始

### 环境要求
- Node.js 20+
- PostgreSQL 14+
- Redis 7+

### 安装依赖

```bash
# 后端
cd apps/chat-service/backend
npm install

# 组件
cd ../widget
npm install

# 管理后台
cd ../admin
npm install
```

### 环境配置

```bash
# 后端配置
cd apps/chat-service/backend
cp .env.example .env

# 编辑 .env 配置：
# - 数据库连接
# - Redis 连接
# - AI API Key
```

### 数据库初始化

```bash
cd apps/chat-service/backend
npm run migration:run
```

### 启动开发服务器

```bash
# 后端 (端口 3000)
cd apps/chat-service/backend
npm run start:dev

# 组件开发 (端口 5173)
cd apps/chat-service/widget
npm run dev

# 管理后台 (端口 3001)
cd apps/chat-service/admin
npm run dev
```

### 组件构建

```bash
cd apps/chat-service/widget
npm run build

# 构建产物: dist/chat-widget.js
```

## 嵌入网站

### 方式一：JavaScript SDK

```html
<!-- 在 <head> 中添加 -->
<script src="https://yourdomain.com/chat-widget.js"></script>

<!-- 在 <body> 底部添加 -->
<script>
  BuildAIChat.init({
    channelId: 'your-channel-id',
    theme: {
      primaryColor: '#1890ff',
      position: 'right',
      greeting: '您好，有什么可以帮助您？'
    },
    metadata: {
      page: window.location.pathname,
      userId: 'optional-user-id'
    }
  });
</script>
```

### 方式二：iframe 嵌入

```html
<iframe
  src="https://yourdomain.com/chat-embed?channel=your-channel-id"
  width="100%"
  height="600"
  frameborder="0"
></iframe>
```

### 方式三：React 组件

```jsx
import { ChatWidget } from '@buildai/chat-widget';

function App() {
  return (
    <ChatWidget
      channelId="your-channel-id"
      theme={{ primaryColor: '#1890ff' }}
      onMessage={(msg) => console.log(msg)}
    />
  );
}
```

## API 文档

启动后端后访问：
```
http://localhost:3000/api/docs
```

### 主要 API

#### 会话管理
- `POST /api/v1/conversations` - 创建会话
- `GET /api/v1/conversations/:id` - 获取会话
- `POST /api/v1/conversations/:id/messages` - 发送消息
- `GET /api/v1/conversations/:id/messages` - 获取消息列表

#### 客服管理
- `GET /api/v1/agents` - 获取客服列表
- `POST /api/v1/agents/:id/assign` - 分配会话
- `GET /api/v1/agents/:id/conversations` - 获取客服会话

#### 工单管理
- `GET /api/v1/tickets` - 工单列表
- `POST /api/v1/tickets` - 创建工单
- `GET /api/v1/tickets/:id` - 工单详情
- `PUT /api/v1/tickets/:id` - 更新工单

#### 知识库
- `GET /api/v1/knowledge/articles` - 文章列表
- `POST /api/v1/knowledge/articles` - 创建文章
- `GET /api/v1/knowledge/search?q=keyword` - 搜索文章

#### AI API
- `POST /api/v1/ai/chat/reply` - AI 自动回复
- `POST /api/v1/ai/intent/recognize` - 意图识别
- `POST /api/v1/ai/tickets/classify` - 工单分类
- `POST /api/v1/ai/knowledge/build` - 构建知识库

### WebSocket 事件

```javascript
// 客户端事件
socket.emit('conversation:join', { conversationId });
socket.emit('message:send', { conversationId, content, type });
socket.emit('typing:start', { conversationId });
socket.emit('typing:stop', { conversationId });

// 服务器事件
socket.on('message:received', (message) => {});
socket.on('agent:joined', (agent) => {});
socket.on('agent:left', () => {});
socket.on('conversation:closed', () => {});
```

## 部署

### Docker 部署

```bash
cd apps/chat-service
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
   DB_DATABASE=chatservice
   REDIS_HOST=localhost
   REDIS_PORT=6379
   AI_API_KEY=your_openai_key
   ```

2. **配置 Nginx**
   ```nginx
   server {
       listen 80;
       server_name chat.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       # WebSocket 支持
       location /socket.io {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
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
apps/chat-service/
├── backend/              # 后端 API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── conversations/  # 会话模块
│   │   │   ├── messages/       # 消息模块
│   │   │   ├── agents/         # 客服模块
│   │   │   ├── tickets/        # 工单模块
│   │   │   ├── knowledge/      # 知识库模块
│   │   │   └── ai/             # AI 模块
│   │   ├── gateway/            # WebSocket 网关
│   │   └── main.ts
│   └── package.json
├── widget/               # 聊天组件
│   ├── src/
│   │   ├── components/   # React 组件
│   │   ├── ChatWidget.tsx
│   │   └── index.ts
│   └── package.json
├── admin/                # 管理后台
│   ├── src/
│   │   ├── pages/        # 管理页面
│   │   └── App.tsx
│   └── package.json
└── docker-compose.yml
```

## 数据库实体

```
Conversation (会话)
├── messages (消息) - 1:N
├── agents (参与客服) - N:M
└── ticket (关联工单) - 1:1

Message (消息)
├── conversation (会话) - N:1
├── sender (发送者) - N:1
└── attachments (附件) - 1:N

Agent (客服)
├── user (关联用户) - 1:1
├── conversations (会话) - N:M
└── tickets (工单) - 1:N

Ticket (工单)
├── conversation (来源会话) - 1:1
├── agent (处理客服) - N:1
└── comments (评论) - 1:N

KnowledgeArticle (知识库文章)
├── category (分类) - N:1
└── tags (标签) - N:M
```

## AI 配置

### OpenAI 配置

```bash
AI_PROVIDER=openai
AI_API_KEY=sk-your-api-key
AI_MODEL=gpt-4
AI_TEMPERATURE=0.7
```

### Claude 配置

```bash
AI_PROVIDER=anthropic
AI_API_KEY=your-anthropic-key
AI_MODEL=claude-3-sonnet
```

### 自定义 AI 服务

```bash
AI_PROVIDER=custom
AI_API_URL=https://your-ai-service.com/v1/chat
AI_API_KEY=your-key
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
| REDIS_HOST | Redis 主机 | 是 |
| REDIS_PORT | Redis 端口 | 是 |
| AI_PROVIDER | AI 提供商 | 否 |
| AI_API_KEY | AI API Key | 否 |
| AI_MODEL | AI 模型 | 否 |

## 自定义主题

```javascript
BuildAIChat.init({
  theme: {
    // 颜色
    primaryColor: '#1890ff',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    
    // 位置
    position: 'right', // 'left' | 'right'
    marginX: 20,
    marginY: 20,
    
    // 尺寸
    width: 380,
    height: 600,
    
    // 头像
    botAvatar: 'https://your-cdn.com/bot-avatar.png',
    userAvatar: 'https://your-cdn.com/user-avatar.png',
    
    // 文字
    greeting: '您好！有什么可以帮助您？',
    placeholder: '请输入您的问题...',
    offlineMessage: '当前非工作时间，请留言'
  }
});
```

## 许可证

MIT
