import { ApiKeyStatus } from '../entities/api-key.entity';
export declare class UpdateApiKeyDto {
    name?: string;
    quota?: number;
    status?: ApiKeyStatus;
    expiresAt?: string;
}
