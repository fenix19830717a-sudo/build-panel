import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { CheckResult } from './check-result.entity';
import { AlertChannel } from './alert-channel.entity';

export enum MonitorType {
  HTTP = 'http',
  HTTPS = 'https',
  TCP = 'tcp',
  PING = 'ping',
}

export enum MonitorStatus {
  UP = 'up',
  DOWN = 'down',
  PENDING = 'pending',
  PAUSED = 'paused',
}

@Entity('monitors')
export class Monitor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'enum', enum: MonitorType, default: MonitorType.HTTPS })
  type: MonitorType;

  @Column({ length: 500 })
  url: string;

  @Column({ type: 'enum', enum: MonitorStatus, default: MonitorStatus.PENDING })
  status: MonitorStatus;

  @Column({ default: 60 })
  interval: number; // 检查间隔（秒）

  @Column({ default: 5000 })
  timeout: number; // 超时时间（毫秒）

  @Column({ default: 3 })
  retries: number; // 重试次数

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  expectedStatusCode: string; // 期望的HTTP状态码，如 "200,201"

  @Column({ type: 'text', nullable: true })
  keyword: string; // 页面关键字匹配

  @Column({ type: 'boolean', default: false })
  sslCheck: boolean; // 是否检查SSL证书

  @Column({ type: 'int', default: 7 })
  sslExpiryDays: number; // SSL证书过期提前告警天数

  @Column({ type: 'simple-json', nullable: true })
  headers: Record<string, string>; // 自定义HTTP头

  @Column({ type: 'text', nullable: true })
  body: string; // POST请求体

  @Column({ type: 'simple-json', nullable: true })
  lastCheckResult: {
    status: string;
    responseTime: number;
    timestamp: Date;
    message?: string;
  };

  @Column({ type: 'float', default: 0 })
  uptime24h: number; // 24小时可用率

  @Column({ type: 'float', default: 0 })
  uptime7d: number; // 7天可用率

  @Column({ type: 'float', default: 0 })
  uptime30d: number; // 30天可用率

  @Column({ type: 'timestamp', nullable: true })
  lastCheckedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastErrorAt: Date;

  @Column({ type: 'text', nullable: true })
  lastErrorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CheckResult, (result) => result.monitor, { cascade: true })
  checkResults: CheckResult[];

  @ManyToMany(() => AlertChannel, (channel) => channel.monitors)
  @JoinTable({
    name: 'monitor_alert_channels',
    joinColumn: { name: 'monitor_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'alert_channel_id', referencedColumnName: 'id' },
  })
  alertChannels: AlertChannel[];
}
