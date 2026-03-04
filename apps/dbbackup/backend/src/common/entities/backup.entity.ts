import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DatabaseConfig } from './database-config.entity';
import { BackupJob } from './backup-job.entity';

export enum BackupStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  VERIFYING = 'verifying',
  VERIFIED = 'verified',
  VERIFY_FAILED = 'verify_failed',
}

export enum StorageType {
  LOCAL = 'local',
  S3 = 's3',
  MINIO = 'minio',
  SFTP = 'sftp',
  GCS = 'gcs',
  AZURE = 'azure',
}

@Entity('backups')
export class Backup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  fileName: string;

  @Column(() => DatabaseConfig)
  databaseId: string;

  @ManyToOne(() => DatabaseConfig, (db) => db.backups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'databaseId' })
  database: DatabaseConfig;

  @Column(() => BackupJob)
  jobId: string;

  @ManyToOne(() => BackupJob, (job) => job.backups, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'jobId' })
  job: BackupJob;

  @Column({ type: 'boolean', default: false })
  isManual: boolean;

  @Column({
    type: 'enum',
    enum: BackupStatus,
    default: BackupStatus.PENDING,
  })
  status: BackupStatus;

  @Column({ type: 'bigint', default: 0 })
  size: number;

  @Column({ type: 'bigint', nullable: true })
  uncompressedSize: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  checksum: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  checksumAlgorithm: string;

  @Column({
    type: 'enum',
    enum: StorageType,
    default: StorageType.LOCAL,
  })
  storageType: StorageType;

  @Column({ type: 'text' })
  storagePath: string;

  @Column({ type: 'jsonb', nullable: true })
  storageMetadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  localPath: string;

  @Column({ type: 'boolean', default: false })
  isEncrypted: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  encryptionAlgorithm: string;

  @Column({ type: 'boolean', default: false })
  isCompressed: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  compressionFormat: string;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'int', nullable: true })
  duration: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'text', nullable: true })
  logOutput: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
