# Node.js 安装指南

## 步骤 1：下载 Node.js

1. 访问 [Node.js 官方网站](https://nodejs.org/)
2. 下载适合您系统的 LTS 版本（推荐）
3. 对于 Windows 系统，选择 `.msi` 安装包

## 步骤 2：安装 Node.js

1. 运行下载的安装包
2. 按照安装向导的提示进行操作
3. 确保选中 "Add to PATH" 选项，这样 npm 命令就可以在任何位置使用
4. 完成安装后，重启计算机以确保环境变量生效

## 步骤 3：验证安装

1. 打开命令提示符或 PowerShell
2. 运行以下命令验证 Node.js 和 npm 是否安装成功：

   ```bash
   node -v
   npm -v
   ```

   如果显示版本号，则表示安装成功。

## 步骤 4：启动服务节点代理

1. 打开命令提示符或 PowerShell
2. 导航到服务节点代理目录：

   ```bash
   cd G:\b2b-over-sever-framework\node-agent
   ```

3. 安装依赖（如果尚未安装）：

   ```bash
   npm install
   ```

4. 启动开发服务器：

   ```bash
   npm run dev
   ```

## 步骤 5：验证服务节点代理是否运行

1. 服务启动后，您应该看到类似以下的日志：

   ```
   [2026-03-06 12:00:00] INFO: Node agent starting...
   [2026-03-06 12:00:00] INFO: HTTP server started on port 3001
   [2026-03-06 12:00:00] INFO: Connecting to master server...
   [2026-03-06 12:00:00] INFO: Loading applications...
   [2026-03-06 12:00:00] INFO: Application data-scraper loaded successfully
   [2026-03-06 12:00:00] INFO: Application trading-bot loaded successfully
   [2026-03-06 12:00:00] INFO: Node agent started successfully
   ```

2. 打开浏览器，访问 http://localhost:3001/health，应该看到健康检查响应。

## 可能遇到的问题及解决方案

### 问题 1：npm 命令未找到

**解决方案**：
- 确保 Node.js 安装时选中了 "Add to PATH" 选项
- 重启计算机以确保环境变量生效
- 手动将 Node.js 安装目录添加到系统环境变量 PATH 中

### 问题 2：依赖安装失败

**解决方案**：
- 检查网络连接
- 尝试使用 npm 镜像：
  ```bash
  npm install --registry=https://registry.npmmirror.com
  ```
- 清除 npm 缓存：
  ```bash
  npm cache clean --force
  ```

### 问题 3：服务启动失败

**解决方案**：
- 检查端口 3001 是否被占用
- 检查配置文件 `config/default.json` 中的设置
- 查看日志文件了解具体错误信息

## 配置说明

服务节点代理的配置文件位于 `config/default.json`，您可以根据需要修改以下配置：

- `node.name`：节点名称
- `node.region`：节点区域
- `node.type`：节点类型
- `node.port`：HTTP 服务器端口
- `master.url`：主控服务器 URL
- `security.secretKey`：安全密钥
- `apps.directory`：应用目录
- `monitor.interval`：监控间隔

## 应用开发

要开发新的应用，请在 `apps` 目录下创建新的应用文件夹，包含以下文件：

1. `manifest.json`：应用配置文件
2. `index.js`：应用入口文件

详细的应用开发指南请参考 `README.md` 文件。

## 启动选项

- 开发模式：`npm run dev`
- 构建项目：`npm run build`
- 生产模式启动：`npm start`