# LogCollector - 集中式日志收集与分析平台

## 简介

LogCollector 是 BuildAI Framework 的集中式日志收集与分析平台，提供统一的日志采集、存储、搜索和分析能力。支持多种日志来源，提供实时日志查看、全文检索、日志告警等功能。

核心功能：
- 多源日志收集（文件、容器、应用）
- 实时日志查看
- 全文检索和过滤
- 日志告警规则
- 日志分析和统计
- 可视化仪表盘

## 功能特性

### 日志收集
- ✅ **文件日志** - 监控本地日志文件
- ✅ **容器日志** - 自动收集 Docker 容器日志
- ✅ **应用日志** - 通过 SDK/API 发送日志
- ✅ **Syslog** - 接收 Syslog 协议日志
- ✅ **日志解析** - 自动解析 JSON、Nginx、Apache 等格式

### 日志搜索
- ✅ **全文检索** - 基于 Elasticsearch 的全文搜索
- ✅ **字段过滤** - 按时间、级别、服务等字段过滤
- ✅ **高级查询** - Lucene 语法支持
- ✅ **搜索历史** - 保存常用查询
- ✅ **实时搜索** - 实时日志流

### 日志告警
- ✅ **关键字告警** - 匹配关键字触发告警
- ✅ **阈值告警** - 日志数量超限告警
- ✅ **异常检测** - 基于模式识别异常
- ✅ **多通知渠道** - 邮件、Webhook、钉钉等

### 日志分析
- ✅ **日志统计** - 日志级别分布、趋势图
- ✅ **服务分析** - 各服务日志量统计
- ✅ **错误分析** - 错误日志聚类分析
- ✅ **性能分析** - 响应时间分析

## 技术栈

### 后端
- **Framework**: NestJS 10
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **Search**: Elasticsearch 8+
- **Cache**: Redis
- **ORM**: TypeORM
- **Queue**: Bull

### 前端
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Ant Design
- **Charts**: Recharts
- **State**: Zustand

## 快速开始

### 环境要求
- Node.js 20+
- PostgreSQL 14+
- Elasticsearch 8+
- Redis 7+

### 安装依赖

```bash
# 后端
cd apps/logcollector/backend
npm install

# 前端
cd ../frontend
npm install
```

### 环境配置

```bash
# 后端配置
cd apps/logcollector/backend
cp .env.example .env

# 编辑 .env 文件
```

### 数据库初始化

```bash
cd apps/logcollector/backend
npm run migration:run
```

### 启动开发服务器

```bash
# 后端 (端口 3000)
cd apps/logcollector/backend
npm run start:dev

# 前端 (端口 5173)
cd apps/logcollector/frontend
npm run dev
```

### 生产构建

```bash
# 后端
cd apps/logcollector/backend
npm run build

# 前端
cd apps/logcollector/frontend
npm run build
```

## 使用 SDK 发送日志

### JavaScript/TypeScript

```typescript
import { LogCollector } from '@buildai/logcollector-sdk';

const logger = new LogCollector({
  endpoint: 'http://localhost:3000',
  apiKey: 'your-api-key',
  service: 'my-service',
  environment: 'production'
});

// 发送日志
logger.info('用户登录成功', { userId: '123' });
logger.error('数据库连接失败', { error: err.message });
logger.warn('API 响应慢', { duration: 5000 });
```

### Python

```python
from logcollector import LogCollector

logger = LogCollector(
    endpoint='http://localhost:3000',
    api_key='your-api-key',
    service='my-service'
)

logger.info('用户登录成功', extra={'user_id': '123'})
logger.error('数据库连接失败', extra={'error': str(err)})
```

### HTTP API

```bash
curl -X POST http://localhost:3000/api/v1/logs/ingest \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "service": "my-service",
    "level": "info",
    "message": "用户登录成功",
    "metadata": {
      "userId": "123",
      "ip": "192.168.1.1"
    }
  }'
```

## API 文档

启动后端后访问：
```
http://localhost:3000/api/docs
```

### 主要 API

#### 日志接收
- `POST /api/v1/logs/ingest` - 接收单条日志
- `POST /api/v1/logs/bulk` - 批量接收日志

#### 日志查询
- `GET /api/v1/logs/search` - 搜索日志
- `GET /api/v1/logs/stream` - 实时日志流 (SSE)

#### 日志源管理
- `GET /api/v1/sources` - 获取日志源列表
- `POST /api/v1/sources` - 创建日志源
- `PUT /api/v1/sources/:id` - 更新日志源
- `DELETE /api/v1/sources/:id` - 删除日志源

#### 告警规则
- `GET /api/v1/alerts/rules` - 获取告警规则
- `POST /api/v1/alerts/rules` - 创建告警规则
- `PUT /api/v1/alerts/rules/:id` - 更新告警规则

#### 仪表盘
- `GET /api/v1/dashboard/overview` - 日志概览
- `GET /api/v1/dashboard/level-distribution` - 级别分布
- `GET /api/v1/dashboard/service-stats` - 服务统计

## 部署

### Docker 部署

```bash
cd apps/logcollector
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
   DB_DATABASE=logcollector
   ELASTICSEARCH_HOST=localhost
   ELASTICSEARCH_PORT=9200
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

2. **配置 Nginx**
   ```nginx
   server {
       listen 80;
       server_name logs.yourdomain.com;
       
       location / {
           root /path/to/logcollector/frontend/dist;
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
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
apps/logcollector/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── logs/         # 日志模块
│   │   │   ├── sources/      # 日志源模块
│   │   │   ├── alerts/       # 告警模块
│   │   │   └── dashboard/    # 仪表盘模块
│   │   ├── search/           # 搜索服务
│   │   └── main.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/            # 页面
│   │   └── App.tsx
│   └── package.json
└── docker-compose.yml
```

## 日志源配置

### 文件日志

```json
{
  "name": "应用日志",
  "type": "file",
  "config": {
    "path": "/var/log/app/*.log",
    "parser": "json",
    "service": "my-app"
  }
}
```

### Docker 日志

```json
{
  "name": "容器日志",
  "type": "docker",
  "config": {
    "containers": ["app-1", "app-2"],
    "labels": {
      "service": "my-service"
    }
  }
}
```

### Syslog

```json
{
  "name": "Syslog 接收",
  "type": "syslog",
  "config": {
    "port": 514,
    "protocol": "udp"
  }
}
```

## 告警规则配置

### 关键字告警

```json
{
  "name": "错误日志告警",
  "condition": {
    "type": "keyword",
    "keyword": "ERROR",
    "source": "my-app"
  },
  "notification": {
    "channels": ["email", "webhook"]
  }
}
```

### 阈值告警

```json
{
  "name": "日志量告警",
  "condition": {
    "type": "threshold",
    "field": "count",
    "operator": ">",
    "value": 1000,
    "window": "5m"
  }
}
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
| ELASTICSEARCH_HOST | ES 主机 | 是 |
| ELASTICSEARCH_PORT | ES 端口 | 是 |
| REDIS_HOST | Redis 主机 | 是 |
| REDIS_PORT | Redis 端口 | 是 |

## 许可证

MIT
