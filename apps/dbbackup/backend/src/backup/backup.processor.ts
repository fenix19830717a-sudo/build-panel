import { Processor, Process, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Backup, BackupStatus } from '../common/entities/backup.entity';
import { BackupJob } from '../common/entities/backup-job.entity';
import { DatabaseConfig, DatabaseType } from '../common/entities/database-config.entity';
import { StorageService } from '../storage/storage.service';
import { spawn } from 'child_process';
import { createWriteStream, promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as archiver from 'archiver';

@Processor('backup')
export class BackupProcessor {
  private readonly logger = new Logger(BackupProcessor.name);

  constructor(
    @InjectRepository(Backup)
    private backupRepository: Repository<Backup>,
    @InjectRepository(BackupJob)
    private backupJobRepository: Repository<BackupJob>,
    @InjectRepository(DatabaseConfig)
    private databaseRepository: Repository<DatabaseConfig>,
    private storageService: StorageService,
  ) {}

  @Process('manual-backup')
  async processManualBackup(job: Job<any>) {
    this.logger.log(`Processing manual backup: ${job.data.backupId}`);
    return this.performBackup(job.data);
  }

  @Process('scheduled-backup')
  async processScheduledBackup(job: Job<any>) {
    this.logger.log(`Processing scheduled backup for job: ${job.data.jobId}`);
    
    const backupJob = await this.backupJobRepository.findOne({
      where: { id: job.data.jobId },
      relations: ['database'],
    });

    if (!backupJob || backupJob.status !== 'active') {
      this.logger.warn(`Backup job ${job.data.jobId} not found or inactive`);
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${backupJob.database.name}_${timestamp}_${job.id}`;

    const backup = this.backupRepository.create({
      name: `${backupJob.name} - ${new Date().toLocaleString()}`,
      fileName,
      database: backupJob.database,
      databaseId: backupJob.database.id,
      job: backupJob,
      jobId: backupJob.id,
      isManual: false,
      status: BackupStatus.PENDING,
      storageType: 'local',
      storagePath: `/backups/${fileName}`,
      isEncrypted: backupJob.encryptBackup,
      isCompressed: backupJob.compressBackup,
    });

    const savedBackup = await this.backupRepository.save(backup);

    await this.performBackup({
      backupId: savedBackup.id,
      databaseId: backupJob.database.id,
      backupType: backupJob.backupType,
      encryptBackup: backupJob.encryptBackup,
      compressBackup: backupJob.compressBackup,
      includeTables: backupJob.includeTables,
      excludeTables: backupJob.excludeTables,
    });

    // Update job last run
    backupJob.lastRunAt = new Date();
    await this.backupJobRepository.save(backupJob);
  }

  private async performBackup(data: any): Promise<void> {
    const backup = await this.backupRepository.findOne({
      where: { id: data.backupId },
      relations: ['database'],
    });

    if (!backup) {
      throw new Error(`Backup ${data.backupId} not found`);
    }

    const database = backup.database;
    const backupDir = process.env.BACKUP_DIR || '/app/backups';
    const tempDir = path.join(backupDir, 'temp');
    
    try {
      // Ensure directories exist
      await fs.mkdir(tempDir, { recursive: true });
      await fs.mkdir(backupDir, { recursive: true });

      // Update status
      backup.status = BackupStatus.RUNNING;
      backup.startedAt = new Date();
      await this.backupRepository.save(backup);

      let backupFile: string;

      // Perform backup based on database type
      switch (database.type) {
        case DatabaseType.POSTGRESQL:
          backupFile = await this.backupPostgres(database, tempDir, data);
          break;
        case DatabaseType.MYSQL:
          backupFile = await this.backupMySQL(database, tempDir, data);
          break;
        case DatabaseType.MONGODB:
          backupFile = await this.backupMongoDB(database, tempDir, data);
          break;
        default:
          throw new Error(`Unsupported database type: ${database.type}`);
      }

      // Compress if needed
      let finalFile = backupFile;
      if (data.compressBackup) {
        finalFile = await this.compressFile(backupFile);
        backup.isCompressed = true;
        backup.compressionFormat = 'zip';
      }

      // Encrypt if needed
      if (data.encryptBackup) {
        const encryptedFile = await this.encryptFile(finalFile, backup.fileName);
        backup.isEncrypted = true;
        backup.encryptionAlgorithm = 'aes-256-cbc';
        finalFile = encryptedFile;
      }

      // Calculate checksum
      const checksum = await this.calculateChecksum(finalFile);
      backup.checksum = checksum;
      backup.checksumAlgorithm = 'sha256';

      // Get file size
      const stats = await fs.stat(finalFile);
      backup.size = stats.size;

      // Move to final location
      const finalPath = path.join(backupDir, path.basename(finalFile));
      await fs.rename(finalFile, finalPath);
      backup.localPath = finalPath;

      // Upload to storage destinations
      await this.storageService.uploadBackup(backup, finalPath);

      // Verify if configured
      if (data.verifyBackup) {
        backup.status = BackupStatus.VERIFYING;
        await this.backupRepository.save(backup);
        
        const verifyResult = await this.storageService.verifyBackup(backup);
        backup.status = verifyResult.valid ? BackupStatus.VERIFIED : BackupStatus.VERIFY_FAILED;
      } else {
        backup.status = BackupStatus.COMPLETED;
      }

      backup.completedAt = new Date();
      backup.duration = Math.round((backup.completedAt.getTime() - backup.startedAt.getTime()) / 1000);

      await this.backupRepository.save(backup);

      // Clean up temp file
      try {
        await fs.unlink(backupFile);
      } catch {}

      this.logger.log(`Backup ${data.backupId} completed successfully`);
    } catch (error) {
      this.logger.error(`Backup ${data.backupId} failed: ${error.message}`);
      
      backup.status = BackupStatus.FAILED;
      backup.errorMessage = error.message;
      backup.completedAt = new Date();
      
      if (backup.startedAt) {
        backup.duration = Math.round((backup.completedAt.getTime() - backup.startedAt.getTime()) / 1000);
      }
      
      await this.backupRepository.save(backup);
      throw error;
    }
  }

  private async backupPostgres(
    database: DatabaseConfig,
    tempDir: string,
    options: any,
  ): Promise<string> {
    const fileName = `${database.name}_${Date.now()}.sql`;
    const filePath = path.join(tempDir, fileName);

    const args = [
      '-h', database.host,
      '-p', database.port.toString(),
      '-U', database.username,
      '-d', database.database,
      '-F', 'c', // Custom format
      '-f', filePath,
    ];

    if (options.includeTables?.length) {
      options.includeTables.forEach((table: string) => {
        args.push('-t', table);
      });
    }

    if (options.excludeTables?.length) {
      options.excludeTables.forEach((table: string) => {
        args.push('-T', table);
      });
    }

    const env = { ...process.env, PGPASSWORD: database.password };

    await this.runCommand('pg_dump', args, env);

    return filePath;
  }

  private async backupMySQL(
    database: DatabaseConfig,
    tempDir: string,
    options: any,
  ): Promise<string> {
    const fileName = `${database.name}_${Date.now()}.sql`;
    const filePath = path.join(tempDir, fileName);

    const args = [
      '-h', database.host,
      '-P', database.port.toString(),
      '-u', database.username,
      database.database,
    ];

    if (options.includeTables?.length) {
      args.push(...options.includeTables);
    }

    const env = { ...process.env, MYSQL_PWD: database.password };

    const output = createWriteStream(filePath);
    
    await new Promise((resolve, reject) => {
      const process = spawn('mysqldump', args, { env });
      
      process.stdout.pipe(output);
      
      process.on('error', reject);
      process.on('close', (code) => {
        if (code === 0) {
          resolve(undefined);
        } else {
          reject(new Error(`mysqldump exited with code ${code}`));
        }
      });
    });

    return filePath;
  }

  private async backupMongoDB(
    database: DatabaseConfig,
    tempDir: string,
    options: any,
  ): Promise<string> {
    const dumpDir = path.join(tempDir, `${database.name}_${Date.now()}`);
    
    const uri = `mongodb://${database.username}:${database.password}@${database.host}:${database.port}/${database.database}`;
    
    const args = [
      '--uri', uri,
      '--out', dumpDir,
    ];

    if (options.includeTables?.length) {
      args.push('--collection', options.includeTables[0]);
    }

    await this.runCommand('mongodump', args);

    // Create archive
    const archivePath = `${dumpDir}.tar.gz`;
    await this.runCommand('tar', ['-czf', archivePath, '-C', tempDir, path.basename(dumpDir)]);
    
    // Clean up dump directory
    await fs.rm(dumpDir, { recursive: true, force: true });

    return archivePath;
  }

  private async compressFile(filePath: string): Promise<string> {
    const outputPath = `${filePath}.zip`;
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 6 } });

    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          this.logger.warn(err);
        } else {
          reject(err);
        }
      });

      archive.pipe(output);
      archive.file(filePath, { name: path.basename(filePath) });
      archive.finalize();
    });

    return outputPath;
  }

  private async encryptFile(filePath: string, keyId: string): Promise<string> {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const outputPath = `${filePath}.enc`;
    const input = await fs.readFile(filePath);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
    const output = Buffer.concat([iv, encrypted]);
    
    await fs.writeFile(outputPath, output);
    
    return outputPath;
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    const hash = crypto.createHash('sha256');
    const input = await fs.readFile(filePath);
    hash.update(input);
    return hash.digest('hex');
  }

  private runCommand(command: string, args: string[], env?: NodeJS.ProcessEnv): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { env });
      
      let stderr = '';
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('error', reject);
      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`${command} exited with code ${code}: ${stderr}`));
        }
      });
    });
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }
}
