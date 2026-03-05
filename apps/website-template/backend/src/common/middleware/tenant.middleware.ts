import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // 从请求头或子域名获取租户ID
    const tenantId = req.headers['x-tenant-id'] as string || 
                     req.query.tenantId as string ||
                     this.extractTenantFromHost(req);
    
    if (tenantId) {
      req['tenantId'] = tenantId;
    }
    
    next();
  }

  private extractTenantFromHost(req: Request): string | null {
    const host = req.headers.host || '';
    const parts = host.split('.');
    // 假设子域名格式: tenant.example.com
    if (parts.length > 2) {
      return parts[0];
    }
    return null;
  }
}
