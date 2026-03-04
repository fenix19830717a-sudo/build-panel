import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Monitor } from './monitor.entity';

export enum AlertStatus {
  PENDING = 'pending',
  SENT = 'sent',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  FAILED = 'failed',
}

export enum AlertSeverity {
  CRITICAL = 'critical',
  WARNING = 'warning',
  INFO = 'info',
}

export enum AlertType {
  DOWN = 'down',
  UP = 'up',
  SSL_EXPIRING = 'ssl_expiring',
  RESPONSE_TIME = 'response_time',
  KEYWORD_MISMATCH = 'keyword_mismatch',
  STATUS_CODE_MISMATCH = 'status_code_mismatch',
}

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  monitorId: string;

  @Column({ type: 'enum', enum: AlertType })
  type: AlertType;

  @Column({ type: 'enum', enum: AlertSeverity, default: AlertSeverity.WARNING })
  severity: AlertSeverity;

  @Column({ type: 'enum', enum: AlertStatus, default: AlertStatus.PENDING })
  status: AlertStatus;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({ type: 'simple-json', nullable: true })
  checkResult: {
    status: string;
    responseTime: number;
    statusCode?: number;
    errorMessage?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'int', default: 0 })
  notificationCount: number; // 通知发送次数

  @Column({ type: 'simple-json', nullable: true })
  notificationChannels: {
    channelId: string;
    type: string;
    status: string;
    sentAt?: Date;
    error?: string;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Monitor, (monitor) => monitor.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'monitor_id' })
  monitor: Monitor;
}
