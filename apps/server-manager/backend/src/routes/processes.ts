/**
 * 进程管理路由
 */
import { Router, Request, Response } from 'express';
import { successResponse, errorResponse, badRequestResponse } from '../utils/response';
import { getProcesses, killProcess } from '../utils/system';

const router = Router();

// 获取进程列表
router.get('/list', async (req: Request, res: Response) => {
  try {
    const processes = await getProcesses();
    successResponse(res, processes);
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to get process list');
  }
});

// 结束进程
router.post('/kill', async (req: Request, res: Response) => {
  try {
    const { pid, signal = 'SIGTERM' } = req.body;
    
    if (!pid || typeof pid !== 'number') {
      return badRequestResponse(res, 'Valid PID is required');
    }
    
    const success = await killProcess(pid, signal);
    
    if (success) {
      successResponse(res, { pid }, `Process ${pid} terminated`);
    } else {
      errorResponse(res, `Failed to terminate process ${pid}`);
    }
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to kill process');
  }
});

// 获取特定进程信息
router.get('/:pid', async (req: Request, res: Response) => {
  try {
    const pid = parseInt(req.params.pid);
    if (isNaN(pid)) {
      return badRequestResponse(res, 'Invalid PID');
    }
    
    const processes = await getProcesses();
    const process = processes.find(p => p.pid === pid);
    
    if (!process) {
      return errorResponse(res, 'Process not found', 404);
    }
    
    successResponse(res, process);
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to get process info');
  }
});

export default router;
