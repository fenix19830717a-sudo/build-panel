"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditMiddleware = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("./entities/audit-log.entity");
let AuditMiddleware = class AuditMiddleware {
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    use(req, res, next) {
        if (req.path === '/health' || req.path.startsWith('/static')) {
            return next();
        }
        const startTime = Date.now();
        const user = req.user;
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const isSignificant = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
            const isError = res.statusCode >= 400;
            if (isSignificant || isError) {
                this.logAction(req, res, user, duration);
            }
        });
        next();
    }
    async logAction(req, res, user, duration) {
        try {
            const { method, path, body, headers, ip } = req;
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
        }
        catch (error) {
            console.error('Failed to save audit log:', error);
        }
    }
    sanitizeBody(body) {
        if (!body)
            return body;
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'sshKey', 'privateKey'];
        const sanitized = { ...body };
        for (const field of sensitiveFields) {
            if (sanitized[field]) {
                sanitized[field] = '***REDACTED***';
            }
        }
        return sanitized;
    }
    getClientIp(req) {
        const forwarded = req.headers['x-forwarded-for'];
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        return req.ip || req.socket.remoteAddress || 'unknown';
    }
};
exports.AuditMiddleware = AuditMiddleware;
exports.AuditMiddleware = AuditMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditMiddleware);
//# sourceMappingURL=audit.middleware.js.map