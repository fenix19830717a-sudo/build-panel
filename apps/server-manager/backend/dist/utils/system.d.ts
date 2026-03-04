import { SystemInfo, CpuInfo, MemoryInfo, DiskInfo, NetworkInfo, ProcessInfo } from '../types';
export declare function getSystemInfo(): Promise<SystemInfo>;
export declare function getCpuInfo(): Promise<CpuInfo>;
export declare function getMemoryInfo(): Promise<MemoryInfo>;
export declare function getDiskInfo(): Promise<DiskInfo[]>;
export declare function getNetworkInfo(): Promise<NetworkInfo[]>;
export declare function getProcesses(): Promise<ProcessInfo[]>;
export declare function killProcess(pid: number, signal?: string): Promise<boolean>;
//# sourceMappingURL=system.d.ts.map