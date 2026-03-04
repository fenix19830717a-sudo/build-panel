/**
 * 系统服务管理路由
 */
import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { successResponse, errorResponse, badRequestResponse } from '../utils/response';
import { ServiceInfo } from '../types';

const router = Router();
const execAsync = promisify(exec);

// 解析 systemctl 状态输出
function parseServiceStatus(output: string): Partial<ServiceInfo> {
  const result: Partial<ServiceInfo> = {};
  
  // 检查服务是否已加载
  result.loaded = output.includes('Loaded: loaded');
  
  // 解析状态
  if (output.includes('Active: active')) {
    result.status = 'active';
  } else if (output.includes('Active: inactive')) {
    result.status = 'inactive';
  } else if (output.includes('Active: failed')) {
    result.status = 'failed';
  } else {
    result.status = 'unknown';
  }
  
  // 检查是否启用开机自启
  result.enabled = output.includes('enabled;');
  
  // 解析 PID
  const pidMatch = output.match(/Main PID: (\d+)/);
  if (pidMatch) {
    result.pid = parseInt(pidMatch[1]);
  }
  
  return result;
}

// 获取所有服务列表
router.get('/list', async (req: Request, res: Response) => {
  try {
    // 获取所有已加载的服务单元
    const { stdout } = await execAsync('systemctl list-units --type=service --no-pager --no-legend');
    const lines = stdout.trim().split('\n');
    
    const services: ServiceInfo[] = [];
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 4) {
        const name = parts[0].replace('.service', '');
        const status = parts[3] as any;
        
        services.push({
          name,
          description: parts.slice(4).join(' '),
          status: ['active', 'inactive', 'failed'].includes(status) ? status : 'unknown',
          loaded: parts[1] === 'loaded',
          enabled: parts[2] !== 'static' && parts[2] !== 'indirect'
        });
      }
    }
    
    successResponse(res, services);
  } catch (error: any) {
    // systemctl 可能不可用
    errorResponse(res, 'systemd is not available or access denied');
  }
});

// 获取特定服务状态
router.get('/:serviceName/status', async (req: Request, res: Response) => {
  try {
    const serviceName = req.params.serviceName;
    const { stdout } = await execAsync(`systemctl status ${serviceName}.service --no-pager`);
    const status = parseServiceStatus(stdout);
    
    successResponse(res, {
      name: serviceName,
      ...status
    });
  } catch (error: any) {
    // systemctl status 返回非零退出码但仍有输出
    if (error.stdout) {
      const status = parseServiceStatus(error.stdout);
      successResponse(res, { name: req.params.serviceName, ...status });
    } else {
      errorResponse(res, error.message || 'Failed to get service status');
    }
  }
});

// 启动服务
router.post('/:serviceName/start', async (req: Request, res: Response) => {
  try {
    const serviceName = req.params.serviceName;
    await execAsync(`sudo systemctl start ${serviceName}.service`);
    successResponse(res, { name: serviceName }, `Service ${serviceName} started`);
  } catch (error: any) {
    errorResponse(res, error.message || `Failed to start service ${req.params.serviceName}`);
  }
});

// 停止服务
router.post('/:serviceName/stop', async (req: Request, res: Response) => {
  try {
    const serviceName = req.params.serviceName;
    await execAsync(`sudo systemctl stop ${serviceName}.service`);
    successResponse(res, { name: serviceName }, `Service ${serviceName} stopped`);
  } catch (error: any) {
    errorResponse(res, error.message || `Failed to stop service ${req.params.serviceName}`);
  }
});

// 重启服务
router.post('/:serviceName/restart', async (req: Request, res: Response) => {
  try {
    const serviceName = req.params.serviceName;
    await execAsync(`sudo systemctl restart ${serviceName}.service`);
    successResponse(res, { name: serviceName }, `Service ${serviceName} restarted`);
  } catch (error: any) {
    errorResponse(res, error.message || `Failed to restart service ${req.params.serviceName}`);
  }
});

// 启用开机自启
router.post('/:serviceName/enable', async (req: Request, res: Response) => {
  try {
    const serviceName = req.params.serviceName;
    await execAsync(`sudo systemctl enable ${serviceName}.service`);
    successResponse(res, { name: serviceName }, `Service ${serviceName} enabled`);
  } catch (error: any) {
    errorResponse(res, error.message || `Failed to enable service ${req.params.serviceName}`);
  }
});

// 禁用开机自启
router.post('/:serviceName/disable', async (req: Request, res: Response) => {
  try {
    const serviceName = req.params.serviceName;
    await execAsync(`sudo systemctl disable ${serviceName}.service`);
    successResponse(res, { name: serviceName }, `Service ${serviceName} disabled`);
  } catch (error: any) {
    errorResponse(res, error.message || `Failed to disable service ${req.params.serviceName}`);
  }
});

// 查看服务日志
router.get('/:serviceName/logs', async (req: Request, res: Response) => {
  try {
    const serviceName = req.params.serviceName;
    const lines = parseInt(req.query.lines as string) || 50;
    
    const { stdout } = await execAsync(`journalctl -u ${serviceName}.service --no-pager -n ${lines}`);
    successResponse(res, { name: serviceName, logs: stdout.split('\n') });
  } catch (error: any) {
    errorResponse(res, error.message || `Failed to get logs for service ${req.params.serviceName}`);
  }
});

export default router;
