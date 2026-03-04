import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Monitor } from './monitor.entity';

export enum ChannelType {
  EMAIL = 'email',
  WEBHOOK = 'webhook',
  TELEGRAM = 'telegram',
  DINGTALK = 'dingtalk',
  WEIXIN = 'weixin',
  SLACK = 'slack',
  DISCORD = 'discord',
}

@Entity('alert_channels')
export class AlertChannel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'enum', enum: ChannelType })
  type: ChannelType;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Email 配置
  @Column({ type: 'varchar', length: 255, nullable: true })
  emailTo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailCc: string;

  // Webhook 配置
  @Column({ type: 'text', nullable: true })
  webhookUrl: string;

  @Column({ type: 'simple-json', nullable: true })
  webhookHeaders: Record<string, string>;

  @Column({ type: 'text', nullable: true })
  webhookBodyTemplate: string;

  // Telegram 配置
  @Column({ type: 'varchar', length: 255, nullable: true })
  telegramBotToken: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  telegramChatId: string;

  // 钉钉配置
  @Column({ type: 'text', nullable: true })
  dingtalkWebhook: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  dingtalkSecret: string;

  // 微信配置
  @Column({ type: 'varchar', length: 255, nullable: true })
  weixinCorpId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  weixinAgentId: string;

  @Column({ type: 'text', nullable: true })
  weixinSecret: string;

  // Slack 配置
  @Column({ type: 'text', nullable: true })
  slackWebhookUrl: string;

  // Discord 配置
  @Column({ type: 'text', nullable: true })
  discordWebhookUrl: string;

  // 通用配置
  @Column({ type: 'simple-json', nullable: true })
  events: string[]; // 订阅的事件类型 ['down', 'up', 'ssl_expiring']

  @Column({ type: 'int', default: 0 })
  failureCount: number; // 连续失败次数

  @Column({ type: 'timestamp', nullable: true })
  lastFailureAt: Date;

  @Column({ type: 'text', nullable: true })
  lastErrorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Monitor, (monitor) => monitor.alertChannels)
  monitors: Monitor[];
}
