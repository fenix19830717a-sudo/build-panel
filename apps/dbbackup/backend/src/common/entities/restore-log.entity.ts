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
import { Backup } from './backup.entity';

export enum RestoreStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  VERIFYING = 'verifying',
}

export enum RestoreMode {
  FULL = 'full',
  PARTIAL = 'partial',
  PITR = 'pitr',
}

@Entity('restore_logs')
export class RestoreLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column(() => Backup)
  backupId: string;

  @ManyToOne(() => Backup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'backupId' })
  backup: Backup;

  @Column(() => DatabaseConfig)
  targetDatabaseId: string;

  @ManyToOne(() => DatabaseConfig, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'targetDatabaseId' })
  targetDatabase: DatabaseConfig;

  @Column({
    type: 'enum',
    enum: RestoreStatus,
    default: RestoreStatus.PENDING,
  })
  status: RestoreStatus;

  @Column({
    type: 'enum',
    enum: RestoreMode,
    default: RestoreMode.FULL,
  })
  restoreMode: RestoreMode;

  @Column({ type: 'timestamp', nullable: true })
  pitrTimestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  includeTables: string[];

  @Column({ type: 'jsonb', nullable: true })
  excludeTables: string[];

  @Column({ type: 'boolean', default: false })
  dropBeforeRestore: boolean;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'int', nullable: true })
  duration: number;

  @Column({ type: 'bigint', nullable: true })
  rowsRestored: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'text', nullable: true })
  logOutput: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  initiatedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
