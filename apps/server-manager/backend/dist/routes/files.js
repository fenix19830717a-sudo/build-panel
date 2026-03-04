"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 文件管理路由
 */
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
const statAsync = (0, util_1.promisify)(fs_1.default.stat);
const readdirAsync = (0, util_1.promisify)(fs_1.default.readdir);
const readFileAsync = (0, util_1.promisify)(fs_1.default.readFile);
const writeFileAsync = (0, util_1.promisify)(fs_1.default.writeFile);
const mkdirAsync = (0, util_1.promisify)(fs_1.default.mkdir);
const unlinkAsync = (0, util_1.promisify)(fs_1.default.unlink);
const rmdirAsync = (0, util_1.promisify)(fs_1.default.rmdir);
// 安全路径检查
function sanitizePath(inputPath) {
    // 防止路径遍历攻击
    const resolved = path_1.default.resolve(inputPath);
    const root = path_1.default.resolve('/');
    if (!resolved.startsWith(root)) {
        throw new Error('Invalid path: path traversal detected');
    }
    return resolved;
}
// 获取文件信息
async function getFileInfo(filePath) {
    const stats = await statAsync(filePath);
    const name = path_1.default.basename(filePath);
    let type = 'file';
    if (stats.isDirectory())
        type = 'directory';
    else if (stats.isSymbolicLink())
        type = 'symlink';
    // 获取权限字符串
    const mode = stats.mode;
    const perms = [
        (mode & 0o40000) ? 'd' : '-',
        (mode & 0o400) ? 'r' : '-',
        (mode & 0o200) ? 'w' : '-',
        (mode & 0o100) ? 'x' : '-',
        (mode & 0o040) ? 'r' : '-',
        (mode & 0o020) ? 'w' : '-',
        (mode & 0o010) ? 'x' : '-',
        (mode & 0o004) ? 'r' : '-',
        (mode & 0o002) ? 'w' : '-',
        (mode & 0o001) ? 'x' : '-'
    ].join('');
    return {
        name,
        path: filePath,
        type,
        size: stats.size,
        modifiedTime: stats.mtime,
        permissions: perms,
        owner: stats.uid.toString(),
        group: stats.gid.toString()
    };
}
// 列出目录内容
router.get('/list', async (req, res) => {
    try {
        const dirPath = req.query.path || '/';
        const safePath = sanitizePath(dirPath);
        const entries = await readdirAsync(safePath);
        const files = [];
        for (const entry of entries) {
            try {
                const fullPath = path_1.default.join(safePath, entry);
                const info = await getFileInfo(fullPath);
                files.push(info);
            }
            catch (e) {
                // 跳过无法访问的文件
            }
        }
        (0, response_1.successResponse)(res, files);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Failed to list directory');
    }
});
// 获取文件内容
router.get('/content', async (req, res) => {
    try {
        const filePath = req.query.path;
        if (!filePath) {
            return (0, response_1.badRequestResponse)(res, 'Path is required');
        }
        const safePath = sanitizePath(filePath);
        const stats = await statAsync(safePath);
        if (stats.isDirectory()) {
            return (0, response_1.badRequestResponse)(res, 'Cannot read directory as file');
        }
        // 限制文件大小为 10MB
        if (stats.size > 10 * 1024 * 1024) {
            return (0, response_1.badRequestResponse)(res, 'File too large (max 10MB)');
        }
        const content = await readFileAsync(safePath, 'utf-8');
        (0, response_1.successResponse)(res, { content, path: safePath });
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Failed to read file');
    }
});
// 保存文件内容
router.post('/content', async (req, res) => {
    try {
        const { path: filePath, content } = req.body;
        if (!filePath) {
            return (0, response_1.badRequestResponse)(res, 'Path is required');
        }
        const safePath = sanitizePath(filePath);
        await writeFileAsync(safePath, content, 'utf-8');
        (0, response_1.successResponse)(res, { path: safePath }, 'File saved successfully');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Failed to write file');
    }
});
// 创建目录
router.post('/mkdir', async (req, res) => {
    try {
        const { path: dirPath } = req.body;
        if (!dirPath) {
            return (0, response_1.badRequestResponse)(res, 'Path is required');
        }
        const safePath = sanitizePath(dirPath);
        await mkdirAsync(safePath, { recursive: true });
        (0, response_1.successResponse)(res, { path: safePath }, 'Directory created successfully');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Failed to create directory');
    }
});
// 删除文件/目录
router.delete('/delete', async (req, res) => {
    try {
        const targetPath = req.query.path;
        if (!targetPath) {
            return (0, response_1.badRequestResponse)(res, 'Path is required');
        }
        const safePath = sanitizePath(targetPath);
        const stats = await statAsync(safePath);
        if (stats.isDirectory()) {
            await rmdirAsync(safePath);
        }
        else {
            await unlinkAsync(safePath);
        }
        (0, response_1.successResponse)(res, null, 'Deleted successfully');
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Failed to delete');
    }
});
// 获取文件信息
router.get('/stat', async (req, res) => {
    try {
        const filePath = req.query.path;
        if (!filePath) {
            return (0, response_1.badRequestResponse)(res, 'Path is required');
        }
        const safePath = sanitizePath(filePath);
        const info = await getFileInfo(safePath);
        (0, response_1.successResponse)(res, info);
    }
    catch (error) {
        (0, response_1.errorResponse)(res, error.message || 'Failed to get file info');
    }
});
exports.default = router;
//# sourceMappingURL=files.js.map