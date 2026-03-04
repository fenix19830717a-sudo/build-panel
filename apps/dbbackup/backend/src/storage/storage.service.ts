import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageConfig, StorageProvider } from '../common/entities/storage-config.entity';
import { Backup, StorageType } from '../common/entities/backup.entity';
import { Client as MinioClient } from 'minio';
import * as AWS from 'aws-sdk';
import * as ClientSFTP from 'ssh2-sftp-client';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private s3Clients: Map<string, AWS.S3> = new Map();
  private minioClients: Map<string, MinioClient> = new Map();

  constructor(
    @InjectRepository(StorageConfig)
    private storageConfigRepository: Repository<StorageConfig>,
  ) {}

  async findAll(): Promise<StorageConfig[]> {
    return this.storageConfigRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<StorageConfig> {
    const config = await this.storageConfigRepository.findOne({
      where: { id },
    });
    if (!config) {
      throw new NotFoundException(`Storage config with ID ${id} not found`);
    }
    return config;
  }

  async create(config: Partial<StorageConfig>): Promise<StorageConfig> {
    const storage = this.storageConfigRepository.create(config);
    return this.storageConfigRepository.save(storage);
  }

  async update(id: string, config: Partial<StorageConfig>): Promise<StorageConfig> {
    const storage = await this.findOne(id);
    Object.assign(storage, config);
    return this.storageConfigRepository.save(storage);
  }

  async remove(id: string): Promise<void> {
    const storage = await this.findOne(id);
    await this.storageConfigRepository.remove(storage);
  }

  async uploadBackup(backup: Backup, localPath: string): Promise<void> {
    switch (backup.storageType) {
      case StorageType.S3:
        await this.uploadToS3(backup, localPath);
        break;
      case StorageType.MINIO:
        await this.uploadToMinio(backup, localPath);
        break;
      case StorageType.SFTP:
        await this.uploadToSFTP(backup, localPath);
        break;
      case StorageType.LOCAL:
      default:
        // Already stored locally
        break;
    }
  }

  private async uploadToS3(backup: Backup, localPath: string): Promise<void> {
    const config = await this.getStorageConfig(StorageProvider.S3);
    if (!config) return;

    const s3 = this.getS3Client(config);
    const fileContent = await fs.readFile(localPath);
    
    await s3.upload({
      Bucket: config.bucket,
      Key: `${config.pathPrefix || ''}${path.basename(localPath)}`,
      Body: fileContent,
      Metadata: {
        'backup-id': backup.id,
        'database-id': backup.databaseId,
        'checksum': backup.checksum || '',
      },
    }).promise();
  }

  private async uploadToMinio(backup: Backup, localPath: string): Promise<void> {
    const config = await this.getStorageConfig(StorageProvider.MINIO);
    if (!config) return;

    const minio = this.getMinioClient(config);
    
    await minio.fPutObject(
      config.bucket,
      `${config.pathPrefix || ''}${path.basename(localPath)}`,
      localPath,
      {
        'backup-id': backup.id,
        'database-id': backup.databaseId,
      }
    );
  }

  private async uploadToSFTP(backup: Backup, localPath: string): Promise<void> {
    const config = await this.getStorageConfig(StorageProvider.SFTP);
    if (!config) return;

    const sftp = new ClientSFTP();
    
    try {
      await sftp.connect({
        host: config.sftpHost,
        port: config.sftpPort || 22,
        username: config.sftpUsername,
        password: config.sftpPassword,
        privateKey: config.sftpPrivateKey,
      });

      const remotePath = path.join(
        config.sftpRemotePath || '/backups',
        path.basename(localPath)
      );
      
      await sftp.put(localPath, remotePath);
    } finally {
      await sftp.end();
    }
  }

  async deleteBackup(backup: Backup): Promise<void> {
    // Delete from local storage
    if (backup.localPath) {
      try {
        await fs.unlink(backup.localPath);
      } catch {}
    }

    // Delete from remote storage
    switch (backup.storageType) {
      case StorageType.S3:
        await this.deleteFromS3(backup);
        break;
      case StorageType.MINIO:
        await this.deleteFromMinio(backup);
        break;
      case StorageType.SFTP:
        await this.deleteFromSFTP(backup);
        break;
    }
  }

  private async deleteFromS3(backup: Backup): Promise<void> {
    const config = await this.getStorageConfig(StorageProvider.S3);
    if (!config) return;

    const s3 = this.getS3Client(config);
    
    await s3.deleteObject({
      Bucket: config.bucket,
      Key: backup.storagePath,
    }).promise();
  }

  private async deleteFromMinio(backup: Backup): Promise<void> {
    const config = await this.getStorageConfig(StorageProvider.MINIO);
    if (!config) return;

    const minio = this.getMinioClient(config);
    
    await minio.removeObject(config.bucket, backup.storagePath);
  }

  private async deleteFromSFTP(backup: Backup): Promise<void> {
    const config = await this.getStorageConfig(StorageProvider.SFTP);
    if (!config) return;

    const sftp = new ClientSFTP();
    
    try {
      await sftp.connect({
        host: config.sftpHost,
        port: config.sftpPort || 22,
        username: config.sftpUsername,
        password: config.sftpPassword,
      });
      
      await sftp.delete(backup.storagePath);
    } finally {
      await sftp.end();
    }
  }

  async getBackupDownloadPath(backup: Backup): Promise<{ path: string; filename: string }> {
    if (!backup.localPath || !(await this.fileExists(backup.localPath))) {
      // Download from remote storage if not available locally
      if (backup.storageType !== StorageType.LOCAL) {
        await this.downloadBackup(backup);
      }
    }

    return {
      path: backup.localPath,
      filename: path.basename(backup.localPath),
    };
  }

  private async downloadBackup(backup: Backup): Promise<void> {
    const backupDir = process.env.BACKUP_DIR || '/app/backups';
    const localPath = path.join(backupDir, path.basename(backup.storagePath));

    switch (backup.storageType) {
      case StorageType.S3:
        await this.downloadFromS3(backup, localPath);
        break;
      case StorageType.MINIO:
        await this.downloadFromMinio(backup, localPath);
        break;
      case StorageType.SFTP:
        await this.downloadFromSFTP(backup, localPath);
        break;
    }

    backup.localPath = localPath;
  }

  private async downloadFromS3(backup: Backup, localPath: string): Promise<void> {
    const config = await this.getStorageConfig(StorageProvider.S3);
    if (!config) throw new Error('S3 config not found');

    const s3 = this.getS3Client(config);
    
    const result = await s3.getObject({
      Bucket: config.bucket,
      Key: backup.storagePath,
    }).promise();

    await fs.writeFile(localPath, result.Body as Buffer);
  }

  private async downloadFromMinio(backup: Backup, localPath: string): Promise<void> {
    const config = await this.getStorageConfig(StorageProvider.MINIO);
    if (!config) throw new Error('MinIO config not found');

    const minio = this.getMinioClient(config);
    
    await minio.fGetObject(config.bucket, backup.storagePath, localPath);
  }

  private async downloadFromSFTP(backup: Backup, localPath: string): Promise<void> {
    const config = await this.getStorageConfig(StorageProvider.SFTP);
    if (!config) throw new Error('SFTP config not found');

    const sftp = new ClientSFTP();
    
    try {
      await sftp.connect({
        host: config.sftpHost,
        port: config.sftpPort || 22,
        username: config.sftpUsername,
        password: config.sftpPassword,
      });
      
      await sftp.get(backup.storagePath, localPath);
    } finally {
      await sftp.end();
    }
  }

  async verifyBackup(backup: Backup): Promise<{ valid: boolean; message: string }> {
    try {
      // Check if file exists
      if (!backup.localPath || !(await this.fileExists(backup.localPath))) {
        await this.downloadBackup(backup);
      }

      // Verify checksum
      if (backup.checksum) {
        const crypto = await import('crypto');
        const fileContent = await fs.readFile(backup.localPath);
        const hash = crypto.createHash('sha256').update(fileContent).digest('hex');
        
        if (hash !== backup.checksum) {
          return { valid: false, message: 'Checksum verification failed' };
        }
      }

      // Check if file can be read
      const stats = await fs.stat(backup.localPath);
      if (stats.size === 0) {
        return { valid: false, message: 'Backup file is empty' };
      }

      return { valid: true, message: 'Backup verified successfully' };
    } catch (error) {
      return { valid: false, message: `Verification failed: ${error.message}` };
    }
  }

  private async getStorageConfig(provider: StorageProvider): Promise<StorageConfig | undefined> {
    const configs = await this.storageConfigRepository.find({
      where: { provider, isActive: true },
    });
    return configs[0];
  }

  private getS3Client(config: StorageConfig): AWS.S3 {
    const key = config.id;
    if (!this.s3Clients.has(key)) {
      this.s3Clients.set(key, new AWS.S3({
        endpoint: config.endpoint,
        region: config.region,
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        s3ForcePathStyle: true,
        sslEnabled: config.useSSL,
      }));
    }
    return this.s3Clients.get(key);
  }

  private getMinioClient(config: StorageConfig): MinioClient {
    const key = config.id;
    if (!this.minioClients.has(key)) {
      this.minioClients.set(key, new MinioClient({
        endPoint: config.endpoint.replace(/^https?:\/\//, ''),
        port: config.useSSL ? 443 : 80,
        useSSL: config.useSSL,
        accessKey: config.accessKeyId,
        secretKey: config.secretAccessKey,
      }));
    }
    return this.minioClients.get(key);
  }

  private async fileExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
}
