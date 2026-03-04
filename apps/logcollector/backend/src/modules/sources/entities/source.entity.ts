import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum SourceType {
  SYSLOG = 'syslog',
  FILEBEAT = 'filebeat',
  FLUENTD = 'fluentd',
  HTTP = 'http',
  TCP = 'tcp',
  UDP = 'udp',
}

export enum SourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
}

@Entity('sources')
export class Source {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: SourceType })
  type: SourceType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  host: string;

  @Column({ type: 'int', nullable: true })
  port: number;

  @Column({ type: 'simple-json', nullable: true })
  config: Record<string, any>;

  @Column({ type: 'enum', enum: SourceStatus, default: SourceStatus.ACTIVE })
  status: SourceStatus;

  @Column({ type: 'bigint', default: 0 })
  logCount: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastReceivedAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
