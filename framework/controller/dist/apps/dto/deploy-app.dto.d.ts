export declare class DeployAppDto {
    serverId: string;
    config?: Record<string, any>;
    portMappings?: Array<{
        host: number;
        container: number;
    }>;
}
