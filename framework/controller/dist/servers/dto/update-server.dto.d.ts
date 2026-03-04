import { ServerStatus } from '../entities/server.entity';
export declare class UpdateServerDto {
    name?: string;
    host?: string;
    port?: number;
    username?: string;
    sshKey?: string;
    status?: ServerStatus;
    metadata?: Record<string, any>;
}
