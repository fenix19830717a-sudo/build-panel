import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Monitor, MonitorStatus } from '../../entities/monitor.entity';
import { CheckResult } from '../../entities/check-result.entity';
import { AlertsService } from '../alerts/alerts.service';
import { MonitorsService } from '../monitors/monitors.service';
import { CheckResultsService } from '../check-results/check-results.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(Monitor)
    private monitorRepository: Repository<Monitor>,
    @InjectRepository(CheckResult)
    private checkResultRepository: Repository<CheckResult>,
    @InjectQueue('monitor-checks')
    private monitorCheckQueue: Queue,
    private alertsService: AlertsService,
    private monitorsService: MonitorsService,
    private checkResultsService: CheckResultsService,
  ) {}

  // 每分钟执行一次，调度需要检查的监控
  @Interval(60000)
  async scheduleChecks() {
    this.logger.debug('Running scheduled checks...');

    const monitors = await this.monitorRepository.find({
      where: { isActive: true },
      relations: ['alertChannels'],
    });

    for (const monitor of monitors) {
      try {
        // 检查是否需要执行检查
        const shouldCheck = this.shouldCheckMonitor(monitor);
        
        if (shouldCheck) {
          await this.monitorCheckQueue.add('check', {
            monitorId: monitor.id,
          }, {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 5000,
            },
            removeOnComplete: 10,
            removeOnFail: 10,
          });
          
          this.logger.debug(`Scheduled check for monitor: ${monitor.name}`);
        }
      } catch (error) {
        this.logger.error(`Failed to schedule check for monitor ${monitor.name}:`, error);
      }
    }
  }

  // 每小时清理旧数据
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupOldData() {
    this.logger.debug('Running cleanup task...');

    try {
      // 清理30天前的检查结果
      const deletedResults = await this.checkResultsService.cleanupOldResults(30);
      this.logger.debug(`Cleaned up ${deletedResults} old check results`);
    } catch (error) {
      this.logger.error('Failed to cleanup old data:', error);
    }
  }

  // 每天更新一次统计
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateStatistics() {
    this.logger.debug('Updating statistics...');

    try {
      const monitors = await this.monitorRepository.find({
        where: { isActive: true },
      });

      for (const monitor of monitors) {
        // 更新可用率统计
        await this.monitorsService.update(monitor.id, {});
      }

      this.logger.debug('Statistics updated');
    } catch (error) {
      this.logger.error('Failed to update statistics:', error);
    }
  }

  // 每5分钟检查一次长时间未解决的告警
  @Interval(300000)
  async escalateAlerts() {
    this.logger.debug('Checking for alerts to escalate...');

    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      
      // 查找超过2小时未解决的告警
      const alerts = await this.alertsService.findAll(1, 100);
      const alertsToEscalate = alerts.data.filter(
        alert => 
          alert.status === 'pending' && 
          alert.createdAt < twoHoursAgo &&
          alert.severity !== 'critical'
      );

      for (const alert of alertsToEscalate) {
        this.logger.warn(`Alert ${alert.id} needs escalation`);
        // 这里可以实现升级逻辑，如发送更高级别的通知
      }
    } catch (error) {
      this.logger.error('Failed to escalate alerts:', error);
    }
  }

  private shouldCheckMonitor(monitor: Monitor): boolean {
    // 如果从未检查过，立即检查
    if (!monitor.lastCheckedAt) {
      return true;
    }

    // 检查是否已达到间隔时间
    const nextCheck = new Date(monitor.lastCheckedAt.getTime() + monitor.interval * 1000);
    return new Date() >= nextCheck;
  }
}
