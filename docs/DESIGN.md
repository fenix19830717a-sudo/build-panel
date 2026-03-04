# BuildAI Framework - 系统设计文档 (DESIGN)

## 1. 系统架构设计

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BuildAI SaaS Platform                          │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────────────┐ │
│  │   Web UI     │   │   API GW     │   │      Admin Dashboard         │ │
│  │  (React)     │◄──┤  (Nginx)     │──►│   (System Management)        │ │
│  └──────────────┘   └──────┬───────┘   └──────────────────────────────┘ │
│                            │                                            │
│  ┌─────────────────────────┴──────────────────────────────────────────┐ │
│  │                    Controller Service (Node.js/NestJS)              │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │ │
│  │  │  Auth       │ │  User Mgmt  │ │ Server Mgmt │ │  App Mgmt   │  │ │
│  │  │  Service    │ │  Service    │ │  Service    │ │  Service    │  │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │ │
│  │  │  API Key    │ │  Task       │ │  WebSocket  │ │  Audit      │  │ │
│  │  │  Service    │ │  Scheduler  │ │  Gateway    │ │  Logger     │  │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                            │                                            │
│  ┌─────────────────────────┴──────────────────────────────────────────┐ │
│  │                    Data Layer                                        │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │ │
│  │  │ PostgreSQL  │ │    Redis    │ │    MinIO    │ │  ClickHouse │  │ │
│  │  │  (主数据)    │ │  (缓存/MQ)  │ │  (对象存储)  │ │  (日志分析)  │  │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                           │
                              ┌────────────┴────────────┐
                              │      mTLS + HTTPS       │
                              ▼                         ▼
┌─────────────────────────────────────────┐  ┌─────────────────────────────────────────┐
│           Agent Node #1                  │  │           Agent Node #2                  │
│  ┌─────────────────────────────────┐   │  │  ┌─────────────────────────────────┐   │
│  │         Agent Service           │   │  │  │         Agent Service           │   │
│  │  ┌─────────────┐ ┌───────────┐  │   │  │  │  ┌─────────────┐ ┌───────────┐  │   │
│  │  │ HTTP Server │ │  Docker   │  │   │  │  │  │ HTTP Server │ │  Docker   │  │   │
│  │  │  (API)      │ │  Client   │  │   │  │  │  │  (API)      │ │  Client   │  │   │
│  │  └─────────────┘ └───────────┘  │   │  │  │  └─────────────┘ └───────────┘  │   │
│  │  ┌─────────────┐ ┌───────────┐  │   │  │  │  ┌─────────────┐ ┌───────────┐  │   │
│  │  │   SSH       │ │  Process  │  │   │  │  │  │   SSH       │ │  Process  │  │   │
│  │  │  Client     │ │  Monitor  │  │   │  │  │  │  Client     │ │  Monitor  │  │   │
│  │  └─────────────┘ └───────────┘  │   │  │  │  └─────────────┘ └───────────┘  │   │
│  └─────────────────────────────────┘   │  │  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │  │  ┌─────────────────────────────────┐   │
│  │     Running Applications        │   │  │  │     Running Applications        │   │
│  │  ┌─────────────┐ ┌───────────┐  │   │  │  │  ┌─────────────┐ ┌───────────┐  │   │
│  │  │ServerManager│ │Polymarket │  │   │  │  │  │    App X    │ │   App Y   │  │   │
│  │  │  (Docker)   │ │   Bot     │  │   │  │  │  │  (Docker)   │ │  (Docker) │  │   │
│  │  └─────────────┘ └───────────┘  │   │  │  │  └─────────────┘ └───────────┘  │   │
│  └─────────────────────────────────┘   │  │  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘  └─────────────────────────────────────────┘
```

### 1.2 模块划分

```
buildai-framework/
├── framework/                          # 核心框架
│   ├── controller/                     # SaaS 中控服务
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/               # 认证模块
│   │   │   │   ├── users/              # 用户管理
│   │   │   │   ├── servers/            # 服务器管理
│   │   │   │   ├── apikeys/            # API Key 管理
│   │   │   │   ├── apps/               # 应用管理
│   │   │   │   ├── tasks/              # 任务调度
│   │   │   │   └── websocket/          # 实时通信
│   │   │   ├── core/
│   │   │   │   ├── crypto/             # 加密工具
│   │   │   │   ├── mq/                 # 消息队列
│   │   │   │   └── config/             # 配置管理
│   │   │   └── main.ts
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── agent/                          # Agent 服务端
│   │   ├── src/
│   │   │   ├── api/                    # HTTP API
│   │   │   ├── runtime/                # 应用运行时
│   │   │   ├── monitor/                # 监控模块
│   │   │   └── main.go
│   │   ├── go.mod
│   │   └── Dockerfile
│   │
│   ├── sdk/                            # 应用开发 SDK
│   │   ├── go/                         # Go SDK
│   │   ├── python/                     # Python SDK
│   │   └── node/                       # Node.js SDK
│   │
│   └── web/                            # 前端界面
│       ├── src/
│       │   ├── views/
│       │   │   ├── login/              # 登录页
│       │   │   ├── dashboard/          # 仪表盘
│       │   │   ├── servers/            # 服务器管理
│       │   │   ├── apps/               # 应用管理
│       │   │   └── settings/           # 系统设置
│       │   ├── components/
│       │   ├── api/                    # API 封装
│       │   └── App.tsx
│       ├── package.json
│       └── Dockerfile
│
├── apps/                               # 应用集合
│   ├── server-manager/                 # 远程服务器管理
│   │   ├── backend/                    # 后端服务
│   │   ├── frontend/                   # 前端界面
│   │   └── docker-compose.yml
│   │
│   └── polymarket-bot/                 # Polymarket 交易机器人
│       ├── src/
│       ├── config/
│       ├── strategies/
│       └── Dockerfile
│
└── deploy/                             # 部署配置
    ├── docker-compose.yml              # 完整部署
    ├── install-agent.sh                # Agent 安装脚本
    └── nginx.conf                      # Nginx 配置
