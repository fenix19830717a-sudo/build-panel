import { HttpService } from '@nestjs/axios';
interface AgentConfig {
    baseURL: string;
    certPath?: string;
    keyPath?: string;
    caPath?: string;
}
export declare class AgentClient {
    private httpService;
    private readonly logger;
    private httpsAgent?;
    constructor(httpService: HttpService);
    executeCommand(serverId: string, command: string, config: AgentConfig): Promise<any>;
    deployContainer(serverId: string, image: string, config: AgentConfig, options?: {
        name?: string;
        ports?: Record<string, string>;
        env?: Record<string, string>;
        volumes?: string[];
    }): Promise<any>;
    getContainerStatus(serverId: string, containerId: string, config: AgentConfig): Promise<any>;
    getSystemInfo(serverId: string, config: AgentConfig): Promise<any>;
    streamLogs(serverId: string, containerId: string, config: AgentConfig, onLog: (log: string) => void): Promise<unknown>;
    private createHttpsAgent;
}
export {};
