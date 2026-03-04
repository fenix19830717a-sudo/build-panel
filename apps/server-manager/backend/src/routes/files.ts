/**
 * 文件管理路由
 */
import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { successResponse, errorResponse, badRequestResponse } from '../utils/response';
import { FileInfo } from '../types';

const router = Router();
const statAsync = promisify(fs.stat);
const readdirAsync = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const unlinkAsync = promisify(fs.unlink);
const rmdirAsync = promisify(fs.rmdir);

// 安全路径检查
function sanitizePath(inputPath: string): string {
  // 防止路径遍历攻击
  const resolved = path.resolve(inputPath);
  const root = path.resolve('/');
  if (!resolved.startsWith(root)) {
    throw new Error('Invalid path: path traversal detected');
  }
  return resolved;
}

// 获取文件信息
async function getFileInfo(filePath: string): Promise<FileInfo> {
  const stats = await statAsync(filePath);
  const name = path.basename(filePath);
  
  let type: 'file' | 'directory' | 'symlink' = 'file';
  if (stats.isDirectory()) type = 'directory';
  else if (stats.isSymbolicLink()) type = 'symlink';
  
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
router.get('/list', async (req: Request, res: Response) => {
  try {
    const dirPath = req.query.path as string || '/';
    const safePath = sanitizePath(dirPath);
    
    const entries = await readdirAsync(safePath);
    const files: FileInfo[] = [];
    
    for (const entry of entries) {
      try {
        const fullPath = path.join(safePath, entry);
        const info = await getFileInfo(fullPath);
        files.push(info);
      } catch (e) {
        // 跳过无法访问的文件
      }
    }
    
    successResponse(res, files);
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to list directory');
  }
});

// 获取文件内容
router.get('/content', async (req: Request, res: Response) => {
  try {
    const filePath = req.query.path as string;
    if (!filePath) {
      return badRequestResponse(res, 'Path is required');
    }
    
    const safePath = sanitizePath(filePath);
    const stats = await statAsync(safePath);
    
    if (stats.isDirectory()) {
      return badRequestResponse(res, 'Cannot read directory as file');
    }
    
    // 限制文件大小为 10MB
    if (stats.size > 10 * 1024 * 1024) {
      return badRequestResponse(res, 'File too large (max 10MB)');
    }
    
    const content = await readFileAsync(safePath, 'utf-8');
    successResponse(res, { content, path: safePath });
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to read file');
  }
});

// 保存文件内容
router.post('/content', async (req: Request, res: Response) => {
  try {
    const { path: filePath, content } = req.body;
    if (!filePath) {
      return badRequestResponse(res, 'Path is required');
    }
    
    const safePath = sanitizePath(filePath);
    await writeFileAsync(safePath, content, 'utf-8');
    successResponse(res, { path: safePath }, 'File saved successfully');
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to write file');
  }
});

// 创建目录
router.post('/mkdir', async (req: Request, res: Response) => {
  try {
    const { path: dirPath } = req.body;
    if (!dirPath) {
      return badRequestResponse(res, 'Path is required');
    }
    
    const safePath = sanitizePath(dirPath);
    await mkdirAsync(safePath, { recursive: true });
    successResponse(res, { path: safePath }, 'Directory created successfully');
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to create directory');
  }
});

// 删除文件/目录
router.delete('/delete', async (req: Request, res: Response) => {
  try {
    const targetPath = req.query.path as string;
    if (!targetPath) {
      return badRequestResponse(res, 'Path is required');
    }
    
    const safePath = sanitizePath(targetPath);
    const stats = await statAsync(safePath);
    
    if (stats.isDirectory()) {
      await rmdirAsync(safePath);
    } else {
      await unlinkAsync(safePath);
    }
    
    successResponse(res, null, 'Deleted successfully');
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to delete');
  }
});

// 获取文件信息
router.get('/stat', async (req: Request, res: Response) => {
  try {
    const filePath = req.query.path as string;
    if (!filePath) {
      return badRequestResponse(res, 'Path is required');
    }
    
    const safePath = sanitizePath(filePath);
    const info = await getFileInfo(safePath);
    successResponse(res, info);
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to get file info');
  }
});

export default router;
