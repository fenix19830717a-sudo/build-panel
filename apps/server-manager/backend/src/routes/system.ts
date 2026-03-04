/**
 * 系统信息路由
 */
import { Router, Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/response';
import { 
  getSystemInfo, 
  getCpuInfo, 
  getMemoryInfo, 
  getDiskInfo, 
  getNetworkInfo 
} from '../utils/system';

const router = Router();

// 获取完整系统信息
router.get('/info', async (req: Request, res: Response) => {
  try {
    const info = await getSystemInfo();
    successResponse(res, info);
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to get system info');
  }
});

// 获取 CPU 信息
router.get('/cpu', async (req: Request, res: Response) => {
  try {
    const cpu = await getCpuInfo();
    successResponse(res, cpu);
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to get CPU info');
  }
});

// 获取内存信息
router.get('/memory', async (req: Request, res: Response) => {
  try {
    const memory = await getMemoryInfo();
    successResponse(res, memory);
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to get memory info');
  }
});

// 获取磁盘信息
router.get('/disk', async (req: Request, res: Response) => {
  try {
    const disk = await getDiskInfo();
    successResponse(res, disk);
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to get disk info');
  }
});

// 获取网络信息
router.get('/network', async (req: Request, res: Response) => {
  try {
    const network = await getNetworkInfo();
    successResponse(res, network);
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to get network info');
  }
});

export default router;
