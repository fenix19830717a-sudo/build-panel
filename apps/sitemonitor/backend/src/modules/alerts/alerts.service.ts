import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Alert, AlertStatus, AlertSeverity, AlertType } from '../../entities/alert.entity';
import { Monitor, MonitorStatus } from '../../entities/monitor.entity';
import { CheckResultData } from '../monitors/monitors.service';

export interface AlertData {
  monitor: Monitor;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  details?: string;
  checkResult?: CheckResultData;
}

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    @InjectQueue('alert-notifications')
    private alertQueue: Queue,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    status?: AlertStatus,
    severity?: AlertSeverity,
    monitorId?: string,
  ): Promise<{ data: Alert[]; total: number; page: number; limit: number }> {
    const where: any = {};
    
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (monitorId) where.monitorId = monitorId;

    const [data, total] = await this.alertRepository.findAndCount({
      where,
      relations: ['monitor'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Alert> {
    return this.alertRepository.findOne({
      where: { id },
      relations: ['monitor'],
    });
  }

  async createAlert(alertData: AlertData): Promise<Alert> {
    // 检查是否已存在相同类型的未解决告警
    const existingAlert = await this.alertRepository.findOne({
      where: {
        monitorId: alertData.monitor.id,
        type: alertData.type,
        status: AlertStatus.PENDING,
      },
    });

    if (existingAlert) {
      // 更新现有告警
      existingAlert.checkResult = alertData.checkResult;
      existingAlert.updatedAt = new Date();
      existingAlert.notificationCount += 1;
      return this.alertRepository.save(existingAlert);
    }

    // 创建新告警
    const alert = this.alertRepository.create({
      monitorId: alertData.monitor.id,
      type: alertData.type,
      severity: alertData.severity,
      status: AlertStatus.PENDING,
      message: alertData.message,
      details: alertData.details,
      checkResult: alertData.checkResult,
      notificationCount: 0,
    });

    const saved = await this.alertRepository.save(alert);

    // 发送到通知队列
    await this.sendAlertNotification(saved, alertData.monitor);

    return saved;
  }

  async acknowledgeAlert(id: string): Promise<Alert> {
    const alert = await this.findOne(id);
    
    if (!alert) {
      throw new Error(`Alert ${id} not found`);
    }

    alert.status = AlertStatus.ACKNOWLEDGED;
    alert.acknowledgedAt = new Date();
    
    return this.alertRepository.save(alert);
  }

  async resolveAlert(id: string): Promise<Alert> {
    const alert = await this.findOne(id);
    
    if (!alert) {
      throw new Error(`Alert ${id} not found`);
    }

    alert.status = AlertStatus.RESOLVED;
    alert.resolvedAt = new Date();
    
    return this.alertRepository.save(alert);
  }

  async resolveAlertsByMonitor(monitorId: string, type?: AlertType): Promise<void> {
    const where: any = { monitorId, status: AlertStatus.PENDING };
    if (type) where.type = type;

    await this.alertRepository.update(where, {
      status: AlertStatus.RESOLVED,
      resolvedAt: new Date(),
    });
  }

  async deleteAlert(id: string): Promise<void> {
    await this.alertRepository.delete(id);
  }

  async getStats(hours = 24): Promise<{
    total: number;
    pending: number;
    sent: number;
    acknowledged: number;
    resolved: number;
    failed: number;
    bySeverity: Record<AlertSeverity, number>;
    byType: Record<AlertType, number>;
  }> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const alerts = await this.alertRepository.find({
      where: { createdAt: MoreThan(since) },
    });

    const stats = {
      total: alerts.length,
      pending: 0,
      sent: 0,
      acknowledged: 0,
      resolved: 0,
      failed: 0,
      bySeverity: {} as Record<AlertSeverity, number>,
      byType: {} as Record<AlertType, number>,
    };

    for (const alert of alerts) {
      stats[alert.status]++;
      stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
    }

    return stats;
  }

  async sendAlertNotification(alert: Alert, monitor: Monitor): Promise<void> {
    if (!monitor.alertChannels || monitor.alertChannels.length === 0) {
      this.logger.warn(`No alert channels configured for monitor ${monitor.id}`);
      return;
    }

    for (const channel of monitor.alertChannels) {
      if (!channel.isActive) continue;

      await this.alertQueue.add('send', {
        alert,
        channel,
        monitor,
      }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      });
    }

    // 更新告警状态
    alert.status = AlertStatus.SENT;
    alert.sentAt = new Date();
    await this.alertRepository.save(alert);
  }

  // 处理监控状态变化
  async handleMonitorStatusChange(
    monitor: Monitor,
    previousStatus: MonitorStatus,
    checkResult: CheckResultData,
  ): Promise<void> {
    // 监控变为 DOWN
    if (previousStatus !== MonitorStatus.DOWN && monitor.status === MonitorStatus.DOWN) {
      await this.createAlert({
        monitor,
        type: AlertType.DOWN,
        severity: AlertSeverity.CRITICAL,
        message: `Monitor "${monitor.name}" is DOWN`,
        details: checkResult.errorMessage || 'Connection failed',
        checkResult,
      });
    }

    // 监控变为 UP
    if (previousStatus === MonitorStatus.DOWN && monitor.status === MonitorStatus.UP) {
      // 解决之前的 DOWN 告警
      await this.resolveAlertsByMonitor(monitor.id, AlertType.DOWN);

      // 创建恢复通知
      await this.createAlert({
        monitor,
        type: AlertType.UP,
        severity: AlertSeverity.INFO,
        message: `Monitor "${monitor.name}" is back UP`,
        details: `Response time: ${checkResult.responseTime}ms`,
        checkResult,
      });
    }

    // SSL 证书即将过期
    if (checkResult.sslDaysRemaining !== undefined && checkResult.sslDaysRemaining <= monitor.sslExpiryDays) {
      const existingSslAlert = await this.alertRepository.findOne({
        where: {
          monitorId: monitor.id,
          type: AlertType.SSL_EXPIRING,
          status: AlertStatus.PENDING,
        },
      });

      if (!existingSslAlert) {
        await this.createAlert({
          monitor,
          type: AlertType.SSL_EXPIRING,
          severity: checkResult.sslDaysRemaining <= 3 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
          message: `SSL certificate for "${monitor.name}" expires in ${checkResult.sslDaysRemaining} days`,
          details: `Issuer: ${checkResult.sslIssuer}, Expiry: ${checkResult.sslExpiryDate?.toISOString()}`,
          checkResult,
        });
      }
    }

    // 响应时间过长
    if (checkResult.responseTime > 5000) {
      await this.createAlert({
        monitor,
        type: AlertType.RESPONSE_TIME,
        severity: checkResult.responseTime > 10000 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
        message: `Slow response time for "${monitor.name}"`,
        details: `Response time: ${checkResult.responseTime}ms`,
        checkResult,
      });
    }
  }
}
