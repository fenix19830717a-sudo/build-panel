import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { MonitorsService } from './monitors.service';
import { Monitor, MonitorStatus } from '../../entities/monitor.entity';
import { CheckStatus } from '../../entities/check-result.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Processor('monitor-checks')
export class MonitorCheckProcessor {
  private readonly logger = new Logger(MonitorCheckProcessor.name);

  constructor(
    private monitorsService: MonitorsService,
    @InjectRepository(Monitor)
    private monitorRepository: Repository<Monitor>,
  ) {}

  @Process('check')
  async handleCheck(job: Job<{ monitorId: string }>) {
    const { monitorId } = job.data;
    
    this.logger.debug(`Processing check for monitor: ${monitorId}`);

    try {
      const monitor = await this.monitorRepository.findOne({
        where: { id: monitorId },
        relations: ['alertChannels'],
      });

      if (!monitor || !monitor.isActive) {
        this.logger.debug(`Monitor ${monitorId} not found or inactive`);
        return;
      }

      // 执行检查
      const checkResult = await this.monitorsService.executeCheck(monitor);
      
      // 保存检查结果
      await this.monitorsService.saveCheckResult(monitorId, checkResult);

      // 更新监控状态
      const newStatus = checkResult.status === CheckStatus.UP 
        ? MonitorStatus.UP 
        : MonitorStatus.DOWN;
      
      await this.monitorsService.updateMonitorStatus(monitorId, newStatus, checkResult);

      this.logger.debug(`Check completed for monitor ${monitorId}: ${checkResult.status}`);

      return {
        monitorId,
        status: checkResult.status,
        responseTime: checkResult.responseTime,
      };
    } catch (error) {
      this.logger.error(`Check failed for monitor ${monitorId}:`, error);
      throw error;
    }
  }
}
