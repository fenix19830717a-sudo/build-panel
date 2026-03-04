/**
 * API 响应类型定义
 */
export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
}
export interface FileInfo {
    name: string;
    path: string;
    type: 'file' | 'directory' | 'symlink';
    size: number;
    modifiedTime: Date;
    permissions: string;
    owner: string;
    group: string;
}
export interface ProcessInfo {
    pid: number;
    name: string;
    command: string;
    user: string;
    cpu: number;
    memory: number;
    memoryPercent: number;
    status: string;
    startTime: Date;
}
export interface ServiceInfo {
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'failed' | 'unknown';
    enabled: boolean;
    loaded: boolean;
    pid?: number;
    uptime?: string;
}
export interface SystemInfo {
    hostname: string;
    platform: string;
    release: string;
    uptime: number;
    loadAverage: number[];
    cpu: CpuInfo;
    memory: MemoryInfo;
    disk: DiskInfo[];
    network: NetworkInfo[];
}
export interface CpuInfo {
    model: string;
    cores: number;
    speed: number;
    usage: number;
}
export interface MemoryInfo {
    total: number;
    used: number;
    free: number;
    cached: number;
    buffers: number;
    usagePercent: number;
}
export interface DiskInfo {
    filesystem: string;
    size: number;
    used: number;
    available: number;
    usagePercent: number;
    mountPoint: string;
}
export interface NetworkInfo {
    interface: string;
    ip4: string;
    ip6: string;
    mac: string;
    rxBytes: number;
    txBytes: number;
}
export interface TerminalSession {
    id: string;
    pty: any;
    socket: any;
    createdAt: Date;
    cwd: string;
}
//# sourceMappingURL=index.d.ts.map