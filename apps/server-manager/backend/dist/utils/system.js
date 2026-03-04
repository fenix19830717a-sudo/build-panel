"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemInfo = getSystemInfo;
exports.getCpuInfo = getCpuInfo;
exports.getMemoryInfo = getMemoryInfo;
exports.getDiskInfo = getDiskInfo;
exports.getNetworkInfo = getNetworkInfo;
exports.getProcesses = getProcesses;
exports.killProcess = killProcess;
/**
 * 系统信息工具
 */
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const child_process_1 = require("child_process");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function getSystemInfo() {
    const [cpu, memory, disk, network] = await Promise.all([
        getCpuInfo(),
        getMemoryInfo(),
        getDiskInfo(),
        getNetworkInfo()
    ]);
    return {
        hostname: os_1.default.hostname(),
        platform: os_1.default.platform(),
        release: os_1.default.release(),
        uptime: os_1.default.uptime(),
        loadAverage: os_1.default.loadavg(),
        cpu,
        memory,
        disk,
        network
    };
}
async function getCpuInfo() {
    const cpus = os_1.default.cpus();
    const usage = await getCpuUsage();
    return {
        model: cpus[0]?.model || 'Unknown',
        cores: cpus.length,
        speed: cpus[0]?.speed || 0,
        usage
    };
}
async function getCpuUsage() {
    return new Promise((resolve) => {
        const stats1 = os_1.default.cpus();
        setTimeout(() => {
            const stats2 = os_1.default.cpus();
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
async function getMemoryInfo() {
    const total = os_1.default.totalmem();
    const free = os_1.default.freemem();
    const used = total - free;
    // Try to get cached and buffers from /proc/meminfo on Linux
    let cached = 0;
    let buffers = 0;
    try {
        const meminfo = fs_1.default.readFileSync('/proc/meminfo', 'utf-8');
        const cachedMatch = meminfo.match(/Cached:\s+(\d+)/);
        const buffersMatch = meminfo.match(/Buffers:\s+(\d+)/);
        if (cachedMatch)
            cached = parseInt(cachedMatch[1]) * 1024;
        if (buffersMatch)
            buffers = parseInt(buffersMatch[1]) * 1024;
    }
    catch (e) {
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
async function getDiskInfo() {
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
        }).filter((d) => d !== null);
    }
    catch (error) {
        return [];
    }
}
async function getNetworkInfo() {
    const interfaces = [];
    const ifaces = os_1.default.networkInterfaces();
    for (const [name, addrs] of Object.entries(ifaces)) {
        if (!addrs || name === 'lo')
            continue;
        const ipv4 = addrs.find(a => a.family === 'IPv4');
        const ipv6 = addrs.find(a => a.family === 'IPv6');
        // Try to get RX/TX bytes
        let rxBytes = 0;
        let txBytes = 0;
        try {
            const rx = fs_1.default.readFileSync(`/sys/class/net/${name}/statistics/rx_bytes`, 'utf-8');
            const tx = fs_1.default.readFileSync(`/sys/class/net/${name}/statistics/tx_bytes`, 'utf-8');
            rxBytes = parseInt(rx.trim()) || 0;
            txBytes = parseInt(tx.trim()) || 0;
        }
        catch (e) {
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
async function getProcesses() {
    try {
        const { stdout } = await execAsync(`ps aux --no-headers | awk '{printf "%s|%s|%s|%s|%s|%s|%s\\n", $1, $2, $3, $4, $9, $10, $11}'`);
        const lines = stdout.trim().split('\n');
        const processes = [];
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
    }
    catch (error) {
        return [];
    }
}
async function killProcess(pid, signal = 'SIGTERM') {
    try {
        process.kill(pid, signal);
        return true;
    }
    catch (error) {
        return false;
    }
}
//# sourceMappingURL=system.js.map