```

---

## 2. 数据库设计

### 2.1 ER 图

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │       │   servers   │       │    apps     │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │──┐    │ id (PK)     │
│ email       │  │    │ user_id(FK) │──┘    │ name        │
│ password    │  │    │ name        │       │ version     │
│ role        │  │    │ host        │       │ image       │
│ status      │  │    │ port        │       │ config      │
│ created_at  │  │    │ status      │       │ created_at  │
└─────────────┘  │    │ agent_token │       └──────┬──────┘
                 │    │ created_at  │              │
                 │    └──────┬──────┘              │
                 │           │                     │
                 │    ┌──────┴──────┐              │
                 │    │ server_apps │◄─────────────┘
                 │    ├─────────────┤
                 └───►│ user_id(FK) │
                      │ server_id   │
                      │ app_id      │
                      │ config      │
                      │ status      │
                      └─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   api_keys  │       │    tasks    │       │ audit_logs  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ user_id(FK) │◄─────│ user_id(FK) │       │ user_id     │
│ name        │       │ type        │       │ action      │
│ key_hash    │       │ target      │       │ target      │
│ provider    │       │ payload     │       │ details     │
│ quota       │       │ status      │       │ ip          │
│ used        │       │ result      │       │ created_at  │
│ expires_at  │       │ created_at  │       └─────────────┘
└─────────────┘       └─────────────┘
```

### 2.2 表结构

详见 `docs/database-schema.sql`

---

## 3. API 设计

### 3.1 REST API

```yaml
# Controller API
/auth:
  POST /login
  POST /register
  POST /logout
  GET  /me

/users:
  GET    /           # 列出用户（Admin）
  GET    /:id
  POST   /           # 创建用户
  PUT    /:id
  DELETE /:id

/servers:
  GET    /           # 列出服务器
  GET    /:id
  POST   /           # 注册服务器
  PUT    /:id
  DELETE /:id
  POST   /:id/command     # 执行命令
  GET    /:id/metrics     # 获取监控数据
  POST   /:id/install     # 安装 Agent

/apps:
  GET    /           # 列出应用
  GET    /:id
  POST   /           # 上传应用
  PUT    /:id
  DELETE /:id

/api-keys:
  GET    /
  POST   /
  DELETE /:id

/tasks:
  GET    /
  GET    /:id
  POST   /           # 创建任务
```

