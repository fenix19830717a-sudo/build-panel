interface SshConnectionOptions {
    host: string;
    port: number;
    username: string;
    privateKey?: string;
    password?: string;
}
export declare class SshService {
    testConnection(options: SshConnectionOptions): Promise<{
        success: boolean;
        message: string;
    }>;
    executeCommand(options: SshConnectionOptions, command: string): Promise<{
        success: boolean;
        output: string;
        error?: string;
    }>;
}
export {};
