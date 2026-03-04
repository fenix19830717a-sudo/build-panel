import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Backup, BackupStatus } from '../common/entities/backup.entity';
import { BackupJob } from '../common/entities/backup-job.entity';
import { DatabaseConfig } from '../common/entities/database-config.entity';
import { CreateBackupDto, CreateBackupJobDto, UpdateBackupJobDto } from '../common/dto/backup.dto';
import { StorageService } from '../storage/storage.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BackupService {
  constructor(
    @InjectRepository(Backup)
    private backupRepository: Repository<Backup>,
    @InjectRepository(BackupJob)
    private backupJobRepository: Repository<BackupJob>,
    @InjectRepository(DatabaseConfig)
    private databaseRepository: Repository<DatabaseConfig>,
    @InjectQueue('backup')
    private backupQueue: Queue,
    private storageService: StorageService,
  ) {}

  // Backup Job methods
  async findAllJobs(): Promise<BackupJob[]> {
    return this.backupJobRepository.find({
      relations: ['database'],
      order: { createdAt: 'DESC' },
    });
  }

  async findJobById(id: string): Promise<BackupJob> {
    const job = await this.backupJobRepository.findOne({
      where: { id },
      relations: ['database'],
    });
    if (!job) {
      throw new NotFoundException(`Backup job with ID ${id} not found`);
    }
    return job;
  }

  async createJob(createDto: CreateBackupJobDto): Promise<BackupJob> {
    const database = await this.databaseRepository.findOne({
      where: { id: createDto.databaseId },
    });
    if (!database) {
      throw new NotFoundException(`Database with ID ${createDto.databaseId} not found`);
    }

    const job = this.backupJobRepository.create({
      ...createDto,
      database,
    });

    const savedJob = await this.backupJobRepository.save(job);
    
    // Schedule the job
    await this.scheduleJob(savedJob);
    
    return savedJob;
  }

  async updateJob(id: string, updateDto: UpdateBackupJobDto): Promise<BackupJob> {
    const job = await this.findJobById(id);
    Object.assign(job, updateDto);
    
    const savedJob = await this.backupJobRepository.save(job);
    
    // Reschedule if cron expression changed
    if (updateDto.cronExpression) {
      await this.scheduleJob(savedJob);
    }
    
    return savedJob;
  }

  async deleteJob(id: string): Promise<void> {
    const job = await this.findJobById(id);
    
    // Remove scheduled job
    const repeatableJobs = await this.backupQueue.getRepeatableJobs();
    const repeatableJob = repeatableJobs.find(j => j.id === id);
    if (repeatableJob) {
      await this.backupQueue.removeRepeatableByKey(repeatableJob.key);
    }
    
    await this.backupJobRepository.remove(job);
  }

  async scheduleJob(job: BackupJob): Promise<void> {
    // Remove existing repeatable job if any
    const repeatableJobs = await this.backupQueue.getRepeatableJobs();
    const existingJob = repeatableJobs.find(j => j.id === job.id);
    if (existingJob) {
      await this.backupQueue.removeRepeatableByKey(existingJob.key);
    }

    if (job.status === 'active') {
      await this.backupQueue.add(
        'scheduled-backup',
        { jobId: job.id },
        {
          jobId: job.id,
          repeat: {
            cron: job.cronExpression,
          },
        },
      );
    }
  }

  // Backup methods
  async findAllBackups(query?: { databaseId?: string; status?: string }): Promise<Backup[]> {
    const where: any = {};
    if (query?.databaseId) {
      where.databaseId = query.databaseId;
    }
    if (query?.status) {
      where.status = query.status;
    }

    return this.backupRepository.find({
      where,
      relations: ['database', 'job'],
      order: { createdAt: 'DESC' },
    });
  }

  async findBackupById(id: string): Promise<Backup> {
    const backup = await this.backupRepository.findOne({
      where: { id },
      relations: ['database', 'job'],
    });
    if (!backup) {
      throw new NotFoundException(`Backup with ID ${id} not found`);
    }
    return backup;
  }

  async createBackup(createDto: CreateBackupDto): Promise<Backup> {
    const database = await this.databaseRepository.findOne({
      where: { id: createDto.databaseId },
    });
    if (!database) {
      throw new NotFoundException(`Database with ID ${createDto.databaseId} not found`);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${database.name}_${timestamp}_${uuidv4().slice(0, 8)}`;

    const backup = this.backupRepository.create({
      name: `${database.name} Backup ${new Date().toLocaleString()}`,
      fileName,
      database,
      databaseId: database.id,
      isManual: true,
      status: BackupStatus.PENDING,
      storageType: 'local',
      storagePath: `/backups/${fileName}`,
      isEncrypted: createDto.encryptBackup ?? true,
      isCompressed: createDto.compressBackup ?? true,
    });

    const savedBackup = await this.backupRepository.save(backup);

    // Add to queue
    await this.backupQueue.add('manual-backup', {
      backupId: savedBackup.id,
      databaseId: database.id,
      backupType: createDto.backupType || 'full',
      encryptBackup: createDto.encryptBackup ?? true,
      compressBackup: createDto.compressBackup ?? true,
    });

    return savedBackup;
  }

  async deleteBackup(id: string): Promise<void> {
    const backup = await this.findBackupById(id);
    
    // Delete from storage
    await this.storageService.deleteBackup(backup);
    
    await this.backupRepository.remove(backup);
  }

  async downloadBackup(id: string): Promise<{ path: string; filename: string }> {
    const backup = await this.findBackupById(id);
    
    if (backup.status !== BackupStatus.COMPLETED && backup.status !== BackupStatus.VERIFIED) {
      throw new BadRequestException('Backup is not ready for download');
    }

    return this.storageService.getBackupDownloadPath(backup);
  }

  async verifyBackup(id: string): Promise<{ valid: boolean; message: string }> {
    const backup = await this.findBackupById(id);
    return this.storageService.verifyBackup(backup);
  }
}
