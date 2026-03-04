import { User } from '../../users/entities/user.entity';
export declare enum ApiKeyStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    EXPIRED = "expired"
}
export declare class ApiKey {
    id: string;
    userId: string;
    user: User;
    name: string;
    keyHash: string;
    provider: string;
    quota: number;
    used: number;
    expiresAt: Date;
    status: ApiKeyStatus;
    createdAt: Date;
    updatedAt: Date;
}
