import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
export declare class AuditMiddleware implements NestMiddleware {
    private auditLogRepository;
    constructor(auditLogRepository: Repository<AuditLog>);
    use(req: Request, res: Response, next: NextFunction): void;
    private logAction;
    private sanitizeBody;
    private getClientIp;
}
