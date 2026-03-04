export declare class AuditLog {
    id: string;
    userId: string;
    action: string;
    targetType: string;
    targetId: string;
    details: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
}
