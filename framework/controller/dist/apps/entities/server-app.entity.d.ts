import { Server } from '../../servers/entities/server.entity';
import { App } from './app.entity';
export declare enum ServerAppStatus {
    RUNNING = "running",
    STOPPED = "stopped",
    ERROR = "error",
    PENDING = "pending"
}
export declare class ServerApp {
    id: string;
    serverId: string;
    server: Server;
    appId: string;
    app: App;
    containerId: string;
    config: Record<string, any>;
    status: ServerAppStatus;
    portMappings: Array<{
        host: number;
        container: number;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
