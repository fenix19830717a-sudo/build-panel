import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { BackupJob } from '../common/entities/backup-job.entity';
import { Backup, BackupStatus } from '../common/entities/backup.entity';

// Simple cron parser helper
class CronHelper {
  static getNextRun(cronExpression: string): Date | null {
    try {
      // Simple parser for common patterns
      const parts = cronExpression.split(' ');
      if (parts.length !== 5) return null;
      
      const now = new Date();
      const next = new Date(now);
      next.setSeconds(0);
      next.setMilliseconds(0);
      
      // Very basic implementation - just add appropriate time
      // In production, use a proper cron-parser library
      return new Date(now.getTime() + 60000); // Default to 1 minute from now
    } catch {
      return null;
    }
  }
}

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(BackupJob)
    private backupJobRepository: Repository<BackupJob>,
    @InjectRepository(Backup)
    private backupRepository: Repository<Backup>,
  ) {}

  // Update next run time for all active jobs every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async updateJobSchedules() {
    const activeJobs = await this.backupJobRepository.find({
      where: { status: 'active' },
    });

    for (const job of activeJobs) {
      try {
        const nextRun = CronHelper.getNextRun(job.cronExpression);
        
        if (nextRun && (!job.nextRunAt || job.nextRunAt.getTime() !== nextRun.getTime())) {
          job.nextRunAt = nextRun;
          await this.backupJobRepository.save(job);
        }
      } catch (error) {
        this.logger.error(`Failed to parse cron for job ${job.id}: ${error.message}`);
      }
    }
  }

  // Clean up old backups daily at 2 AM
  @Cron('0 2 * * *')
  async cleanupOldBackups() {
    this.logger.log('Starting backup cleanup...');

    const jobs = await this.backupJobRepository.find();

    for (const job of jobs) {
      try {
        // Calculate retention date
        const retentionDate = this.calculateRetentionDate(job);
        
        const oldBackups = await this.backupRepository.find({
          where: {
            jobId: job.id,
            createdAt: LessThan(retentionDate),
            isDeleted: false,
          },
        });

        for (const backup of oldBackups) {
          backup.isDeleted = true;
          backup.deletedAt = new Date();
          await this.backupRepository.save(backup);
          this.logger.log(`Marked backup ${backup.id} as deleted (retention policy)`);
        }
      } catch (error) {
        this.logger.error(`Failed to cleanup backups for job ${job.id}: ${error.message}`);
      }
    }

    this.logger.log('Backup cleanup completed');
  }

  // Purge deleted backups permanently every week
  @Cron('0 3 * * 0')
  async purgeDeletedBackups() {
    this.logger.log('Starting purge of deleted backups...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedBackups = await this.backupRepository.find({
      where: {
        isDeleted: true,
        deletedAt: LessThan(thirtyDaysAgo),
      },
    });

    for (const backup of deletedBackups) {
      try {
        await this.backupRepository.remove(backup);
        this.logger.log(`Permanently deleted backup ${backup.id}`);
      } catch (error) {
        this.logger.error(`Failed to purge backup ${backup.id}: ${error.message}`);
      }
    }

    this.logger.log('Purge completed');
  }

  // Check storage usage every hour
  @Cron(CronExpression.EVERY_HOUR)
  async checkStorageUsage() {
    this.logger.log('Checking storage usage...');
    // Storage check logic can be added here
  }

  // Health check every 5 minutes
  @Interval(5 * 60 * 1000)
  async healthCheck() {
    const runningBackups = await this.backupRepository.count({
      where: { status: BackupStatus.RUNNING },
    });

    if (runningBackups > 0) {
      this.logger.debug(`${runningBackups} backups currently running`);
    }
  }

  private calculateRetentionDate(job: BackupJob): Date {
    const date = new Date();
    
    switch (job.retentionUnit) {
      case 'days':
        date.setDate(date.getDate() - job.retentionValue);
        break;
      case 'weeks':
        date.setDate(date.getDate() - job.retentionValue * 7);
        break;
      case 'months':
        date.setMonth(date.getMonth() - job.retentionValue);
        break;
      case 'years':
        date.setFullYear(date.getFullYear() - job.retentionValue);
        break;
      default:
        date.setDate(date.getDate() - 7);
    }

    return date;
  }
}
