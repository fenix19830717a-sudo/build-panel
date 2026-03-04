import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AlertRuleOperator {
  CONTAINS = 'contains',
  EQUALS = 'equals',
  REGEX = 'regex',
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
}

export enum AlertRuleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('alert_rules')
export class AlertRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  field: string;

  @Column({ type: 'enum', enum: AlertRuleOperator })
  operator: AlertRuleOperator;

  @Column({ type: 'text' })
  value: string;

  @Column({ type: 'enum', enum: AlertSeverity, default: AlertSeverity.MEDIUM })
  severity: AlertSeverity;

  @Column({ type: 'int', default: 1 })
  threshold: number;

  @Column({ type: 'int', default: 60 })
  timeWindow: number;

  @Column({ type: 'simple-json', nullable: true })
  notifications: {
    email?: string[];
    webhook?: string;
    slack?: string;
  };

  @Column({ type: 'enum', enum: AlertRuleStatus, default: AlertRuleStatus.ACTIVE })
  status: AlertRuleStatus;

  @Column({ type: 'int', default: 0 })
  alertCount: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastTriggeredAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
