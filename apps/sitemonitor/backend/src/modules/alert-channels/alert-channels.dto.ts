import { IsString, IsEnum, IsBoolean, IsOptional, IsJSON, Length, IsUrl, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChannelType } from '../../entities/alert-channel.entity';

export class CreateAlertChannelDto {
  @ApiProperty({ description: '渠道名称', example: 'Email Notifications' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: '渠道类型', enum: ChannelType, example: ChannelType.EMAIL })
  @IsEnum(ChannelType)
  type: ChannelType;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  // Email 配置
  @ApiPropertyOptional({ description: '收件人邮箱（逗号分隔）', example: 'admin@example.com,ops@example.com' })
  @IsOptional()
  @IsString()
  emailTo?: string;

  @ApiPropertyOptional({ description: '抄送邮箱（逗号分隔）' })
  @IsOptional()
  @IsString()
  emailCc?: string;

  // Webhook 配置
  @ApiPropertyOptional({ description: 'Webhook URL' })
  @IsOptional()
  @IsUrl()
  webhookUrl?: string;

  @ApiPropertyOptional({ description: '自定义请求头', example: { 'X-Custom': 'value' } })
  @IsOptional()
  webhookHeaders?: Record<string, string>;

  @ApiPropertyOptional({ description: '自定义请求体模板' })
  @IsOptional()
  @IsString()
  webhookBodyTemplate?: string;

  // Telegram 配置
  @ApiPropertyOptional({ description: 'Telegram Bot Token' })
  @IsOptional()
  @IsString()
  telegramBotToken?: string;

  @ApiPropertyOptional({ description: 'Telegram Chat ID' })
  @IsOptional()
  @IsString()
  telegramChatId?: string;

  // 钉钉配置
  @ApiPropertyOptional({ description: '钉钉 Webhook URL' })
  @IsOptional()
  @IsUrl()
  dingtalkWebhook?: string;

  @ApiPropertyOptional({ description: '钉钉 Secret' })
  @IsOptional()
  @IsString()
  dingtalkSecret?: string;

  // Slack 配置
  @ApiPropertyOptional({ description: 'Slack Webhook URL' })
  @IsOptional()
  @IsUrl()
  slackWebhookUrl?: string;

  // Discord 配置
  @ApiPropertyOptional({ description: 'Discord Webhook URL' })
  @IsOptional()
  @IsUrl()
  discordWebhookUrl?: string;

  @ApiPropertyOptional({ description: '订阅的事件类型', example: ['down', 'up', 'ssl_expiring'] })
  @IsOptional()
  events?: string[];
}

export class UpdateAlertChannelDto extends CreateAlertChannelDto {}

export class TestChannelDto {
  @ApiProperty({ description: '测试消息内容', example: 'This is a test message' })
  @IsOptional()
  @IsString()
  message?: string = 'Test message from SiteMonitor';
}
