import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Monitor, MonitorStatus } from '../../entities/monitor.entity';
import { CheckResult, CheckStatus } from '../../entities/check-result.entity';
import { Alert, AlertStatus, AlertSeverity } from '../../entities/alert.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Monitor)
    private monitorRepository: Repository<Monitor>,
    @InjectRepository(CheckResult)
    private checkResultRepository: Repository<CheckResult>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
  ) {}

  async getOverview(): Promise<{
    totalMonitors: number;
    upMonitors: number;
    downMonitors: number;
    pausedMonitors: number;
    pendingMonitors: number;
    avgUptime: number;
    avgResponseTime: number;
    activeAlerts: number;
    recentAlerts: number;
  }> {
    const monitors = await this.monitorRepository.find();
    
    const totalMonitors = monitors.length;
    const upMonitors = monitors.filter(m => m.status === MonitorStatus.UP).length;
    const downMonitors = monitors.filter(m => m.status === MonitorStatus.DOWN).length;
    const pausedMonitors = monitors.filter(m => m.status === MonitorStatus.PAUSED).length;
    const pendingMonitors = monitors.filter(m => m.status === MonitorStatus.PENDING).length;

    // 计算平均可用率
    const activeMonitors = monitors.filter(m => m.status !== MonitorStatus.PENDING);
    const avgUptime = activeMonitors.length > 0
      ? parseFloat((activeMonitors.reduce((sum, m) => sum + (m.uptime24h || 0), 0) / activeMonitors.length).toFixed(2))
      : 0;

    // 计算平均响应时间
    const recentChecks = await this.checkResultRepository.find({
      where: { checkedAt: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)) },
    });
    const avgResponseTime = recentChecks.length > 0
      ? Math.round(recentChecks.reduce((sum, c) => sum + c.responseTime, 0) / recentChecks.length)
      : 0;

    // 活跃告警
    const activeAlerts = await this.alertRepository.count({
      where: { status: AlertStatus.PENDING },
    });

    // 最近24小时告警
    const recentAlerts = await this.alertRepository.count({
      where: { createdAt: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)) },
    });

    return {
      totalMonitors,
      upMonitors,
      downMonitors,
      pausedMonitors,
      pendingMonitors,
      avgUptime,
      avgResponseTime,
      activeAlerts,
      recentAlerts,
    };
  }

  async getStatusDistribution(): Promise<{ status: string; count: number; percentage: number }[]> {
    const monitors = await this.monitorRepository.find();
    const total = monitors.length;

    if (total === 0) return [];

    const distribution = {
      [MonitorStatus.UP]: 0,
      [MonitorStatus.DOWN]: 0,
      [MonitorStatus.PAUSED]: 0,
      [MonitorStatus.PENDING]: 0,
    };

    for (const monitor of monitors) {
      distribution[monitor.status]++;
    }

    return Object.entries(distribution).map(([status, count]) => ({
      status,
      count,
      percentage: parseFloat(((count / total) * 100).toFixed(2)),
    }));
  }

  async getResponseTimeStats(hours = 24): Promise<{
    avg: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  }> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const results = await this.checkResultRepository.find({
      where: { checkedAt: MoreThan(since) },
      select: ['responseTime'],
    });

    if (results.length === 0) {
      return { avg: 0, min: 0, max: 0, p95: 0, p99: 0 };
    }

    const times = results.map(r => r.responseTime).sort((a, b) => a - b);
    const sum = times.reduce((a, b) => a + b, 0);
    
    return {
      avg: Math.round(sum / times.length),
      min: times[0],
      max: times[times.length - 1],
      p95: times[Math.floor(times.length * 0.95)],
      p99: times[Math.floor(times.length * 0.99)],
    };
  }

  async getUptimeTrend(days = 7): Promise<{ date: string; uptime: number }[]> {
    const result: { date: string; uptime: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const checks = await this.checkResultRepository.find({
        where: {
          checkedAt: MoreThan(date),
        },
      });

      // 过滤当天数据
      const dayChecks = checks.filter(c => c.checkedAt < nextDate);
      
      const upCount = dayChecks.filter(c => c.status === CheckStatus.UP).length;
      const uptime = dayChecks.length > 0 
        ? parseFloat(((upCount / dayChecks.length) * 100).toFixed(2))
        : 100;

      result.push({
        date: date.toISOString().split('T')[0],
        uptime,
      });
    }

    return result;
  }

  async getRecentAlerts(limit = 10): Promise<Alert[]> {
    return this.alertRepository.find({
      relations: ['monitor'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getRecentChecks(limit = 50): Promise<CheckResult[]> {
    return this.checkResultRepository.find({
      relations: ['monitor'],
      order: { checkedAt: 'DESC' },
      take: limit,
    });
  }
}
