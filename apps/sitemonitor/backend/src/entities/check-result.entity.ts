import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Monitor } from './monitor.entity';

export enum CheckStatus {
  UP = 'up',
  DOWN = 'down',
}

@Entity('check_results')
export class CheckResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  monitorId: string;

  @Column({ type: 'enum', enum: CheckStatus })
  status: CheckStatus;

  @Column({ type: 'int' })
  responseTime: number; // 响应时间（毫秒）

  @Column({ type: 'int', nullable: true })
  statusCode: number; // HTTP状态码

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'text', nullable: true })
  responseBody: string;

  @Column({ type: 'simple-json', nullable: true })
  headers: Record<string, string>;

  @Column({ type: 'int', nullable: true })
  sslDaysRemaining: number; // SSL证书剩余天数

  @Column({ type: 'text', nullable: true })
  sslIssuer: string; // SSL证书颁发者

  @Column({ type: 'timestamp', nullable: true })
  sslExpiryDate: Date; // SSL证书过期时间

  @Column({ type: 'varchar', length: 100, nullable: true })
  dnsLookupTime: string; // DNS查询时间

  @Column({ type: 'varchar', length: 100, nullable: true })
  connectTime: string; // TCP连接时间

  @Column({ type: 'varchar', length: 100, nullable: true })
  tlsHandshakeTime: string; // TLS握手时间

  @Column({ type: 'varchar', length: 100, nullable: true })
  ttfb: string; // Time To First Byte

  @Column({ type: 'varchar', length: 50, nullable: true })
  location: string; // 检查节点位置

  @CreateDateColumn()
  checkedAt: Date;

  @ManyToOne(() => Monitor, (monitor) => monitor.checkResults, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'monitor_id' })
  monitor: Monitor;
}
