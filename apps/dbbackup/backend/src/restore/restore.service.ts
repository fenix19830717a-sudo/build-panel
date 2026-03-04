import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestoreLog, RestoreStatus, RestoreMode } from '../common/entities/restore-log.entity';
import { Backup, BackupStatus } from '../common/entities/backup.entity';
import { DatabaseConfig, DatabaseType } from '../common/entities/database-config.entity';
import { StorageService } from '../storage/storage.service';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as unzipper from 'unzipper';

@Injectable()
export class RestoreService {
  constructor(
    @InjectRepository(RestoreLog)
    private restoreLogRepository: Repository<RestoreLog>,
    @InjectRepository(Backup)
    private backupRepository: Repository<Backup>,
    @InjectRepository(DatabaseConfig)
    private databaseRepository: Repository<DatabaseConfig>,
    private storageService: StorageService,
  ) {}

  async findAll(): Promise<RestoreLog[]> {
    return this.restoreLogRepository.find({
      relations: ['backup', 'targetDatabase'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<RestoreLog> {
    const log = await this.restoreLogRepository.findOne({
      where: { id },
      relations: ['backup', 'targetDatabase'],
    });
    if (!log) {
      throw new NotFoundException(`Restore log with ID ${id} not found`);
    }
    return log;
  }

  async restore(data: {
    backupId: string;
    targetDatabaseId: string;
    restoreMode?: RestoreMode;
    pitrTimestamp?: Date;
    includeTables?: string[];
    excludeTables?: string[];
    dropBeforeRestore?: boolean;
  }): Promise<RestoreLog> {
    const backup = await this.backupRepository.findOne({
      where: { id: data.backupId },
      relations: ['database'],
    });
    if (!backup) {
      throw new NotFoundException(`Backup with ID ${data.backupId} not found`);
    }

    if (backup.status !== BackupStatus.COMPLETED && backup.status !== BackupStatus.VERIFIED) {
      throw new BadRequestException('Backup is not ready for restore');
    }

    const targetDatabase = await this.databaseRepository.findOne({
      where: { id: data.targetDatabaseId },
    });
    if (!targetDatabase) {
      throw new NotFoundException(`Target database with ID ${data.targetDatabaseId} not found`);
    }

    const restoreLog = this.restoreLogRepository.create({
      backup,
      backupId: backup.id,
      targetDatabase,
      targetDatabaseId: targetDatabase.id,
      status: RestoreStatus.PENDING,
      restoreMode: data.restoreMode || RestoreMode.FULL,
      pitrTimestamp: data.pitrTimestamp,
      includeTables: data.includeTables,
      excludeTables: data.excludeTables,
      dropBeforeRestore: data.dropBeforeRestore || false,
    });

    const savedLog = await this.restoreLogRepository.save(restoreLog);

    // Start restore process asynchronously
    this.performRestore(savedLog, backup, targetDatabase).catch((error) => {
      console.error('Restore failed:', error);
    });

    return savedLog;
  }

  private async performRestore(
    restoreLog: RestoreLog,
    backup: Backup,
    targetDatabase: DatabaseConfig,
  ): Promise<void> {
    try {
      restoreLog.status = RestoreStatus.RUNNING;
      restoreLog.startedAt = new Date();
      await this.restoreLogRepository.save(restoreLog);

      // Get backup file
      const { path: backupPath } = await this.storageService.getBackupDownloadPath(backup);
      let tempFile = backupPath;

      // Decrypt if encrypted
      if (backup.isEncrypted) {
        tempFile = await this.decryptFile(backupPath, backup.fileName);
      }

      // Decompress if compressed
      if (backup.isCompressed) {
        tempFile = await this.decompressFile(tempFile);
      }

      // Perform restore based on database type
      switch (targetDatabase.type) {
        case DatabaseType.POSTGRESQL:
          await this.restorePostgres(tempFile, targetDatabase, restoreLog);
          break;
        case DatabaseType.MYSQL:
          await this.restoreMySQL(tempFile, targetDatabase, restoreLog);
          break;
        case DatabaseType.MONGODB:
          await this.restoreMongoDB(tempFile, targetDatabase, restoreLog);
          break;
        default:
          throw new Error(`Unsupported database type: ${targetDatabase.type}`);
      }

      // Clean up temp files
      if (tempFile !== backupPath) {
        try {
          await fs.unlink(tempFile);
        } catch {}
      }

      restoreLog.status = RestoreStatus.COMPLETED;
      restoreLog.completedAt = new Date();
      restoreLog.duration = Math.round(
        (restoreLog.completedAt.getTime() - restoreLog.startedAt.getTime()) / 1000
      );

      await this.restoreLogRepository.save(restoreLog);
    } catch (error) {
      restoreLog.status = RestoreStatus.FAILED;
      restoreLog.errorMessage = error.message;
      restoreLog.completedAt = new Date();
      if (restoreLog.startedAt) {
        restoreLog.duration = Math.round(
          (restoreLog.completedAt.getTime() - restoreLog.startedAt.getTime()) / 1000
        );
      }
      await this.restoreLogRepository.save(restoreLog);
      throw error;
    }
  }

  private async restorePostgres(
    filePath: string,
    database: DatabaseConfig,
    restoreLog: RestoreLog,
  ): Promise<void> {
    const args = [
      '-h', database.host,
      '-p', database.port.toString(),
      '-U', database.username,
      '-d', database.database,
      filePath,
    ];

    if (restoreLog.dropBeforeRestore) {
      args.push('-c'); // Clean (drop) database objects before recreating
    }

    const env = { ...process.env, PGPASSWORD: database.password };

    await this.runCommand('pg_restore', args, env);
  }

  private async restoreMySQL(
    filePath: string,
    database: DatabaseConfig,
    restoreLog: RestoreLog,
  ): Promise<void> {
    const args = [
      '-h', database.host,
      '-P', database.port.toString(),
      '-u', database.username,
      database.database,
    ];

    const env = { ...process.env, MYSQL_PWD: database.password };

    const input = await fs.readFile(filePath);
    
    await new Promise((resolve, reject) => {
      const process = spawn('mysql', args, { env });
      
      process.stdin.write(input);
      process.stdin.end();
      
      process.on('error', reject);
      process.on('close', (code) => {
        if (code === 0) {
          resolve(undefined);
        } else {
          reject(new Error(`mysql exited with code ${code}`));
        }
      });
    });
  }

  private async restoreMongoDB(
    filePath: string,
    database: DatabaseConfig,
    restoreLog: RestoreLog,
  ): Promise<void> {
    const uri = `mongodb://${database.username}:${database.password}@${database.host}:${database.port}/${database.database}`;
    
    const args = [
      '--uri', uri,
      '--drop',
    ];

    if (filePath.endsWith('.tar.gz')) {
      // Extract first
      const extractDir = path.dirname(filePath);
      await this.runCommand('tar', ['-xzf', filePath, '-C', extractDir]);
      
      const extractedDir = path.join(extractDir, path.basename(filePath, '.tar.gz'));
      args.push('--dir', extractedDir);
    } else {
      args.push('--archive', filePath);
    }

    await this.runCommand('mongorestore', args);
  }

  private async decryptFile(filePath: string, keyId: string): Promise<string> {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    
    const input = await fs.readFile(filePath);
    const iv = input.slice(0, 16);
    const encrypted = input.slice(16);
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    
    const outputPath = filePath.replace('.enc', '');
    await fs.writeFile(outputPath, decrypted);
    
    return outputPath;
  }

  private async decompressFile(filePath: string): Promise<string> {
    if (filePath.endsWith('.zip')) {
      const outputDir = path.dirname(filePath);
      const extractedFiles: string[] = [];
      
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(unzipper.Parse())
          .on('entry', (entry) => {
            const fileName = path.join(outputDir, entry.path);
            extractedFiles.push(fileName);
            entry.pipe(fs.createWriteStream(fileName));
          })
          .on('close', resolve)
          .on('error', reject);
      });
      
      return extractedFiles[0] || filePath.replace('.zip', '');
    }
    
    return filePath;
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
}
