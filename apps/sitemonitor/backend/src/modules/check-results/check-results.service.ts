import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { CheckResult, CheckStatus } from '../../entities/check-result.entity';

@Injectable()
export class CheckResultsService {
  constructor(
    @InjectRepository(CheckResult)
    private checkResultRepository: Repository<CheckResult>,
  ) {}

  async findByMonitor(
    monitorId: string,
    page = 1,
    limit = 50,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ data: CheckResult[]; total: number; page: number; limit: number }> {
    const where: any = { monitorId };
    
    if (startDate || endDate) {
      where.checkedAt = {};
      if (startDate) where.checkedAt = MoreThan(startDate);
      if (endDate) where.checkedAt = LessThan(endDate);
    }

    const [data, total] = await this.checkResultRepository.findAndCount({
      where,
      order: { checkedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async getLatestByMonitor(monitorId: string, limit = 1): Promise<CheckResult[]> {
    return this.checkResultRepository.find({
      where: { monitorId },
      order: { checkedAt: 'DESC' },
      take: limit,
    });
  }

  async getStatsByMonitor(monitorId: string, hours = 24): Promise<{
    total: number;
    up: number;
    down: number;
    avgResponseTime: number;
    uptime: number;
  }> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const results = await this.checkResultRepository.find({
      where: { 
        monitorId,
        checkedAt: MoreThan(since),
      },
    });

    const total = results.length;
    const up = results.filter(r => r.status === CheckStatus.UP).length;
    const down = total - up;
    
    const avgResponseTime = total > 0
      ? Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / total)
      : 0;
    
    const uptime = total > 0 ? parseFloat(((up / total) * 100).toFixed(2)) : 0;

    return { total, up, down, avgResponseTime, uptime };
  }

  async getResponseTimeTrend(
    monitorId: string,
    hours = 24,
    intervalMinutes = 60,
  ): Promise<{ timestamp: Date; avgResponseTime: number; count: number }[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const results = await this.checkResultRepository.find({
      where: {
        monitorId,
        checkedAt: MoreThan(since),
      },
      order: { checkedAt: 'ASC' },
    });

    // 按时间段聚合
    const grouped = new Map<string, { sum: number; count: number; timestamp: Date }>();
    
    for (const result of results) {
      const intervalKey = new Date(
        Math.floor(result.checkedAt.getTime() / (intervalMinutes * 60000)) * (intervalMinutes * 60000)
      );
      const key = intervalKey.toISOString();
      
      if (!grouped.has(key)) {
        grouped.set(key, { sum: 0, count: 0, timestamp: intervalKey });
      }
      
      const group = grouped.get(key);
      group.sum += result.responseTime;
      group.count++;
    }

    return Array.from(grouped.values())
      .map(g => ({
        timestamp: g.timestamp,
        avgResponseTime: Math.round(g.sum / g.count),
        count: g.count,
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async cleanupOldResults(days = 30): Promise<number> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const result = await this.checkResultRepository
      .createQueryBuilder()
      .delete()
      .where('checkedAt < :cutoff', { cutoff })
      .execute();

    return result.affected || 0;
  }
}
