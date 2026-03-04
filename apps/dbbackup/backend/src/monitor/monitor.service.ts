import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Backup, BackupStatus } from '../common/entities/backup.entity';
import { BackupJob, JobStatus } from '../common/entities/backup-job.entity';
import { RestoreLog } from '../common/entities/restore-log.entity';

@Injectable()
export class MonitorService {
  constructor(
    @InjectRepository(Backup)
    private backupRepository: Repository<Backup>,
    @InjectRepository(BackupJob)
    private backupJobRepository: Repository<BackupJob>,
    @InjectRepository(RestoreLog)
    private restoreLogRepository: Repository<RestoreLog>,
  ) {}

  async getDashboardStats(): Promise<any> {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalBackups,
      backups24h,
      backups7d,
      backups30d,
      failedBackups24h,
      totalJobs,
      activeJobs,
      totalRestores,
      storageStats,
    ] = await Promise.all([
      this.backupRepository.count(),
      this.backupRepository.count({ where: { createdAt: Between(last24h, now) } }),
      this.backupRepository.count({ where: { createdAt: Between(last7d, now) } }),
      this.backupRepository.count({ where: { createdAt: Between(last30d, now) } }),
      this.backupRepository.count({
        where: { status: BackupStatus.FAILED, createdAt: Between(last24h, now) },
      }),
      this.backupJobRepository.count(),
      this.backupJobRepository.count({ where: { status: JobStatus.ACTIVE } }),
      this.restoreLogRepository.count(),
      this.getStorageStats(),
    ]);

    return {
      backups: {
        total: totalBackups,
        last24h: backups24h,
        last7d: backups7d,
        last30d: backups30d,
        failed24h: failedBackups24h,
        successRate: backups24h > 0 
          ? Math.round(((backups24h - failedBackups24h) / backups24h) * 100) 
          : 100,
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
      },
      restores: {
        total: totalRestores,
      },
      storage: storageStats,
    };
  }

  async getBackupTrend(days: number = 7): Promise<any[]> {
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [count, totalSize] = await Promise.all([
        this.backupRepository.count({
          where: { createdAt: Between(date, nextDate) },
        }),
        this.backupRepository
          .createQueryBuilder('backup')
          .select('COALESCE(SUM(backup.size), 0)', 'total')
          .where('backup.createdAt BETWEEN :start AND :end', {
            start: date,
            end: nextDate,
          })
          .getRawOne(),
      ]);

      result.push({
        date: date.toISOString().split('T')[0],
        count,
        size: parseInt(totalSize?.total || '0'),
      });
    }

    return result;
  }

  async getRecentBackups(limit: number = 10): Promise<Backup[]> {
    return this.backupRepository.find({
      relations: ['database'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getFailedBackups(limit: number = 10): Promise<Backup[]> {
    return this.backupRepository.find({
      where: { status: BackupStatus.FAILED },
      relations: ['database'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getJobStats(): Promise<any[]> {
    const jobs = await this.backupJobRepository.find({
      relations: ['database'],
    });

    return jobs.map(job => ({
      id: job.id,
      name: job.name,
      status: job.status,
      databaseName: job.database?.name,
      successCount: job.successCount,
      failureCount: job.failureCount,
      lastRunAt: job.lastRunAt,
      nextRunAt: job.nextRunAt,
    }));
  }

  async getAlerts(): Promise<any[]> {
    const alerts = [];
    const now = new Date();

    // Check for failed backups in last 24h
    const failedBackups = await this.backupRepository.find({
      where: { status: BackupStatus.FAILED },
      relations: ['database'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    failedBackups.forEach(backup => {
      alerts.push({
        type: 'error',
        title: 'Backup Failed',
        message: `Backup "${backup.name}" failed: ${backup.errorMessage}`,
        timestamp: backup.createdAt,
        data: { backupId: backup.id },
      });
    });

    // Check for jobs that haven't run recently
    const jobs = await this.backupJobRepository.find({
      where: { status: JobStatus.ACTIVE },
      relations: ['database'],
    });

    jobs.forEach(job => {
      if (job.lastRunAt) {
        const hoursSinceLastRun = (now.getTime() - job.lastRunAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastRun > 25) {
          alerts.push({
            type: 'warning',
            title: 'Job Overdue',
            message: `Job "${job.name}" hasn't run in ${Math.round(hoursSinceLastRun)} hours`,
            timestamp: job.lastRunAt,
            data: { jobId: job.id },
          });
        }
      }
    });

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private async getStorageStats(): Promise<any> {
    const stats = await this.backupRepository
      .createQueryBuilder('backup')
      .select('COALESCE(SUM(backup.size), 0)', 'totalSize')
      .addSelect('COUNT(*)', 'totalCount')
      .where('backup.isDeleted = false')
      .getRawOne();

    return {
      totalSize: parseInt(stats?.totalSize || '0'),
      totalCount: parseInt(stats?.totalCount || '0'),
    };
  }
}
