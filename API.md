# API 接口文档

本文档描述了 B2B Server Framework 的所有 API 接口。

**基础 URL**: `http://localhost:3000`

---

## 目录

1. [认证 API](#1-认证-api)
2. [项目 API](#2-项目-api)
3. [用户管理 API](#3-用户管理-api)
4. [Polymarket API](#4-polymarket-api)
5. [爬虫任务 API](#5-爬虫任务-api)
6. [节点管理 API](#6-节点管理-api)
7. [计费 API](#7-计费-api)
8. [AI 生成 API](#8-ai-生成-api)
9. [模块化应用 API](#9-模块化应用-api)
10. [第三方集成 API](#10-第三方集成-api)
11. [其他 API](#11-其他-api)

---

## 1. 认证 API

### 1.1 用户登录

**端点**: `POST /api/auth/login`

**描述**: 使用邮箱/用户名和密码进行用户登录认证。

**请求体**:
```json
{
  "email": "string",     // 用户邮箱或用户名
  "password": "string"   // 用户密码
}
```

**响应**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "用户名",
    "role": "user",
    "credits": 1000
  }
}
```

**错误响应**:
- `401`: 用户名或密码错误
- `403`: 账户已被封禁

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin", "password": "123456"}'
```

---

### 1.2 忘记密码

**端点**: `POST /api/auth/forgot-password`

**描述**: 发送验证码到用户邮箱或手机，用于重置密码。

**请求体**:
```json
{
  "contact": "string"   // 邮箱或手机号
}
```

**响应**:
```json
{
  "success": true,
  "message": "Verification code sent."
}
```

**错误响应**:
- `404`: 用户不存在

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"contact": "user@example.com"}'
```

---

### 1.3 重置密码

**端点**: `POST /api/auth/reset-password`

**描述**: 使用验证码重置用户密码。

**请求体**:
```json
{
  "contact": "string",       // 邮箱或手机号
  "code": "string",          // 验证码（6位数字）
  "newPassword": "string"    // 新密码
}
```

**响应**:
```json
{
  "success": true,
  "message": "Password reset successful."
}
```

**错误响应**:
- `400`: 验证码无效

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"contact": "user@example.com", "code": "123456", "newPassword": "newpass123"}'
```

---

### 1.4 获取当前用户

**端点**: `GET /api/auth/me`

**描述**: 获取当前登录用户的详细信息。

**响应**:
```json
{
  "id": 1,
  "name": "用户名",
  "email": "user@example.com",
  "phone": "13800138000",
  "tier": "pro",
  "credits": 1000,
  "total_tokens_used": 5000,
  "role": "user",
  "is_banned": 0,
  "created_at": "2026-01-01 00:00:00"
}
```

**错误响应**:
- `403`: 用户已被封禁

**示例请求**:
```bash
curl http://localhost:3000/api/auth/me
```

---

## 2. 项目 API

### 2.1 获取项目列表

**端点**: `GET /api/projects`

**描述**: 获取所有项目的列表，按创建时间倒序排列。

**响应**:
```json
[
  {
    "id": 1,
    "name": "项目名称",
    "icon": "📁",
    "created_at": "2026-01-01 00:00:00"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/projects
```

---

### 2.2 创建项目

**端点**: `POST /api/projects`

**描述**: 创建一个新项目。

**请求体**:
```json
{
  "name": "string",     // 项目名称（必填）
  "icon": "string"      // 项目图标（可选，默认为 "📁"）
}
```

**响应**:
```json
{
  "id": 1,
  "name": "新项目",
  "icon": "🚀"
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "我的项目", "icon": "🎯"}'
```

---

### 2.3 获取知识库文件

**端点**: `GET /api/kb/:projectId`

**描述**: 获取指定项目的知识库文件列表。

**路径参数**:
- `projectId`: 项目ID

**响应**:
```json
[
  {
    "id": 1,
    "project_id": 1,
    "filename": "document.pdf",
    "content": "文件内容...",
    "created_at": "2026-01-01 00:00:00"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/kb/1
```

---

### 2.4 上传知识库文件

**端点**: `POST /api/kb/:projectId/upload`

**描述**: 上传文件到指定项目的知识库。

**路径参数**:
- `projectId`: 项目ID

**请求体**: `multipart/form-data`
- `file`: 文件（必填）

**响应**:
```json
{
  "id": 1,
  "filename": "document.pdf",
  "status": "parsed"
}
```

**错误响应**:
- `400`: 未上传文件

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/kb/1/upload \
  -F "file=@document.pdf"
```

---

## 3. 用户管理 API

### 3.1 获取用户列表

**端点**: `GET /api/admin/users`

**描述**: 获取所有用户的列表。

**响应**:
```json
[
  {
    "id": 1,
    "name": "用户名",
    "email": "user@example.com",
    "phone": "13800138000",
    "tier": "pro",
    "credits": 1000,
    "total_tokens_used": 5000,
    "role": "user",
    "is_banned": 0,
    "created_at": "2026-01-01 00:00:00"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/admin/users
```

---

### 3.2 创建用户

**端点**: `POST /api/admin/users`

**描述**: 创建一个新用户。

**请求体**:
```json
{
  "name": "string",       // 用户名（必填）
  "email": "string",      // 邮箱（必填）
  "tier": "string",       // 用户等级（可选）
  "credits": "number"     // 初始积分（可选）
}
```

**响应**:
```json
{
  "id": 1,
  "success": true
}
```

**错误响应**:
- `400`: 创建失败（如邮箱已存在）

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{"name": "新用户", "email": "new@example.com", "tier": "free", "credits": 100}'
```

---

### 3.3 更新用户

**端点**: `PATCH /api/admin/users/:id`

**描述**: 更新指定用户的信息。

**路径参数**:
- `id`: 用户ID

**请求体**:
```json
{
  "name": "string",        // 用户名（可选）
  "tier": "string",        // 用户等级（可选）
  "credits": "number",     // 积分（可选）
  "is_banned": "boolean"   // 是否封禁（可选）
}
```

**响应**:
```json
{
  "success": true
}
```

**示例请求**:
```bash
curl -X PATCH http://localhost:3000/api/admin/users/1 \
  -H "Content-Type: application/json" \
  -d '{"tier": "pro", "credits": 500}'
```

---

### 3.4 获取用户统计

**端点**: `GET /api/user/stats`

**描述**: 获取当前用户的统计信息。

**响应**:
```json
{
  "id": 1,
  "name": "用户名",
  "email": "user@example.com",
  "tier": "pro",
  "credits": 1000,
  "total_tokens_used": 5000
}
```

**示例请求**:
```bash
curl http://localhost:3000/api/user/stats
```

---

### 3.5 获取用户API密钥

**端点**: `GET /api/user/api-keys`

**描述**: 获取当前用户的第三方API密钥列表。

**响应**:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "provider": "openai",
    "api_key": "sk-xxx",
    "created_at": "2026-01-01 00:00:00"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/user/api-keys
```

---

### 3.6 创建用户API密钥

**端点**: `POST /api/user/api-keys`

**描述**: 为当前用户添加第三方API密钥。

**请求体**:
```json
{
  "provider": "string",    // 提供商名称（如 openai, gemini, kimi）
  "api_key": "string"      // API密钥
}
```

**响应**:
```json
{
  "success": true
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/user/api-keys \
  -H "Content-Type: application/json" \
  -d '{"provider": "openai", "api_key": "sk-xxxxxxxx"}'
```

---

## 4. Polymarket API

### 4.1 获取钱包列表

**端点**: `GET /api/polymarket/wallets`

**描述**: 获取所有 Polymarket 钱包列表。

**响应**:
```json
[
  {
    "id": 1,
    "name": "主钱包",
    "private_key": "加密存储",
    "api_key": "xxx",
    "is_active": 1,
    "created_at": "2026-01-01 00:00:00"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/polymarket/wallets
```

---

### 4.2 创建钱包

**端点**: `POST /api/polymarket/wallets`

**描述**: 创建一个新的 Polymarket 钱包。

**请求体**:
```json
{
  "name": "string",          // 钱包名称（必填）
  "private_key": "string",   // 私钥（必填）
  "api_key": "string"        // API密钥（可选）
}
```

**响应**:
```json
{
  "id": 1,
  "success": true
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/polymarket/wallets \
  -H "Content-Type: application/json" \
  -d '{"name": "交易钱包", "private_key": "0x...", "api_key": "xxx"}'
```

---

### 4.3 更新钱包

**端点**: `PATCH /api/polymarket/wallets/:id`

**描述**: 更新钱包的激活状态。

**路径参数**:
- `id`: 钱包ID

**请求体**:
```json
{
  "is_active": "boolean"   // 是否激活
}
```

**响应**:
```json
{
  "success": true
}
```

**示例请求**:
```bash
curl -X PATCH http://localhost:3000/api/polymarket/wallets/1 \
  -H "Content-Type: application/json" \
  -d '{"is_active": true}'
```

---

### 4.4 获取策略列表

**端点**: `GET /api/polymarket/strategies`

**描述**: 获取所有交易策略列表。

**响应**:
```json
[
  {
    "id": 1,
    "name": "高概率策略",
    "description": "交易概率大于80%的市场",
    "trade_amount": 100,
    "weight": 1.0,
    "type": "custom",
    "mode": "paper",
    "is_active": 1,
    "created_at": "2026-01-01 00:00:00"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/polymarket/strategies
```

---

### 4.5 创建策略

**端点**: `POST /api/polymarket/strategies`

**描述**: 创建一个新的交易策略。

**请求体**:
```json
{
  "name": "string",           // 策略名称（必填）
  "description": "string",    // 策略描述（可选）
  "trade_amount": "number",   // 交易金额（必填）
  "weight": "number",         // 权重（必填）
  "type": "string"            // 策略类型（可选，默认 custom）
}
```

**响应**:
```json
{
  "id": 1,
  "success": true
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/polymarket/strategies \
  -H "Content-Type: application/json" \
  -d '{"name": "保守策略", "trade_amount": 50, "weight": 0.5}'
```

---

### 4.6 更新策略

**端点**: `PATCH /api/polymarket/strategies/:id`

**描述**: 更新指定策略的配置。

**路径参数**:
- `id`: 策略ID

**请求体**:
```json
{
  "is_active": "boolean",     // 是否激活（可选）
  "trade_amount": "number",   // 交易金额（可选）
  "weight": "number",         // 权重（可选）
  "mode": "string"            // 模式：paper 或 live（可选）
}
```

**响应**:
```json
{
  "success": true
}
```

**示例请求**:
```bash
curl -X PATCH http://localhost:3000/api/polymarket/strategies/1 \
  -H "Content-Type: application/json" \
  -d '{"is_active": true, "mode": "live"}'
```

---

### 4.7 删除策略

**端点**: `DELETE /api/polymarket/strategies/:id`

**描述**: 删除指定的交易策略。

**路径参数**:
- `id`: 策略ID

**响应**:
```json
{
  "success": true
}
```

**示例请求**:
```bash
curl -X DELETE http://localhost:3000/api/polymarket/strategies/1
```

---

### 4.8 获取订单列表

**端点**: `GET /api/polymarket/orders`

**描述**: 获取所有交易订单列表。

**响应**:
```json
[
  {
    "id": 1,
    "strategy_id": 1,
    "market_id": "m123",
    "market_title": "Will Bitcoin reach $100k?",
    "type": "buy",
    "amount": 100,
    "price": 0.65,
    "mode": "paper",
    "status": "open",
    "pnl": 0,
    "concurrency": 1,
    "is_server_side": 0,
    "created_at": "2026-01-01 00:00:00"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/polymarket/orders
```

---

### 4.9 创建订单

**端点**: `POST /api/polymarket/orders`

**描述**: 创建一个新的交易订单。

**请求体**:
```json
{
  "strategy_id": "number",       // 策略ID（可选）
  "market_id": "string",         // 市场ID（必填）
  "market_title": "string",      // 市场标题（必填）
  "type": "string",              // 订单类型：buy 或 sell（必填）
  "amount": "number",            // 交易金额（必填）
  "price": "number",             // 价格（必填）
  "mode": "string",              // 模式：paper 或 live（必填）
  "isServerSide": "boolean"      // 是否服务端执行（可选）
}
```

**响应**:
```json
{
  "id": 1,
  "success": true
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/polymarket/orders \
  -H "Content-Type: application/json" \
  -d '{"market_id": "m123", "market_title": "BTC $100k", "type": "buy", "amount": 100, "price": 0.65, "mode": "paper"}'
```

---

### 4.10 获取交易统计

**端点**: `GET /api/polymarket/stats`

**描述**: 获取模拟盘和实盘的交易统计数据。

**响应**:
```json
{
  "paper": {
    "total_pnl": 500,
    "total_orders": 50
  },
  "live": {
    "total_pnl": 200,
    "total_orders": 20
  }
}
```

**示例请求**:
```bash
curl http://localhost:3000/api/polymarket/stats
```

---

### 4.11 抓取市场数据

**端点**: `GET /api/polymarket/scrape`

**描述**: 从 Polymarket 抓取市场数据，支持多钱包并发。

**响应**:
```json
[
  {
    "id": "m1",
    "title": "Will Bitcoin reach $100k?",
    "volume": 5000000,
    "endTime": "2026-12-31T23:59:59.000Z",
    "odds": 0.65
  }
]
```

**说明**:
- 返回交易量大于 100k 且结束时间大于 1 小时的市场
- 活跃钱包数量越多，抓取的数据量越大

**示例请求**:
```bash
curl http://localhost:3000/api/polymarket/scrape
```

---

### 4.12 获取配置

**端点**: `GET /api/polymarket/config`

**描述**: 获取 Polymarket 的配置信息。

**响应**:
```json
{
  "auto_trade": "true",
  "max_position": "1000",
  "stop_loss": "0.5"
}
```

**示例请求**:
```bash
curl http://localhost:3000/api/polymarket/config
```

---

### 4.13 更新配置

**端点**: `POST /api/polymarket/config`

**描述**: 更新 Polymarket 的配置项。

**请求体**:
```json
{
  "key": "string",      // 配置键名
  "value": "string"     // 配置值
}
```

**响应**:
```json
{
  "success": true
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/polymarket/config \
  -H "Content-Type: application/json" \
  -d '{"key": "auto_trade", "value": "false"}'
```

---

### 4.14 测试连接

**端点**: `POST /api/polymarket/test-connection`

**描述**: 测试钱包私钥和 API 密钥是否有效。

**请求体**:
```json
{
  "privateKey": "string",   // 私钥
  "apiKey": "string"        // API密钥
}
```

**响应**:
```json
{
  "success": true,
  "message": "Connection successful. Wallet connected."
}
```

**错误响应**:
- `400`: 无效的私钥或 API 密钥

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/polymarket/test-connection \
  -H "Content-Type: application/json" \
  -d '{"privateKey": "0x...", "apiKey": "xxx"}'
```

---

## 5. 爬虫任务 API

### 5.1 获取任务列表

**端点**: `GET /api/crawler/tasks`

**描述**: 获取所有爬虫任务列表。

**响应**:
```json
[
  {
    "id": "task-001",
    "name": "LinkedIn 爬虫",
    "platform": "linkedin",
    "type": "profile",
    "creator": "admin",
    "priority": 1,
    "status": "running",
    "progress": 50,
    "crawler_mode": "standard",
    "created_at": "2026-01-01 00:00:00"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/crawler/tasks
```

---

### 5.2 创建任务

**端点**: `POST /api/crawler/tasks`

**描述**: 创建一个新的爬虫任务。

**请求体**:
```json
{
  "id": "string",            // 任务ID（必填）
  "name": "string",          // 任务名称（必填）
  "platform": "string",      // 平台名称（必填）
  "type": "string",          // 任务类型（必填）
  "creator": "string",       // 创建者（必填）
  "priority": "number",      // 优先级（必填）
  "crawler_mode": "string"   // 爬虫模式（可选，默认 standard）
}
```

**响应**:
```json
{
  "success": true
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/crawler/tasks \
  -H "Content-Type: application/json" \
  -d '{"id": "task-002", "name": "海关数据爬虫", "platform": "customs", "type": "data", "creator": "admin", "priority": 2}'
```

---

### 5.3 更新任务

**端点**: `PATCH /api/crawler/tasks/:id`

**描述**: 更新指定任务的状态或进度。

**路径参数**:
- `id`: 任务ID

**请求体**:
```json
{
  "status": "string",     // 任务状态（可选）
  "progress": "number"    // 进度百分比（可选）
}
```

**响应**:
```json
{
  "success": true
}
```

**示例请求**:
```bash
curl -X PATCH http://localhost:3000/api/crawler/tasks/task-001 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed", "progress": 100}'
```

---

### 5.4 删除任务

**端点**: `DELETE /api/crawler/tasks/:id`

**描述**: 删除指定的爬虫任务。

**路径参数**:
- `id`: 任务ID

**响应**:
```json
{
  "success": true
}
```

**示例请求**:
```bash
curl -X DELETE http://localhost:3000/api/crawler/tasks/task-001
```

---

### 5.5 获取日志列表

**端点**: `GET /api/crawler/logs`

**描述**: 获取爬虫日志列表。

**查询参数**:
- `level`: 日志级别过滤（可选，如 info, warning, error）

**响应**:
```json
[
  {
    "id": 1,
    "task_id": "task-001",
    "level": "info",
    "source": "crawler",
    "message": "任务启动成功",
    "details": null,
    "created_at": "2026-01-01 00:00:00"
  }
]
```

**示例请求**:
```bash
curl "http://localhost:3000/api/crawler/logs?level=error"
```

---

### 5.6 创建日志

**端点**: `POST /api/crawler/logs`

**描述**: 创建一条爬虫日志。

**请求体**:
```json
{
  "task_id": "string",      // 任务ID（可选）
  "level": "string",        // 日志级别（可选，默认 info）
  "source": "string",       // 来源（必填）
  "message": "string",      // 消息内容（必填）
  "details": "string"       // 详细信息（可选）
}
```

**响应**:
```json
{
  "id": 1
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/crawler/logs \
  -H "Content-Type: application/json" \
  -d '{"task_id": "task-001", "level": "warning", "source": "parser", "message": "解析超时"}'
```

---

## 6. 节点管理 API

### 6.1 节点注册

**端点**: `POST /api/node/register`

**描述**: 注册一个新的服务节点。

**请求体**:
```json
{
  "nodeId": "string",        // 节点ID（必填）
  "name": "string",          // 节点名称（必填）
  "region": "string",        // 区域（必填）
  "type": "string",          // 节点类型（必填）
  "port": "number",          // 端口号（必填）
  "secretKey": "string"      // 密钥（必填）
}
```

**响应**:
```json
{
  "success": true,
  "token": "uuid-token",
  "nodeId": "node-001"
}
```

**错误响应**:
- `403`: 无效的密钥

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/node/register \
  -H "Content-Type: application/json" \
  -d '{"nodeId": "node-001", "name": "US-East-1", "region": "us-east", "type": "worker", "port": 3001, "secretKey": "your-secret-key"}'
```

---

### 6.2 节点心跳

**端点**: `POST /api/node/heartbeat`

**描述**: 发送节点心跳，更新节点状态。

**请求头**:
- `Authorization`: `Bearer <token>`

**请求体**:
```json
{
  "nodeId": "string",
  "status": {
    "cpu": "number",         // CPU使用率
    "memory": "number",      // 内存使用率
    "disk": "number",        // 磁盘使用率
    "activeApps": "number"   // 活跃应用数
  },
  "apps": [
    {
      "appId": "string",
      "name": "string",
      "version": "string",
      "status": "string",
      "memory": "number",
      "requests": "number",
      "errors": "number"
    }
  ]
}
```

**响应**:
```json
{
  "success": true
}
```

**错误响应**:
- `401`: 未授权或无效令牌

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/node/heartbeat \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"nodeId": "node-001", "status": {"cpu": 45, "memory": 60, "disk": 30, "activeApps": 2}}'
```

---

### 6.3 节点注销

**端点**: `POST /api/node/unregister`

**描述**: 注销一个服务节点。

**请求体**:
```json
{
  "nodeId": "string"   // 节点ID
}
```

**响应**:
```json
{
  "success": true
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/node/unregister \
  -H "Content-Type: application/json" \
  -d '{"nodeId": "node-001"}'
```

---

### 6.4 获取节点列表

**端点**: `GET /api/admin/nodes`

**描述**: 获取所有服务节点列表。

**响应**:
```json
[
  {
    "id": 1,
    "node_id": "node-001",
    "name": "US-East-1",
    "region": "us-east",
    "type": "worker",
    "port": 3001,
    "status": "online",
    "cpu_usage": 45,
    "memory_usage": 60,
    "disk_usage": 30,
    "active_apps": 2,
    "last_heartbeat": "2026-01-01 00:00:00"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/admin/nodes
```

---

### 6.5 获取节点详情

**端点**: `GET /api/admin/nodes/:nodeId`

**描述**: 获取指定节点的详细信息。

**路径参数**:
- `nodeId`: 节点ID

**响应**:
```json
{
  "id": 1,
  "node_id": "node-001",
  "name": "US-East-1",
  "region": "us-east",
  "type": "worker",
  "port": 3001,
  "status": "online",
  "apps": [
    {
      "id": 1,
      "app_id": "app-001",
      "app_name": "AI Service",
      "version": "1.0.0",
      "status": "running"
    }
  ]
}
```

**错误响应**:
- `404`: 节点不存在

**示例请求**:
```bash
curl http://localhost:3000/api/admin/nodes/node-001
```

---

### 6.6 发送命令

**端点**: `POST /api/admin/nodes/:nodeId/command`

**描述**: 向指定节点发送命令。

**路径参数**:
- `nodeId`: 节点ID

**请求体**:
```json
{
  "type": "string",       // 命令类型
  "payload": {}           // 命令载荷
}
```

**响应**:
```json
{
  "success": true,
  "commandId": "uuid"
}
```

**错误响应**:
- `503`: 节点未连接

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/admin/nodes/node-001/command \
  -H "Content-Type: application/json" \
  -d '{"type": "restart", "payload": {"service": "crawler"}}'
```

---

### 6.7 部署应用

**端点**: `POST /api/admin/nodes/:nodeId/deploy`

**描述**: 向指定节点部署应用。

**路径参数**:
- `nodeId`: 节点ID

**请求体**:
```json
{
  "appId": "string",
  "manifest": {
    "name": "string",
    "version": "string",
    "entrypoint": "string",
    "env": {}
  }
}
```

**响应**:
```json
{
  "success": true,
  "commandId": "uuid",
  "message": "Deploying AI Service to node-001"
}
```

**错误响应**:
- `503`: 节点未连接

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/admin/nodes/node-001/deploy \
  -H "Content-Type: application/json" \
  -d '{"appId": "app-001", "manifest": {"name": "AI Service", "version": "1.0.0"}}'
```

---

### 6.8 卸载应用

**端点**: `POST /api/admin/nodes/:nodeId/unload`

**描述**: 从指定节点卸载应用。

**路径参数**:
- `nodeId`: 节点ID

**请求体**:
```json
{
  "appId": "string"   // 应用ID
}
```

**响应**:
```json
{
  "success": true,
  "commandId": "uuid"
}
```

**错误响应**:
- `503`: 节点未连接

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/admin/nodes/node-001/unload \
  -H "Content-Type: application/json" \
  -d '{"appId": "app-001"}'
```

---

### 6.9 获取节点应用

**端点**: `GET /api/admin/nodes/:nodeId/apps`

**描述**: 获取指定节点上运行的应用列表。

**路径参数**:
- `nodeId`: 节点ID

**响应**:
```json
[
  {
    "id": 1,
    "node_id": "node-001",
    "app_id": "app-001",
    "app_name": "AI Service",
    "version": "1.0.0",
    "status": "running",
    "memory_usage": 256,
    "request_count": 1000,
    "error_count": 5
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/admin/nodes/node-001/apps
```

---

## 7. 计费 API

### 7.1 获取定价配置

**端点**: `GET /api/admin/pricing`

**描述**: 获取所有功能的定价配置。

**响应**:
```json
[
  {
    "id": 1,
    "feature_key": "ai_blog",
    "feature_name": "AI博客生成",
    "credit_cost": 5,
    "created_at": "2026-01-01 00:00:00",
    "updated_at": "2026-01-01 00:00:00"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/admin/pricing
```

---

### 7.2 更新定价

**端点**: `POST /api/admin/pricing`

**描述**: 更新指定功能的积分消耗。

**请求体**:
```json
{
  "feature_key": "string",   // 功能键名
  "credit_cost": "number"    // 积分消耗
}
```

**响应**:
```json
{
  "success": true
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/admin/pricing \
  -H "Content-Type: application/json" \
  -d '{"feature_key": "ai_blog", "credit_cost": 10}'
```

---

### 7.3 获取积分套餐

**端点**: `GET /api/admin/packages`

**描述**: 获取所有积分套餐列表。

**响应**:
```json
[
  {
    "id": 1,
    "name": "基础套餐",
    "credits": 100,
    "price": 9.99,
    "created_at": "2026-01-01 00:00:00"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/admin/packages
```

---

### 7.4 创建套餐

**端点**: `POST /api/admin/packages`

**描述**: 创建一个新的积分套餐。

**请求体**:
```json
{
  "name": "string",      // 套餐名称
  "credits": "number",   // 积分数量
  "price": "number"      // 价格
}
```

**响应**:
```json
{
  "id": 1
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/admin/packages \
  -H "Content-Type: application/json" \
  -d '{"name": "专业套餐", "credits": 500, "price": 39.99}'
```

---

### 7.5 删除套餐

**端点**: `DELETE /api/admin/packages/:id`

**描述**: 删除指定的积分套餐。

**路径参数**:
- `id`: 套餐ID

**响应**:
```json
{
  "success": true
}
```

**示例请求**:
```bash
curl -X DELETE http://localhost:3000/api/admin/packages/1
```

---

### 7.6 获取账单历史

**端点**: `GET /api/admin/billing-history`

**描述**: 获取账单历史记录。

**响应**:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "amount": 39.99,
    "credits_added": 500,
    "payment_method": "credit_card",
    "invoice_no": "INV-1704067200000-123",
    "created_at": "2026-01-01 00:00:00",
    "email": "user@example.com",
    "name": "用户名"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/admin/billing-history
```

---

### 7.7 创建账单

**端点**: `POST /api/admin/billing-history`

**描述**: 创建一条账单记录（充值）。

**请求体**:
```json
{
  "user_id": "number",          // 用户ID
  "amount": "number",           // 金额
  "credits_added": "number",    // 充值积分数
  "payment_method": "string"    // 支付方式
}
```

**响应**:
```json
{
  "id": 1,
  "invoice_no": "INV-1704067200000-123"
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/admin/billing-history \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "amount": 39.99, "credits_added": 500, "payment_method": "credit_card"}'
```

---

## 8. AI 生成 API

### 8.1 AI 内容生成

**端点**: `POST /api/ai/generate`

**描述**: 使用 AI 生成内容，支持多种 AI 提供商。

**请求体**:
```json
{
  "prompt": "string",           // 提示词（必填）
  "provider": "string",         // 提供商：gemini, openai, kimi, volcengine, minimax（必填）
  "model": "string",            // 模型名称（可选）
  "systemInstruction": "string", // 系统指令（可选）
  "projectId": "number",        // 项目ID，用于知识库上下文（可选）
  "featureKey": "string"        // 功能键，用于计费（可选，默认 ai_blog）
}
```

**支持的提供商及默认模型**:
- `gemini`: gemini-2.0-flash
- `openai`: gpt-4o-mini
- `kimi`: moonshot-v1-8k
- `volcengine`: 需指定模型
- `minimax`: abab6.5-chat

**响应**:
```json
{
  "text": "生成的内容..."
}
```

**错误响应**:
- `400`: 无 API 密钥配置或不支持的提供商
- `402`: 积分不足
- `500`: 生成失败

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "写一篇关于AI的文章", "provider": "openai", "model": "gpt-4o-mini"}'
```

---

## 9. 模块化应用 API

### 9.1 获取应用列表

**端点**: `GET /api/modular-apps`

**描述**: 获取所有模块化应用列表。

**响应**:
```json
[
  {
    "id": 1,
    "name": "PolyBot Pro",
    "app_key": "polybot-pro",
    "description": "Polymarket 自动交易机器人",
    "status": "active",
    "current_version_id": 1,
    "version_number": "1.0.0",
    "endpoint_url": "http://localhost:3001",
    "changelog": "初始版本",
    "public_configs": {
      "max_concurrency": 5,
      "slippage_tolerance": 1.5
    }
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/modular-apps
```

---

### 9.2 获取应用配置

**端点**: `GET /api/modular-apps/:id/configs`

**描述**: 获取指定应用的所有配置项。

**路径参数**:
- `id`: 应用ID

**响应**:
```json
[
  {
    "id": 1,
    "app_id": 1,
    "config_key": "max_concurrency",
    "config_value": "5",
    "description": "最大并发数",
    "is_public": 1,
    "created_at": "2026-01-01 00:00:00"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/modular-apps/1/configs
```

---

### 9.3 更新应用配置

**端点**: `POST /api/modular-apps/:id/configs`

**描述**: 更新或创建应用的配置项。

**路径参数**:
- `id`: 应用ID

**请求体**:
```json
{
  "config_key": "string",      // 配置键名
  "config_value": "string",    // 配置值
  "description": "string",     // 描述（可选）
  "is_public": "boolean"       // 是否公开（可选）
}
```

**响应**:
```json
{
  "success": true
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/modular-apps/1/configs \
  -H "Content-Type: application/json" \
  -d '{"config_key": "max_concurrency", "config_value": "10", "description": "最大并发数"}'
```

---

### 9.4 获取应用版本

**端点**: `GET /api/modular-apps/:id/versions`

**描述**: 获取指定应用的版本历史。

**路径参数**:
- `id`: 应用ID

**响应**:
```json
[
  {
    "id": 1,
    "app_id": 1,
    "version_number": "1.0.0",
    "endpoint_url": "http://localhost:3001",
    "changelog": "初始版本",
    "created_at": "2026-01-01 00:00:00"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/modular-apps/1/versions
```

---

### 9.5 升级应用

**端点**: `POST /api/modular-apps/:id/upgrade`

**描述**: 将应用升级到指定版本。

**路径参数**:
- `id`: 应用ID

**请求体**:
```json
{
  "version_id": "number"   // 目标版本ID
}
```

**响应**:
```json
{
  "success": true,
  "message": "Upgrade started."
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/modular-apps/1/upgrade \
  -H "Content-Type: application/json" \
  -d '{"version_id": 2}'
```

---

## 10. 第三方集成 API

### 10.1 获取SaaS配置

**端点**: `GET /api/admin/saas-configs`

**描述**: 获取所有第三方 SaaS 配置列表。

**响应**:
```json
[
  {
    "id": 1,
    "name": "LinkedIn Helper",
    "type": "linkedin",
    "api_key": "xxx",
    "api_secret": "xxx",
    "base_url": "https://api.linkedin-helper.com",
    "status": "active",
    "created_at": "2026-01-01 00:00:00"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/admin/saas-configs
```

---

### 10.2 创建SaaS配置

**端点**: `POST /api/admin/saas-configs`

**描述**: 创建一个新的第三方 SaaS 配置。

**请求体**:
```json
{
  "name": "string",         // 配置名称
  "type": "string",         // 类型：linkedin, customs, crm
  "api_key": "string",      // API密钥
  "api_secret": "string",   // API密钥密文（可选）
  "base_url": "string"      // 基础URL
}
```

**响应**:
```json
{
  "id": 1,
  "success": true
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/admin/saas-configs \
  -H "Content-Type: application/json" \
  -d '{"name": "ImportGenius", "type": "customs", "api_key": "xxx", "base_url": "https://api.importgenius.com"}'
```

---

### 10.3 删除SaaS配置

**端点**: `DELETE /api/admin/saas-configs/:id`

**描述**: 删除指定的 SaaS 配置。

**路径参数**:
- `id`: 配置ID

**响应**:
```json
{
  "success": true
}
```

**示例请求**:
```bash
curl -X DELETE http://localhost:3000/api/admin/saas-configs/1
```

---

### 10.4 LinkedIn搜索

**端点**: `POST /api/saas/linkedin/search`

**描述**: 通过 LinkedIn 服务搜索用户信息。

**请求体**:
```json
{
  "query": "string"   // 搜索关键词
}
```

**响应**:
```json
[
  {
    "name": "John Doe",
    "title": "Procurement Manager",
    "company": "Global Sourcing Ltd",
    "location": "London, UK"
  }
]
```

**错误响应**:
- `503`: LinkedIn 服务未配置

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/saas/linkedin/search \
  -H "Content-Type: application/json" \
  -d '{"query": "procurement manager"}'
```

---

### 10.5 海关数据搜索

**端点**: `POST /api/saas/customs/search`

**描述**: 搜索海关进出口数据。

**请求体**:
```json
{
  "hsCode": "string",    // HS编码（可选）
  "country": "string"    // 国家（可选）
}
```

**响应**:
```json
[
  {
    "importer": "US Retail Corp",
    "exporter": "China Tools Factory",
    "date": "2026-01-15",
    "weight": "5000kg"
  }
]
```

**错误响应**:
- `503`: 海关数据服务未配置

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/saas/customs/search \
  -H "Content-Type: application/json" \
  -d '{"hsCode": "8467", "country": "US"}'
```

---

### 10.6 CRM同步

**端点**: `POST /api/saas/crm/sync`

**描述**: 将线索数据同步到 CRM 系统。

**请求体**:
```json
{
  "leads": [
    {
      "name": "string",
      "email": "string",
      "company": "string"
    }
  ]
}
```

**响应**:
```json
{
  "success": true,
  "syncedCount": 10
}
```

**错误响应**:
- `503`: CRM 服务未配置

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/saas/crm/sync \
  -H "Content-Type: application/json" \
  -d '{"leads": [{"name": "John Doe", "email": "john@example.com", "company": "ABC Corp"}]}'
```

---

## 11. 其他 API

### 11.1 获取专用IP列表

**端点**: `GET /api/admin/dedicated-ips`

**描述**: 获取所有专用IP地址列表。

**响应**:
```json
[
  {
    "id": 1,
    "ip_address": "192.168.1.100",
    "server_id": "server-001",
    "user_id": 1,
    "status": "assigned",
    "expires_at": "2026-12-31 00:00:00",
    "username": "用户名",
    "email": "user@example.com"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/admin/dedicated-ips
```

---

### 11.2 创建专用IP

**端点**: `POST /api/admin/dedicated-ips`

**描述**: 分配一个新的专用IP地址。

**请求体**:
```json
{
  "ip_address": "string",     // IP地址
  "server_id": "string",      // 服务器ID
  "user_id": "number",        // 用户ID
  "expires_at": "string"      // 过期时间
}
```

**响应**:
```json
{
  "id": 1,
  "success": true
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/admin/dedicated-ips \
  -H "Content-Type: application/json" \
  -d '{"ip_address": "192.168.1.100", "server_id": "server-001", "user_id": 1, "expires_at": "2026-12-31"}'
```

---

### 11.3 获取浏览器环境

**端点**: `GET /api/admin/environments`

**描述**: 获取所有浏览器环境配置。

**响应**:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "ip_id": 1,
    "name": "环境1",
    "user_agent": "Mozilla/5.0...",
    "proxy": "http://...",
    "username": "用户名",
    "ip_address": "192.168.1.100"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/admin/environments
```

---

### 11.4 获取店铺列表

**端点**: `GET /api/stores/:projectId`

**描述**: 获取指定项目的店铺列表。

**路径参数**:
- `projectId`: 项目ID

**响应**:
```json
[
  {
    "id": 1,
    "project_id": 1,
    "type": "shopify",
    "auth_method": "oauth",
    "store_url": "https://store.myshopify.com",
    "status": "connected",
    "created_at": "2026-01-01 00:00:00"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/stores/1
```

---

### 11.5 绑定店铺

**端点**: `POST /api/stores/:projectId/bind`

**描述**: 绑定一个店铺到项目。

**路径参数**:
- `projectId`: 项目ID

**请求体**:
```json
{
  "type": "string",              // 店铺类型：shopify, woocommerce
  "auth_method": "string",       // 认证方式：oauth, api_key
  "store_url": "string",         // 店铺URL
  "access_token": "string",      // 访问令牌（可选）
  "username": "string",          // 用户名（可选）
  "password": "string"           // 密码（可选）
}
```

**响应**:
```json
{
  "id": 1,
  "status": "connected"
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/stores/1/bind \
  -H "Content-Type: application/json" \
  -d '{"type": "shopify", "auth_method": "oauth", "store_url": "https://store.myshopify.com", "access_token": "xxx"}'
```

---

### 11.6 获取模型配置

**端点**: `GET /api/admin/model-configs`

**描述**: 获取所有 AI 模型配置列表（用于轮询）。

**响应**:
```json
[
  {
    "id": 1,
    "provider": "openai",
    "api_key": "sk-xxx",
    "base_url": null,
    "is_active": 1,
    "last_used_at": "2026-01-01 00:00:00"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/admin/model-configs
```

---

### 11.7 创建模型配置

**端点**: `POST /api/admin/model-configs`

**描述**: 添加一个新的 AI 模型配置。

**请求体**:
```json
{
  "provider": "string",     // 提供商名称
  "api_key": "string",      // API密钥
  "base_url": "string"      // 基础URL（可选）
}
```

**响应**:
```json
{
  "id": 1
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/admin/model-configs \
  -H "Content-Type: application/json" \
  -d '{"provider": "openai", "api_key": "sk-xxxxxxxx"}'
```

---

### 11.8 删除模型配置

**端点**: `DELETE /api/admin/model-configs/:id`

**描述**: 删除指定的模型配置。

**路径参数**:
- `id`: 配置ID

**响应**:
```json
{
  "success": true
}
```

**示例请求**:
```bash
curl -X DELETE http://localhost:3000/api/admin/model-configs/1
```

---

### 11.9 获取外部API密钥

**端点**: `GET /api/admin/external-keys`

**描述**: 获取所有外部 API 密钥列表。

**响应**:
```json
[
  {
    "id": 1,
    "key_value": "sk-xxxxxxxxxxxx",
    "name": "Production Key",
    "status": "active",
    "created_at": "2026-01-01 00:00:00"
  }
]
```

**示例请求**:
```bash
curl http://localhost:3000/api/admin/external-keys
```

---

### 11.10 创建外部API密钥

**端点**: `POST /api/admin/external-keys`

**描述**: 创建一个新的外部 API 密钥。

**请求体**:
```json
{
  "name": "string"   // 密钥名称
}
```

**响应**:
```json
{
  "id": 1,
  "key_value": "sk-xxxxxxxxxxxx"
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/admin/external-keys \
  -H "Content-Type: application/json" \
  -d '{"name": "Production Key"}'
```

---

### 11.11 删除外部API密钥

**端点**: `DELETE /api/admin/external-keys/:id`

**描述**: 删除指定的外部 API 密钥。

**路径参数**:
- `id`: 密钥ID

**响应**:
```json
{
  "success": true
}
```

**示例请求**:
```bash
curl -X DELETE http://localhost:3000/api/admin/external-keys/1
```

---

### 11.12 轮换API密钥

**端点**: `POST /api/admin/external-keys/:id/rotate`

**描述**: 轮换（重新生成）指定的 API 密钥。

**路径参数**:
- `id`: 密钥ID

**响应**:
```json
{
  "success": true,
  "key_value": "sk-new-xxxxxxxxxxxx"
}
```

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/admin/external-keys/1/rotate
```

---

### 11.13 外部API生成

**端点**: `POST /api/external/generate`

**描述**: 通过外部 API 密钥调用 AI 生成接口。

**请求头**:
- `Authorization`: `Bearer <api_key>`

**请求体**: 与 `/api/ai/generate` 相同

**响应**: 与 `/api/ai/generate` 相同

**错误响应**:
- `401`: 未授权或无效的 API 密钥

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/external/generate \
  -H "Authorization: Bearer sk-xxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "写一篇文章", "provider": "openai"}'
```

---

### 11.14 模块化应用代理

**端点**: `ALL /api/app/:appKey/*`

**描述**: 代理请求到指定的模块化应用。

**路径参数**:
- `appKey`: 应用标识键

**响应**:
```json
{
  "app": "PolyBot Pro",
  "version": "1.0.0",
  "path": "requested/path",
  "data": "Response from app...",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

**错误响应**:
- `404`: 应用不存在
- `503`: 应用不可用（升级中或未激活）

**示例请求**:
```bash
curl http://localhost:3000/api/app/polybot-pro/status
```

---

### 11.15 节点应用代理

**端点**: `ALL /api/node/:nodeId/app/:appId/*`

**描述**: 代理请求到指定节点上的应用。

**路径参数**:
- `nodeId`: 节点ID
- `appId`: 应用ID

**响应**:
```json
{
  "success": true,
  "message": "Command sent to node",
  "commandId": "uuid"
}
```

**错误响应**:
- `503`: 节点未连接

**示例请求**:
```bash
curl http://localhost:3000/api/node/node-001/app/app-001/api/data
```

---

## WebSocket 接口

### 节点连接

**端点**: `ws://localhost:3000/ws/node`

**描述**: 节点通过 WebSocket 与服务器建立长连接。

**连接要求**:
- 请求头包含 `X-Node-Id`: 节点ID
- 请求头包含 `Authorization`: `Bearer <token>`

**消息格式**:

服务器发送：
```json
{
  "type": "connected",
  "nodeId": "node-001"
}
```

```json
{
  "type": "command",
  "payload": {
    "id": "uuid",
    "type": "app_load",
    "payload": {},
    "timestamp": "2026-01-01T00:00:00.000Z"
  }
}
```

客户端发送：
```json
{
  "type": "pong"
}
```

```json
{
  "type": "status",
  "payload": {
    "cpu": 45,
    "memory": 60,
    "disk": 30
  }
}
```

---

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（未登录或令牌无效） |
| 402 | 积分不足 |
| 403 | 禁止访问（权限不足或账户被封禁） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 503 | 服务不可用（如节点未连接、服务未配置） |

---

## 数据类型说明

### 用户等级 (tier)
- `free`: 免费用户
- `pro`: 专业用户
- `enterprise`: 企业用户

### 订单状态 (status)
- `open`: 开仓中
- `filled`: 已成交
- `closed`: 已平仓
- `cancelled`: 已取消

### 交易模式 (mode)
- `paper`: 模拟盘
- `live`: 实盘

### 节点状态 (status)
- `online`: 在线
- `offline`: 离线

### 应用状态 (status)
- `active`: 激活
- `inactive`: 未激活
- `upgrading`: 升级中

---

*文档生成时间: 2026-03-06*
