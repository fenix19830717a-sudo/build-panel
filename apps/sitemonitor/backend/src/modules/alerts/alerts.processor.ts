import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Alert, AlertStatus } from '../../entities/alert.entity';
import { AlertChannel, ChannelType } from '../../entities/alert-channel.entity';
import { Monitor } from '../../entities/monitor.entity';
import axios from 'axios';
import * as nodemailer from 'nodemailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

interface NotificationJob {
  alert: Alert;
  channel: AlertChannel;
  monitor: Monitor;
}

@Processor('alert-notifications')
export class AlertNotificationProcessor {
  private readonly logger = new Logger(AlertNotificationProcessor.name);
  private emailTransporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(AlertChannel)
    private alertChannelRepository: Repository<AlertChannel>,
  ) {
    // 初始化邮件发送器
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  @Process('send')
  async handleNotification(job: Job<NotificationJob>) {
    const { alert, channel, monitor } = job.data;

    this.logger.debug(`Sending notification via ${channel.type} for alert ${alert.id}`);

    try {
      switch (channel.type) {
        case ChannelType.EMAIL:
          await this.sendEmail(alert, channel, monitor);
          break;
        case ChannelType.WEBHOOK:
          await this.sendWebhook(alert, channel, monitor);
          break;
        case ChannelType.TELEGRAM:
          await this.sendTelegram(alert, channel, monitor);
          break;
        case ChannelType.DINGTALK:
          await this.sendDingtalk(alert, channel, monitor);
          break;
        case ChannelType.SLACK:
          await this.sendSlack(alert, channel, monitor);
          break;
        case ChannelType.DISCORD:
          await this.sendDiscord(alert, channel, monitor);
          break;
        default:
          this.logger.warn(`Unknown channel type: ${channel.type}`);
      }

      // 更新渠道状态
      await this.updateChannelStatus(channel, true);
    } catch (error) {
      this.logger.error(`Failed to send notification via ${channel.type}:`, error);
      await this.updateChannelStatus(channel, false, error.message);
      throw error;
    }
  }

  private async sendEmail(alert: Alert, channel: AlertChannel, monitor: Monitor): Promise<void> {
    if (!channel.emailTo) {
      throw new Error('Email recipient not configured');
    }

    const subject = `[SiteMonitor] ${alert.severity.toUpperCase()}: ${alert.message}`;
    const html = `
      <h2>SiteMonitor Alert</h2>
      <p><strong>Monitor:</strong> ${monitor.name}</p>
      <p><strong>Type:</strong> ${alert.type}</p>
      <p><strong>Severity:</strong> ${alert.severity}</p>
      <p><strong>Message:</strong> ${alert.message}</p>
      <p><strong>Details:</strong> ${alert.details || 'N/A'}</p>
      <p><strong>Time:</strong> ${alert.createdAt.toISOString()}</p>
      <hr/>
      <p><a href="${monitor.url}">View Monitor</a></p>
    `;

    await this.emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@sitemonitor.com',
      to: channel.emailTo,
      cc: channel.emailCc,
      subject,
      html,
    });

    this.logger.debug(`Email sent to ${channel.emailTo}`);
  }

  private async sendWebhook(alert: Alert, channel: AlertChannel, monitor: Monitor): Promise<void> {
    if (!channel.webhookUrl) {
      throw new Error('Webhook URL not configured');
    }

    const payload = channel.webhookBodyTemplate
      ? this.interpolateTemplate(channel.webhookBodyTemplate, { alert, monitor })
      : {
          monitor: {
            id: monitor.id,
            name: monitor.name,
            url: monitor.url,
            status: monitor.status,
          },
          alert: {
            id: alert.id,
            type: alert.type,
            severity: alert.severity,
            message: alert.message,
            details: alert.details,
            createdAt: alert.createdAt,
          },
        };

    await axios.post(channel.webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...channel.webhookHeaders,
      },
      timeout: 10000,
    });

    this.logger.debug(`Webhook sent to ${channel.webhookUrl}`);
  }

  private async sendTelegram(alert: Alert, channel: AlertChannel, monitor: Monitor): Promise<void> {
    if (!channel.telegramBotToken || !channel.telegramChatId) {
      throw new Error('Telegram configuration incomplete');
    }

    const emoji = alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '🟡' : '🟢';
    const text = `
${emoji} *SiteMonitor Alert*

*Monitor:* ${monitor.name}
*Status:* ${monitor.status}
*Type:* ${alert.type}
*Severity:* ${alert.severity}

*Message:*
${alert.message}

*Details:*
${alert.details || 'N/A'}

*URL:* ${monitor.url}
    `;

    await axios.post(`https://api.telegram.org/bot${channel.telegramBotToken}/sendMessage`, {
      chat_id: channel.telegramChatId,
      text,
      parse_mode: 'Markdown',
    });

    this.logger.debug(`Telegram message sent to ${channel.telegramChatId}`);
  }

  private async sendDingtalk(alert: Alert, channel: AlertChannel, monitor: Monitor): Promise<void> {
    if (!channel.dingtalkWebhook) {
      throw new Error('DingTalk webhook not configured');
    }

    const payload = {
      msgtype: 'markdown',
      markdown: {
        title: 'SiteMonitor Alert',
        text: `## SiteMonitor 告警

**监控:** ${monitor.name}  
**状态:** ${monitor.status}  
**类型:** ${alert.type}  
**级别:** ${alert.severity}  

**消息:**
${alert.message}

**详情:**
${alert.details || 'N/A'}

**URL:** [点击查看](${monitor.url})
        `,
      },
    };

    await axios.post(channel.dingtalkWebhook, payload, {
      timeout: 10000,
    });

    this.logger.debug(`DingTalk message sent`);
  }

  private async sendSlack(alert: Alert, channel: AlertChannel, monitor: Monitor): Promise<void> {
    if (!channel.slackWebhookUrl) {
      throw new Error('Slack webhook not configured');
    }

    const color = alert.severity === 'critical' ? '#FF0000' : alert.severity === 'warning' ? '#FFCC00' : '#00FF00';

    const payload = {
      attachments: [
        {
          color,
          title: 'SiteMonitor Alert',
          fields: [
            { title: 'Monitor', value: monitor.name, short: true },
            { title: 'Status', value: monitor.status, short: true },
            { title: 'Type', value: alert.type, short: true },
            { title: 'Severity', value: alert.severity, short: true },
            { title: 'Message', value: alert.message, short: false },
            { title: 'URL', value: monitor.url, short: false },
          ],
          footer: 'SiteMonitor',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await axios.post(channel.slackWebhookUrl, payload, { timeout: 10000 });

    this.logger.debug(`Slack message sent`);
  }

  private async sendDiscord(alert: Alert, channel: AlertChannel, monitor: Monitor): Promise<void> {
    if (!channel.discordWebhookUrl) {
      throw new Error('Discord webhook not configured');
    }

    const color = alert.severity === 'critical' ? 0xFF0000 : alert.severity === 'warning' ? 0xFFCC00 : 0x00FF00;

    const payload = {
      embeds: [
        {
          title: '🔔 SiteMonitor Alert',
          color,
          fields: [
            { name: 'Monitor', value: monitor.name, inline: true },
            { name: 'Status', value: monitor.status, inline: true },
            { name: 'Type', value: alert.type, inline: true },
            { name: 'Severity', value: alert.severity, inline: true },
            { name: 'Message', value: alert.message, inline: false },
            { name: 'Details', value: alert.details || 'N/A', inline: false },
            { name: 'URL', value: monitor.url, inline: false },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await axios.post(channel.discordWebhookUrl, payload, { timeout: 10000 });

    this.logger.debug(`Discord message sent`);
  }

  private interpolateTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const keys = key.split('.');
      let value = variables;
      for (const k of keys) {
        value = value?.[k];
      }
      return value !== undefined ? String(value) : match;
    });
  }

  private async updateChannelStatus(channel: AlertChannel, success: boolean, error?: string): Promise<void> {
    if (success) {
      channel.failureCount = 0;
      channel.lastErrorMessage = null;
    } else {
      channel.failureCount++;
      channel.lastFailureAt = new Date();
      channel.lastErrorMessage = error;
    }

    await this.alertChannelRepository.save(channel);
  }
}
