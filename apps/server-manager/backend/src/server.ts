/**
 * ServerManager 主服务器
 */
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import os from 'os';
import * as pty from 'node-pty';

import logger from './utils/logger';
import { requestLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/error';

// 导入路由
import filesRouter from './routes/files';
import processesRouter from './routes/processes';
import servicesRouter from './routes/services';
import systemRouter from './routes/system';

// 确保日志目录存在
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs', { recursive: true });
}

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API 路由
app.use('/api/files', filesRouter);
app.use('/api/processes', processesRouter);
app.use('/api/services', servicesRouter);
app.use('/api/system', systemRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket 终端管理
const terminals: Map<string, pty.IPty> = new Map();

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  // 创建终端会话
  socket.on('terminal:create', (data: { cols?: number; rows?: number }) => {
    try {
      const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
      const cols = data.cols || 80;
      const rows = data.rows || 24;
      
      const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols,
        rows,
        cwd: process.env.HOME || '/',
        env: process.env as { [key: string]: string }
      });
      
      const terminalId = `term_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      terminals.set(terminalId, ptyProcess);
      
      // 发送终端 ID 给客户端
      socket.emit('terminal:created', { terminalId });
      
      // 转发终端输出到客户端
      ptyProcess.onData((data) => {
        socket.emit('terminal:data', { terminalId, data });
      });
      
      // 处理终端退出
      ptyProcess.onExit(({ exitCode, signal }) => {
        logger.info(`Terminal ${terminalId} exited with code ${exitCode}, signal ${signal}`);
        terminals.delete(terminalId);
        socket.emit('terminal:exit', { terminalId, exitCode, signal });
      });
      
      // 保存终端 ID 到 socket
      socket.terminalId = terminalId;
      
      logger.info(`Terminal created: ${terminalId}`);
    } catch (error: any) {
      logger.error('Failed to create terminal:', error);
      socket.emit('terminal:error', { error: error.message });
    }
  });
  
  // 接收客户端输入
  socket.on('terminal:input', ({ terminalId, data }: { terminalId: string; data: string }) => {
    const ptyProcess = terminals.get(terminalId);
    if (ptyProcess) {
      ptyProcess.write(data);
    }
  });
  
  // 调整终端大小
  socket.on('terminal:resize', ({ terminalId, cols, rows }: { terminalId: string; cols: number; rows: number }) => {
    const ptyProcess = terminals.get(terminalId);
    if (ptyProcess) {
      ptyProcess.resize(cols, rows);
    }
  });
  
  // 关闭终端
  socket.on('terminal:close', ({ terminalId }: { terminalId: string }) => {
    const ptyProcess = terminals.get(terminalId);
    if (ptyProcess) {
      ptyProcess.kill();
      terminals.delete(terminalId);
      logger.info(`Terminal closed: ${terminalId}`);
    }
  });
  
  // 处理断开连接
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
    // 清理该 socket 关联的终端
    if (socket.terminalId) {
      const ptyProcess = terminals.get(socket.terminalId);
      if (ptyProcess) {
        ptyProcess.kill();
        terminals.delete(socket.terminalId);
        logger.info(`Terminal cleaned up: ${socket.terminalId}`);
      }
    }
  });
});

// 错误处理
app.use(notFoundHandler);
app.use(errorHandler);

// 启动服务器
server.listen(PORT, () => {
  logger.info(`ServerManager backend running on port ${PORT}`);
  logger.info(`API available at http://localhost:${PORT}/api`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  // 关闭所有终端
  for (const [id, ptyProcess] of terminals) {
    ptyProcess.kill();
    logger.info(`Terminal killed: ${id}`);
  }
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// TypeScript 类型扩展
declare module 'socket.io' {
  interface Socket {
    terminalId?: string;
  }
}
