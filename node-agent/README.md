# B2B Node Agent - 服务节点代理

这是B2B SaaS平台的服务节点端，用于分布式部署和应用热拔插。

## 功能特性

- **节点注册与心跳**: 自动向主控端注册并定期发送心跳
- **WebSocket实时通信**: 支持双向实时通信
- **应用热拔插**: 支持动态加载、卸载和重载应用
- **系统监控**: 实时监控CPU、内存、磁盘和网络使用情况
- **安全认证**: 基于Token的安全认证机制

## 快速开始

### 1. 安装依赖

```bash
cd node-agent
npm install
```

### 2. 配置

编辑 `config/default.json` 或设置环境变量：

```bash
# 环境变量配置
NODE_ID=node-1
NODE_NAME=My-Node-1
NODE_REGION=us-east
NODE_TYPE=worker
NODE_PORT=3100
MASTER_URL=http://localhost:3000
SECRET_KEY=your-secret-key
```

### 3. 启动

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

## 目录结构

```
node-agent/
├── apps/                    # 应用目录
│   ├── trading-bot/         # 交易机器人应用
│   │   ├── manifest.json    # 应用清单
│   │   └── index.js         # 应用入口
│   └── data-scraper/        # 数据爬虫应用
│       ├── manifest.json
│       └── index.js
├── config/
│   └── default.json         # 默认配置
├── src/
│   ├── index.ts             # 主入口
│   ├── types.ts             # 类型定义
│   ├── logger.ts            # 日志模块
│   ├── monitor.ts           # 系统监控
│   ├── app-loader.ts        # 应用加载器
│   ├── communicator.ts      # 通信模块
│   └── http-server.ts       # HTTP服务器
├── package.json
└── tsconfig.json
```

## 应用开发

### 应用清单 (manifest.json)

```json
{
  "id": "my-app",
  "name": "My Application",
  "version": "1.0.0",
  "entry": "index.js",
  "routes": [
    { "path": "/status", "method": "GET", "handler": "getStatus" },
    { "path": "/execute", "method": "POST", "handler": "execute" }
  ],
  "dependencies": [],
  "permissions": ["network"],
  "enabled": true
}
```

### 应用入口 (index.js)

```javascript
async function onLoad(context) {
  context.log('info', 'App loaded', { nodeId: context.nodeId });
}

async function onUnload() {
  console.log('App unloaded');
}

async function getStatus(context, data) {
  return { status: 'running', timestamp: new Date().toISOString() };
}

async function execute(context, data) {
  const { body } = data;
  context.log('info', 'Executing task', { body });
  return { success: true, result: 'completed' };
}

module.exports = {
  onLoad,
  onUnload,
  getStatus,
  execute
};
```

## API端点

### HTTP端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/status` | GET | 节点状态 |
| `/apps` | GET | 已加载应用列表 |
| `/app/:appId/*` | ALL | 应用路由代理 |

### WebSocket消息

| 类型 | 方向 | 描述 |
|------|------|------|
| `command` | 主控端 -> 节点 | 命令消息 |
| `response` | 节点 -> 主控端 | 命令响应 |
| `status` | 节点 -> 主控端 | 状态更新 |
| `ping/pong` | 双向 | 心跳检测 |

## 命令类型

| 命令 | 描述 |
|------|------|
| `app_load` | 加载应用 |
| `app_unload` | 卸载应用 |
| `app_reload` | 重载应用 |
| `execute` | 执行应用路由 |
| `config_update` | 更新配置 |
| `shutdown` | 关闭节点 |

## 安全说明

1. 所有节点必须使用有效的 `secretKey` 进行注册
2. Token有效期为1小时，需要定期刷新
3. WebSocket连接需要携带有效的Token
4. 建议在生产环境中使用HTTPS和WSS

## 监控指标

节点会定期上报以下指标：

- CPU使用率
- 内存使用率
- 磁盘使用率
- 网络流量
- 活跃应用数量
- 应用状态和统计

## 故障排除

### 节点无法连接主控端

1. 检查 `MASTER_URL` 配置是否正确
2. 确认主控端服务正在运行
3. 检查防火墙设置

### 应用加载失败

1. 检查 `manifest.json` 格式是否正确
2. 确认入口文件存在
3. 查看日志获取详细错误信息

### 心跳超时

1. 检查网络连接稳定性
2. 调整心跳间隔配置
3. 检查主控端是否正常响应
