"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ServerManager 主服务器
 */
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const pty = __importStar(require("node-pty"));
const logger_1 = __importDefault(require("./utils/logger"));
const logger_2 = require("./middleware/logger");
const error_1 = require("./middleware/error");
// 导入路由
const files_1 = __importDefault(require("./routes/files"));
const processes_1 = __importDefault(require("./routes/processes"));
const services_1 = __importDefault(require("./routes/services"));
const system_1 = __importDefault(require("./routes/system"));
// 确保日志目录存在
if (!fs_1.default.existsSync('logs')) {
    fs_1.default.mkdirSync('logs', { recursive: true });
}
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
const PORT = process.env.PORT || 3001;
// 中间件
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false
}));
app.use((0, cors_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(logger_2.requestLogger);
// API 路由
app.use('/api/files', files_1.default);
app.use('/api/processes', processes_1.default);
app.use('/api/services', services_1.default);
app.use('/api/system', system_1.default);
// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// WebSocket 终端管理
const terminals = new Map();
io.on('connection', (socket) => {
    logger_1.default.info(`Client connected: ${socket.id}`);
    // 创建终端会话
    socket.on('terminal:create', (data) => {
        try {
            const shell = os_1.default.platform() === 'win32' ? 'powershell.exe' : 'bash';
            const cols = data.cols || 80;
            const rows = data.rows || 24;
            const ptyProcess = pty.spawn(shell, [], {
                name: 'xterm-color',
                cols,
                rows,
                cwd: process.env.HOME || '/',
                env: process.env
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
                logger_1.default.info(`Terminal ${terminalId} exited with code ${exitCode}, signal ${signal}`);
                terminals.delete(terminalId);
                socket.emit('terminal:exit', { terminalId, exitCode, signal });
            });
            // 保存终端 ID 到 socket
            socket.terminalId = terminalId;
            logger_1.default.info(`Terminal created: ${terminalId}`);
        }
        catch (error) {
            logger_1.default.error('Failed to create terminal:', error);
            socket.emit('terminal:error', { error: error.message });
        }
    });
    // 接收客户端输入
    socket.on('terminal:input', ({ terminalId, data }) => {
        const ptyProcess = terminals.get(terminalId);
        if (ptyProcess) {
            ptyProcess.write(data);
        }
    });
    // 调整终端大小
    socket.on('terminal:resize', ({ terminalId, cols, rows }) => {
        const ptyProcess = terminals.get(terminalId);
        if (ptyProcess) {
            ptyProcess.resize(cols, rows);
        }
    });
    // 关闭终端
    socket.on('terminal:close', ({ terminalId }) => {
        const ptyProcess = terminals.get(terminalId);
        if (ptyProcess) {
            ptyProcess.kill();
            terminals.delete(terminalId);
            logger_1.default.info(`Terminal closed: ${terminalId}`);
        }
    });
    // 处理断开连接
    socket.on('disconnect', () => {
        logger_1.default.info(`Client disconnected: ${socket.id}`);
        // 清理该 socket 关联的终端
        if (socket.terminalId) {
            const ptyProcess = terminals.get(socket.terminalId);
            if (ptyProcess) {
                ptyProcess.kill();
                terminals.delete(socket.terminalId);
                logger_1.default.info(`Terminal cleaned up: ${socket.terminalId}`);
            }
        }
    });
});
// 错误处理
app.use(error_1.notFoundHandler);
app.use(error_1.errorHandler);
// 启动服务器
server.listen(PORT, () => {
    logger_1.default.info(`ServerManager backend running on port ${PORT}`);
    logger_1.default.info(`API available at http://localhost:${PORT}/api`);
});
// 优雅关闭
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM received, shutting down gracefully');
    // 关闭所有终端
    for (const [id, ptyProcess] of terminals) {
        ptyProcess.kill();
        logger_1.default.info(`Terminal killed: ${id}`);
    }
    server.close(() => {
        logger_1.default.info('Server closed');
        process.exit(0);
    });
});
//# sourceMappingURL=server.js.map