import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BackupJob } from './backup-job.entity';
import { Backup } from './backup.entity';

export enum DatabaseType {
  MYSQL = 'mysql',
  POSTGRESQL = 'postgresql',
  MONGODB = 'mongodb',
}

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  TESTING = 'testing',
}

@Entity('databases')
export class DatabaseConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: DatabaseType,
    default: DatabaseType.POSTGRESQL,
  })
  type: DatabaseType;

  @Column({ length: 255 })
  host: string;

  @Column({ type: 'int', default: 5432 })
  port: number;

  @Column({ length: 100 })
  database: string;

  @Column({ length: 100 })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column({ type: 'text', nullable: true })
  sslCa: string;

  @Column({ type: 'text', nullable: true })
  sslCert: string;

  @Column({ type: 'text', nullable: true })
  sslKey: string;

  @Column({ type: 'boolean', default: false })
  sslEnabled: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: ConnectionStatus,
    default: ConnectionStatus.DISCONNECTED,
  })
  connectionStatus: ConnectionStatus;

  @Column({ type: 'text', nullable: true })
  connectionError: string;

  @Column({ type: 'timestamp', nullable: true })
  lastConnectedAt: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => BackupJob, (job) => job.database, { cascade: true })
  backupJobs: BackupJob[];

  @OneToMany(() => Backup, (backup) => backup.database, { cascade: true })
  backups: Backup[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
