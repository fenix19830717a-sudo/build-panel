# ServerManager - 远程服务器 Web 管理工具

## 简介

ServerManager 是 BuildAI Framework 的远程服务器 Web 管理应用，提供基于 Web 的服务器管理能力。无需 SSH 客户端，通过浏览器即可完成文件管理、进程管理、服务管理等操作。

核心功能：
- Web 终端（基于 WebSocket）
- 文件管理器（浏览、编辑、上传、下载）
- 进程管理（查看、结束进程）
- 服务管理（systemd 服务操作）
- 系统监控（CPU、内存、磁盘、网络）

## 功能特性

### Web 终端
- ✅ **交互式终端** - 基于 node-pty 和 xterm.js
- ✅ **多会话** - 同时打开多个终端
- ✅ **会话保持** - 刷新页面不丢失会话
- ✅ **命令历史** - 支持上下键浏览历史
- ✅ **快捷键** - 支持 Ctrl+C、Ctrl+V 等

### 文件管理器
- ✅ **文件浏览** - 树形目录结构
- ✅ **文件编辑** - 内置代码编辑器（Monaco Editor）
- ✅ **文件上传** - 拖拽上传、多文件上传
- ✅ **文件下载** - 单文件/目录打包下载
- ✅ **压缩解压** - 支持 zip、tar.gz
- ✅ **权限管理** - 修改文件权限和所有者
- ✅ **搜索** - 文件内容搜索

### 进程管理
- ✅ **进程列表** - 实时显示所有进程
- ✅ **进程详情** - CPU、内存、启动时间等
- ✅ **结束进程** - 发送信号终止进程
- ✅ **进程树** - 树形展示进程关系
- ✅ **性能分析** - 高 CPU/内存进程高亮

### 服务管理
- ✅ **服务列表** - 所有 systemd 服务
- ✅ **服务控制** - 启动、停止、重启
- ✅ **开机自启** - 启用/禁用开机启动
- ✅ **日志查看** - 实时查看服务日志
- ✅ **服务状态** - 运行状态、最近日志

### 系统监控
- ✅ **Dashboard** - 系统资源总览
- ✅ **CPU 监控** - 使用率、负载、核心详情
- ✅ **内存监控** - 使用率、详情、缓存
- ✅ **磁盘监控** - 使用率、IO、挂载点
- ✅ **网络监控** - 流量、连接、接口
- ✅ **历史趋势** - 资源使用历史图表

## 技术栈

### 后端
- **Framework**: Express.js
- **Language**: TypeScript
- **Terminal**: node-pty
- **File Upload**: Multer
- **WebSocket**: Socket.io
- **Process**: ps-list、pidusage
- **Logging**: Winston

### 前端
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Ant Design
- **Terminal**: xterm.js
- **Editor**: Monaco Editor
- **Charts**: Recharts
- **WebSocket**: Socket.io-client

## 快速开始

### 环境要求
- Node.js 20+
- Linux/macOS（Windows 部分功能受限）

### 安装依赖

```bash
# 后端
cd apps/server-manager/backend
npm install

# 前端
cd ../frontend
npm install
```

### 环境配置

```bash
# 后端配置
cd apps/server-manager/backend
cp .env.example .env

# 编辑 .env 文件
```

### 启动开发服务器

```bash
# 后端 (端口 3000)
cd apps/server-manager/backend
npm run dev

# 前端 (端口 5173)
cd apps/server-manager/frontend
npm run dev
```

### 生产构建

```bash
# 后端
cd apps/server-manager/backend
npm run build

# 前端
cd apps/server-manager/frontend
npm run build
```

## 使用 Docker 部署

```bash
# 构建镜像
docker build -t server-manager .

# 运行容器
docker run -d \
  --name server-manager \
  --privileged \
  -p 3001:3001 \
  -v /:/host:ro \
  -v /var/run/docker.sock:/var/run/docker.sock \
  server-manager
```

## API 文档

