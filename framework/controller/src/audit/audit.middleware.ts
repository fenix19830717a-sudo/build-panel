import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Skip health checks and static files
    if (req.path === '/health' || req.path.startsWith('/static')) {
      return next();
    }

    const startTime = Date.now();
    const user = (req as any).user;

    // Capture response finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      // Only log significant actions (POST, PUT, DELETE, or errors)
      const isSignificant = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
      const isError = res.statusCode >= 400;

      if (isSignificant || isError) {
        this.logAction(req, res, user, duration);
      }
    });

    next();
  }

  private async logAction(
    req: Request,
    res: Response,
    user: any,
    duration: number,
  ) {
    try {
      const { method, path, body, headers, ip } = req;
      
      // Extract target info from path
      const pathParts = path.split('/').filter(Boolean);
      const targetType = pathParts[1] || 'unknown';
      const targetId = pathParts[2];

      const auditLog = this.auditLogRepository.create({
        userId: user?.userId || user?.sub,
        action: `${method} ${path}`,
        targetType,
        targetId,
        details: {
          method,
          path,
          body: this.sanitizeBody(body),
          statusCode: res.statusCode,
          duration,
        },
        ipAddress: this.getClientIp(req),
        userAgent: headers['user-agent'],
      });

      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      console.error('Failed to save audit log:', error);
    }
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'sshKey', 'privateKey'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return (forwarded as string).split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
}
