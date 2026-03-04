# ServerManager

BuildAI 平台的远程服务器 Web 管理应用，提供 Web 终端、文件管理、进程管理等功能。

## 功能特性

- **Dashboard**: 系统信息监控 (CPU、内存、磁盘、网络)
- **Web Terminal**: 基于 WebSocket 的交互式终端
- **文件管理**: 浏览、编辑、上传、下载文件
- **进程管理**: 查看和结束进程
- **服务管理**: systemd 服务管理 (启动/停止/重启/查看日志)

## 技术栈

### 后端
- Node.js + TypeScript
- Express + Socket.io
- node-pty (终端仿真)
- Multer (文件上传)
- Winston (日志)

### 前端
- React + TypeScript
- Vite
- Ant Design
- xterm.js (终端组件)
- Socket.io-client
- Recharts (图表)

## 快速开始

### 开发环境

```bash
# 启动后端
cd backend
npm install
npm run dev

# 启动前端
cd frontend
npm install
npm run dev
```

### Docker 部署

```bash
# 构建并运行
docker-compose up -d

# 访问 http://localhost:3001
```

## API 接口

所有 API 响应格式：
```typescript
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
```

### 系统信息
- `GET /api/system/info` - 完整系统信息
- `GET /api/system/cpu` - CPU 信息
- `GET /api/system/memory` - 内存信息
- `GET /api/system/disk` - 磁盘信息
- `GET /api/system/network` - 网络信息

### 文件管理
- `GET /api/files/list?path=/` - 列出目录
- `GET /api/files/content?path=/file` - 读取文件
- `POST /api/files/content` - 保存文件
- `POST /api/files/mkdir` - 创建目录
- `DELETE /api/files/delete?path=/file` - 删除文件

### 进程管理
- `GET /api/processes/list` - 进程列表
- `POST /api/processes/kill` - 结束进程

### 服务管理
- `GET /api/services/list` - 服务列表
- `GET /api/services/:name/status` - 服务状态
- `POST /api/services/:name/start` - 启动服务
- `POST /api/services/:name/stop` - 停止服务
- `POST /api/services/:name/restart` - 重启服务

### WebSocket 终端
- `terminal:create` - 创建终端
- `terminal:input` - 发送输入
- `terminal:resize` - 调整大小
- `terminal:data` - 接收输出

## 项目结构

```
server-manager/
├── backend/
│   ├── src/
│   │   ├── routes/        # API 路由
│   │   ├── middleware/    # 中间件
│   │   ├── utils/         # 工具函数
│   │   ├── types/         # 类型定义
│   │   └── server.ts      # 入口文件
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── utils/         # 工具函数
│   │   ├── types/         # 类型定义
│   │   └── App.tsx        # 主应用
│   ├── package.json
│   └── vite.config.ts
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 许可证

MIT