### 3.2 Agent API

```yaml
# Agent 暴露的 API（被中控调用）
/health:
  GET /              # 健康检查

/containers:
  GET    /           # 列出容器
  POST   /           # 创建容器
  GET    /:id
  POST   /:id/start
  POST   /:id/stop
  DELETE /:id

/exec:
  POST /             # 执行命令
  POST /interactive  # 交互式命令（WebSocket）

/files:
  GET    /           # 列出文件
  GET    /download   # 下载文件
  POST   /upload     # 上传文件
  PUT    /           # 编辑文件
  DELETE /           # 删除文件

/metrics:
  GET /              # 系统指标
```

---

## 4. 通信协议

### 4.1 中控 ↔ Agent 通信

```protobuf
// 协议定义
message Command {
  string id = 1;
  string type = 2;      // docker, exec, file, etc.
  bytes payload = 3;
  string signature = 4;
  int64 timestamp = 5;
}

message Response {
  string command_id = 1;
  bool success = 2;
  bytes data = 3;
  string error = 4;
}

message Heartbeat {
  string agent_id = 1;
  int64 timestamp = 2;
  SystemMetrics metrics = 3;
  repeated ContainerStatus containers = 4;
}
```

### 4.2 安全机制

1. **mTLS**：双向证书验证
2. **请求签名**：HMAC-SHA256
3. **Token**：JWT 短期令牌
4. **指令白名单**：可执行的命令限制

---

## 5. 前端设计

### 5.1 页面结构

```
/                     → 登录页
/dashboard            → 仪表盘（服务器状态、资源使用）
/servers              → 服务器列表
/servers/:id          → 服务器详情（终端、文件、进程）
/apps                 → 应用市场
/apps/:id             → 应用详情
/apps/:id/deploy      → 部署配置
/tasks                → 任务列表
/settings             → 系统设置
/profile              → 个人设置
```

### 5.2 关键组件

- **XTerm**: Web 终端
- **FileManager**: 文件浏览器
- **MetricsChart**: 监控图表
- **AppCard**: 应用卡片
- **ServerStatus**: 服务器状态指示器

---

## 6. 应用架构

### 6.1 ServerManager

```
src/
├── server.ts           # Express 服务
├── routes/
│   ├── terminal.ts     # WebSocket 终端
│   ├── files.ts        # 文件操作
│   ├── processes.ts    # 进程管理
│   └── services.ts     # 系统服务
├── middleware/
│   └── auth.ts
└── utils/
    └── docker.ts
```

### 6.2 PolymarketBot

```
src/
├── bot.py              # 主程序
├── api/
│   ├── polymarket.py   # Polymarket API
│   └── wallet.py       # 钱包管理
├── strategies/
│   ├── base.py         # 策略基类
│   ├── arbitrage.py    # 套利策略
│   └── trend.py        # 趋势策略
├── models/
│   ├── market.py       # 市场数据模型
│   └── position.py     # 持仓模型
└── config.yaml
```

---

## 7. 部署架构

### 7.1 Docker Compose

```yaml
version: '3.8'
services:
  controller:
    build: ./framework/controller
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
  
  web:
    build: ./framework/web
    ports:
      - "3000:80"
  
  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
  
  agent:
    build: ./framework/agent
    privileged: true
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

---

## 8. 监控与日志

### 8.1 监控指标

| 类别 | 指标 |
|------|------|
| 系统 | CPU、内存、磁盘、网络 |
| 应用 | 容器状态、响应时间、错误率 |
| 业务 | 活跃用户、API 调用量、任务成功率 |

### 8.2 日志规范

```json
{
  "level": "info",
  "timestamp": "2024-03-05T10:00:00Z",
  "service": "controller",
  "trace_id": "uuid",
  "user_id": "user_uuid",
  "action": "deploy_app",
  "target": "server_001",
  "message": "App deployed successfully",
  "duration_ms": 5000
}
```
