import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { DatabaseConfig } from './database-config.entity';
import { Backup } from './backup.entity';

export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential',
}

export enum JobStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  DISABLED = 'disabled',
  ERROR = 'error',
}

export enum RetentionUnit {
  DAYS = 'days',
  WEEKS = 'weeks',
  MONTHS = 'months',
  YEARS = 'years',
}

@Entity('backup_jobs')
export class BackupJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column(() => DatabaseConfig)
  databaseId: string;

  @ManyToOne(() => DatabaseConfig, (db) => db.backupJobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'databaseId' })
  database: DatabaseConfig;

  @Column({
    type: 'enum',
    enum: BackupType,
    default: BackupType.FULL,
  })
  backupType: BackupType;

  @Column({ type: 'text' })
  cronExpression: string;

  @Column({ type: 'timestamp', nullable: true })
  nextRunAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastRunAt: Date;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.ACTIVE,
  })
  status: JobStatus;

  @Column({ type: 'int', default: 7 })
  retentionValue: number;

  @Column({
    type: 'enum',
    enum: RetentionUnit,
    default: RetentionUnit.DAYS,
  })
  retentionUnit: RetentionUnit;

  @Column({ type: 'boolean', default: true })
  encryptBackup: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  encryptionKey: string;

  @Column({ type: 'boolean', default: true })
  compressBackup: boolean;

  @Column({ type: 'int', default: 6 })
  compressionLevel: number;

  @Column({ type: 'jsonb', nullable: true })
  includeTables: string[];

  @Column({ type: 'jsonb', nullable: true })
  excludeTables: string[];

  @Column({ type: 'text', nullable: true })
  preBackupScript: string;

  @Column({ type: 'text', nullable: true })
  postBackupScript: string;

  @Column({ type: 'boolean', default: true })
  verifyBackup: boolean;

  @Column({ type: 'boolean', default: true })
  notifyOnSuccess: boolean;

  @Column({ type: 'boolean', default: true })
  notifyOnFailure: boolean;

  @Column({ type: 'jsonb', nullable: true })
  notificationChannels: string[];

  @Column({ type: 'jsonb', nullable: true })
  storageDestinations: string[];

  @Column({ type: 'int', default: 0 })
  successCount: number;

  @Column({ type: 'int', default: 0 })
  failureCount: number;

  @OneToMany(() => Backup, (backup) => backup.job, { cascade: true })
  backups: Backup[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
