import { User } from '../../users/entities/user.entity';
export declare enum ServerStatus {
    ONLINE = "online",
    OFFLINE = "offline",
    ERROR = "error"
}
export declare class Server {
    id: string;
    userId: string;
    user: User;
    name: string;
    host: string;
    port: number;
    username: string;
    sshKey: string;
    os: string;
    arch: string;
    agentToken: string;
    status: ServerStatus;
    lastHeartbeat: Date;
    cpuCores: number;
    memoryGb: number;
    diskGb: number;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
