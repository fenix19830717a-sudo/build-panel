import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertChannel, ChannelType } from '../../entities/alert-channel.entity';
import { CreateAlertChannelDto, UpdateAlertChannelDto } from './alert-channels.dto';
import axios from 'axios';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AlertChannelsService {
  private emailTransporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(AlertChannel)
    private alertChannelRepository: Repository<AlertChannel>,
  ) {
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

  async findAll(page = 1, limit = 20): Promise<{ data: AlertChannel[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.alertChannelRepository.findAndCount({
      relations: ['monitors'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<AlertChannel> {
    const channel = await this.alertChannelRepository.findOne({
      where: { id },
      relations: ['monitors'],
    });

    if (!channel) {
      throw new NotFoundException(`Alert channel with ID ${id} not found`);
    }

    return channel;
  }

  async create(createDto: CreateAlertChannelDto): Promise<AlertChannel> {
    const channel = this.alertChannelRepository.create(createDto);
    return this.alertChannelRepository.save(channel);
  }

  async update(id: string, updateDto: UpdateAlertChannelDto): Promise<AlertChannel> {
    const channel = await this.findOne(id);
    Object.assign(channel, updateDto);
    return this.alertChannelRepository.save(channel);
  }

  async remove(id: string): Promise<void> {
    const channel = await this.findOne(id);
    await this.alertChannelRepository.remove(channel);
  }

  async testChannel(id: string, message = 'Test message from SiteMonitor'): Promise<{ success: boolean; message: string }> {
    const channel = await this.findOne(id);

    try {
      switch (channel.type) {
        case ChannelType.EMAIL:
          await this.testEmail(channel, message);
          break;
        case ChannelType.WEBHOOK:
          await this.testWebhook(channel, message);
          break;
        case ChannelType.TELEGRAM:
          await this.testTelegram(channel, message);
          break;
        case ChannelType.DINGTALK:
          await this.testDingtalk(channel, message);
          break;
        case ChannelType.SLACK:
          await this.testSlack(channel, message);
          break;
        case ChannelType.DISCORD:
          await this.testDiscord(channel, message);
          break;
        default:
          return { success: false, message: `Unknown channel type: ${channel.type}` };
      }

      return { success: true, message: 'Test message sent successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  private async testEmail(channel: AlertChannel, message: string): Promise<void> {
    await this.emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@sitemonitor.com',
      to: channel.emailTo,
      subject: '[SiteMonitor] Test Message',
      html: `<h2>Test Message</h2><p>${message}</p>`,
    });
  }

  private async testWebhook(channel: AlertChannel, message: string): Promise<void> {
    const payload = channel.webhookBodyTemplate
      ? channel.webhookBodyTemplate.replace(/\{\{message\}\}/g, message)
      : { message, timestamp: new Date().toISOString() };

    await axios.post(channel.webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...channel.webhookHeaders,
      },
      timeout: 10000,
    });
  }

  private async testTelegram(channel: AlertChannel, message: string): Promise<void> {
    await axios.post(`https://api.telegram.org/bot${channel.telegramBotToken}/sendMessage`, {
      chat_id: channel.telegramChatId,
      text: `🧪 *Test Message*\n\n${message}`,
      parse_mode: 'Markdown',
    });
  }

  private async testDingtalk(channel: AlertChannel, message: string): Promise<void> {
    await axios.post(channel.dingtalkWebhook, {
      msgtype: 'text',
      text: { content: `[SiteMonitor] Test: ${message}` },
    }, { timeout: 10000 });
  }

  private async testSlack(channel: AlertChannel, message: string): Promise<void> {
    await axios.post(channel.slackWebhookUrl, {
      text: `[SiteMonitor] Test: ${message}`,
    }, { timeout: 10000 });
  }

  private async testDiscord(channel: AlertChannel, message: string): Promise<void> {
    await axios.post(channel.discordWebhookUrl, {
      content: `[SiteMonitor] Test: ${message}`,
    }, { timeout: 10000 });
  }
}