### 系统信息

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/system/info` | GET | 完整系统信息 |
| `/api/system/cpu` | GET | CPU 信息 |
| `/api/system/memory` | GET | 内存信息 |
| `/api/system/disk` | GET | 磁盘信息 |
| `/api/system/network` | GET | 网络信息 |
| `/api/system/processes` | GET | 进程列表 |

### 文件管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/files/list` | GET | 列出目录 |
| `/api/files/content` | GET | 读取文件 |
| `/api/files/content` | POST | 保存文件 |
| `/api/files/upload` | POST | 上传文件 |
| `/api/files/download` | GET | 下载文件 |
| `/api/files/mkdir` | POST | 创建目录 |
| `/api/files/delete` | DELETE | 删除文件 |
| `/api/files/rename` | POST | 重命名 |

### 进程管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/processes/list` | GET | 进程列表 |
| `/api/processes/:pid` | GET | 进程详情 |
| `/api/processes/:pid/kill` | POST | 结束进程 |

### 服务管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/services/list` | GET | 服务列表 |
| `/api/services/:name/status` | GET | 服务状态 |
| `/api/services/:name/start` | POST | 启动服务 |
| `/api/services/:name/stop` | POST | 停止服务 |
| `/api/services/:name/restart` | POST | 重启服务 |
| `/api/services/:name/logs` | GET | 服务日志 |

### WebSocket 事件

```javascript
// 终端事件
socket.emit('terminal:create', { id: 'term-1' });
socket.emit('terminal:input', { id: 'term-1', data: 'ls\n' });
socket.emit('terminal:resize', { id: 'term-1', cols: 80, rows: 24 });
socket.on('terminal:data', (data) => console.log(data.output));
```

## 目录结构

```
apps/server-manager/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── system.ts     # 系统信息路由
│   │   │   ├── files.ts      # 文件管理路由
│   │   │   ├── processes.ts  # 进程管理路由
│   │   │   └── services.ts   # 服务管理路由
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── types/
│   │   └── server.ts         # 入口文件
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx    # 仪表盘
│   │   │   ├── Terminal.tsx     # Web 终端
│   │   │   ├── FileManager.tsx  # 文件管理
│   │   │   ├── Processes.tsx    # 进程管理
│   │   │   └── Services.tsx     # 服务管理
│   │   ├── components/
│   │   ├── utils/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 部署

### 使用 Docker Compose

```bash
cd apps/server-manager
docker-compose up -d

# 访问 http://localhost:3001
```

### 生产环境部署

1. **配置环境变量**
   ```bash
   PORT=3001
   NODE_ENV=production
   AUTH_ENABLED=true
   AUTH_USERNAME=admin
   AUTH_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret
   ```

2. **配置 Nginx**
   ```nginx
   server {
       listen 80;
       server_name server.yourdomain.com;
       
       location / {
           root /path/to/server-manager/frontend/dist;
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location /socket.io {
           proxy_pass http://localhost:3001;
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

## 安全建议

⚠️ **警告**：ServerManager 提供强大的服务器管理能力，请确保：

1. **使用 HTTPS** - 始终使用 SSL/TLS 加密
2. **强密码认证** - 启用身份验证，使用强密码
3. **IP 白名单** - 限制可访问的 IP 地址
4. **防火墙规则** - 仅开放必要的端口
5. **审计日志** - 启用操作审计

## 环境变量

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| PORT | 服务端口 | 3001 | 是 |
| NODE_ENV | 运行环境 | development | 是 |
| AUTH_ENABLED | 启用认证 | false | 否 |
| AUTH_USERNAME | 认证用户名 | admin | 否 |
| AUTH_PASSWORD | 认证密码 | admin | 否 |
| JWT_SECRET | JWT 密钥 | - | 条件 |
| UPLOAD_MAX_SIZE | 最大上传大小 | 100MB | 否 |

## 功能限制

### Linux
- ✅ 完全支持所有功能

### macOS
- ⚠️ 部分系统信息获取受限
- ⚠️ 服务管理功能受限

### Windows
- ⚠️ 终端使用 PowerShell/CMD
- ⚠️ 进程管理功能受限
- ⚠️ 服务管理使用 Windows Service
- ⚠️ 部分系统调用不可用

## 故障排除

### 终端无法连接
- 检查 WebSocket 连接
- 检查 node-pty 依赖
- 查看后端日志

### 文件上传失败
- 检查上传大小限制
- 检查磁盘空间
- 检查目录权限

### 进程信息不更新
- 检查系统权限
- 检查 ps 命令可用性

## 许可证

MIT
