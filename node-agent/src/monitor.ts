import si from 'systeminformation';
import { NodeStatus, AppStatus } from './types';

export class SystemMonitor {
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
  }

  async getSystemMetrics(): Promise<{
    cpu: number;
    memory: number;
    disk: number;
    network: { in: number; out: number };
  }> {
    try {
      const [cpu, mem, disk, network] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.networkStats()
      ]);

      const networkIn = network.reduce((acc, n) => acc + (n.rx_sec || 0), 0);
      const networkOut = network.reduce((acc, n) => acc + (n.tx_sec || 0), 0);

      return {
        cpu: Math.round(cpu.currentLoad || 0),
        memory: Math.round((mem.used / mem.total) * 100),
        disk: disk.length > 0 ? Math.round(disk[0].use || 0) : 0,
        network: {
          in: Math.round(networkIn / 1024),
          out: Math.round(networkOut / 1024)
        }
      };
    } catch (error) {
      return {
        cpu: 0,
        memory: 0,
        disk: 0,
        network: { in: 0, out: 0 }
      };
    }
  }

  async getNodeStatus(nodeId: string, nodeName: string, apps: AppStatus[]): Promise<NodeStatus> {
    const metrics = await this.getSystemMetrics();
    const uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);

    return {
      id: nodeId,
      name: nodeName,
      status: 'online',
      cpu: metrics.cpu,
      memory: metrics.memory,
      disk: metrics.disk,
      network: metrics.network,
      uptime,
      activeApps: apps.filter(a => a.status === 'running').length,
      lastHeartbeat: new Date().toISOString()
    };
  }

  getUptime(): number {
    return Math.floor((Date.now() - this.startTime.getTime()) / 1000);
  }
}
