/**
 * 系统信息工具
 */
import os from 'os';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import { SystemInfo, CpuInfo, MemoryInfo, DiskInfo, NetworkInfo, ProcessInfo } from '../types';

const execAsync = promisify(exec);

export async function getSystemInfo(): Promise<SystemInfo> {
  const [cpu, memory, disk, network] = await Promise.all([
    getCpuInfo(),
    getMemoryInfo(),
    getDiskInfo(),
    getNetworkInfo()
  ]);

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    release: os.release(),
    uptime: os.uptime(),
    loadAverage: os.loadavg(),
    cpu,
    memory,
    disk,
    network
  };
}

export async function getCpuInfo(): Promise<CpuInfo> {
  const cpus = os.cpus();
  const usage = await getCpuUsage();
  
  return {
    model: cpus[0]?.model || 'Unknown',
    cores: cpus.length,
    speed: cpus[0]?.speed || 0,
    usage
  };
}

async function getCpuUsage(): Promise<number> {
  return new Promise((resolve) => {
    const stats1 = os.cpus();
    setTimeout(() => {
      const stats2 = os.cpus();
      let idleDiff = 0;
      let totalDiff = 0;
      
      for (let i = 0; i < stats1.length; i++) {
        const cpu1 = stats1[i].times;
        const cpu2 = stats2[i].times;
        
        const idle = cpu2.idle - cpu1.idle;
        const user = cpu2.user - cpu1.user;
        const nice = cpu2.nice - cpu1.nice;
        const sys = cpu2.sys - cpu1.sys;
        const irq = cpu2.irq - cpu1.irq;
        
        idleDiff += idle;
        totalDiff += idle + user + nice + sys + irq;
      }
      
      const usage = totalDiff > 0 ? 100 - (idleDiff / totalDiff) * 100 : 0;
      resolve(Math.round(usage * 100) / 100);
    }, 1000);
  });
}

export async function getMemoryInfo(): Promise<MemoryInfo> {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  
  // Try to get cached and buffers from /proc/meminfo on Linux
  let cached = 0;
  let buffers = 0;
  
  try {
    const meminfo = fs.readFileSync('/proc/meminfo', 'utf-8');
    const cachedMatch = meminfo.match(/Cached:\s+(\d+)/);
    const buffersMatch = meminfo.match(/Buffers:\s+(\d+)/);
    if (cachedMatch) cached = parseInt(cachedMatch[1]) * 1024;
    if (buffersMatch) buffers = parseInt(buffersMatch[1]) * 1024;
  } catch (e) {
    // Not Linux or unable to read
  }
  
  return {
    total,
    used,
    free,
    cached,
    buffers,
    usagePercent: Math.round((used / total) * 100 * 100) / 100
  };
}

export async function getDiskInfo(): Promise<DiskInfo[]> {
  try {
    const { stdout } = await execAsync('df -B1');
    const lines = stdout.trim().split('\n').slice(1);
    
    return lines.map(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 6) {
        return {
          filesystem: parts[0],
          size: parseInt(parts[1]) || 0,
          used: parseInt(parts[2]) || 0,
          available: parseInt(parts[3]) || 0,
          usagePercent: parseInt(parts[4].replace('%', '')) || 0,
          mountPoint: parts[5]
        };
      }
      return null;
    }).filter((d): d is DiskInfo => d !== null);
  } catch (error) {
    return [];
  }
}

export async function getNetworkInfo(): Promise<NetworkInfo[]> {
  const interfaces: NetworkInfo[] = [];
  const ifaces = os.networkInterfaces();
  
  for (const [name, addrs] of Object.entries(ifaces)) {
    if (!addrs || name === 'lo') continue;
    
    const ipv4 = addrs.find(a => a.family === 'IPv4');
    const ipv6 = addrs.find(a => a.family === 'IPv6');
    
    // Try to get RX/TX bytes
    let rxBytes = 0;
    let txBytes = 0;
    try {
      const rx = fs.readFileSync(`/sys/class/net/${name}/statistics/rx_bytes`, 'utf-8');
      const tx = fs.readFileSync(`/sys/class/net/${name}/statistics/tx_bytes`, 'utf-8');
      rxBytes = parseInt(rx.trim()) || 0;
      txBytes = parseInt(tx.trim()) || 0;
    } catch (e) {
      // Interface stats not available
    }
    
    interfaces.push({
      interface: name,
      ip4: ipv4?.address || '',
      ip6: ipv6?.address || '',
      mac: ipv4?.mac || ipv6?.mac || '',
      rxBytes,
      txBytes
    });
  }
  
  return interfaces;
}

export async function getProcesses(): Promise<ProcessInfo[]> {
  try {
    const { stdout } = await execAsync(
      `ps aux --no-headers | awk '{printf "%s|%s|%s|%s|%s|%s|%s\\n", $1, $2, $3, $4, $9, $10, $11}'`
    );
    
    const lines = stdout.trim().split('\n');
    const processes: ProcessInfo[] = [];
    
    for (const line of lines) {
      const parts = line.split('|');
      if (parts.length >= 7) {
        processes.push({
          pid: parseInt(parts[1]) || 0,
          user: parts[0],
          cpu: parseFloat(parts[2]) || 0,
          memoryPercent: parseFloat(parts[3]) || 0,
          startTime: new Date(),
          status: 'running',
          name: parts[6].split('/').pop() || parts[6],
          command: parts.slice(6).join(' '),
          memory: 0 // Would need additional calculation
        });
      }
    }
    
    return processes.sort((a, b) => b.cpu - a.cpu).slice(0, 100);
  } catch (error) {
    return [];
  }
}

export async function killProcess(pid: number, signal: string = 'SIGTERM'): Promise<boolean> {
  try {
    process.kill(pid, signal as any);
    return true;
  } catch (error) {
    return false;
  }
}
