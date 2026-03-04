import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Monitor, MonitorStatus } from '../../entities/monitor.entity';
import { CheckResult, CheckStatus } from '../../entities/check-result.entity';
import { CreateMonitorDto, UpdateMonitorDto } from './monitors.dto';
import axios, { AxiosError } from 'axios';
import * as https from 'https';
import * as dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

export interface CheckResultData {
  status: CheckStatus;
  responseTime: number;
  statusCode?: number;
  errorMessage?: string;
  responseBody?: string;
  headers?: Record<string, string>;
  sslDaysRemaining?: number;
  sslIssuer?: string;
  sslExpiryDate?: Date;
  dnsLookupTime?: string;
  connectTime?: string;
  tlsHandshakeTime?: string;
  ttfb?: string;
}

@Injectable()
export class MonitorsService {
  constructor(
    @InjectRepository(Monitor)
    private monitorRepository: Repository<Monitor>,
    @InjectRepository(CheckResult)
    private checkResultRepository: Repository<CheckResult>,
    @InjectQueue('monitor-checks')
    private monitorCheckQueue: Queue,
  ) {}

  async findAll(page = 1, limit = 20): Promise<{ data: Monitor[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.monitorRepository.findAndCount({
      relations: ['alertChannels'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Monitor> {
    const monitor = await this.monitorRepository.findOne({
      where: { id },
      relations: ['alertChannels'],
    });

    if (!monitor) {
      throw new NotFoundException(`Monitor with ID ${id} not found`);
    }

    return monitor;
  }

  async create(createMonitorDto: CreateMonitorDto): Promise<Monitor> {
    const monitor = this.monitorRepository.create(createMonitorDto);
    const saved = await this.monitorRepository.save(monitor);

    // 如果启用，添加到队列
    if (saved.isActive) {
      await this.scheduleCheck(saved);
    }

    return saved;
  }

  async update(id: string, updateMonitorDto: UpdateMonitorDto): Promise<Monitor> {
    const monitor = await this.findOne(id);
    
    Object.assign(monitor, updateMonitorDto);
    const updated = await this.monitorRepository.save(monitor);

    // 重新调度检查
    if (updated.isActive) {
      await this.scheduleCheck(updated);
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const monitor = await this.findOne(id);
    await this.monitorRepository.remove(monitor);
  }

  async getStatus(id: string): Promise<Partial<Monitor>> {
    const monitor = await this.findOne(id);
    
    return {
      id: monitor.id,
      status: monitor.status,
      uptime24h: monitor.uptime24h,
      uptime7d: monitor.uptime7d,
      uptime30d: monitor.uptime30d,
      lastCheckedAt: monitor.lastCheckedAt,
      lastCheckResult: monitor.lastCheckResult,
    };
  }

  async getHistory(id: string, hours = 24): Promise<CheckResult[]> {
    const monitor = await this.findOne(id);
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return this.checkResultRepository.find({
      where: {
        monitorId: monitor.id,
        checkedAt: LessThan(since),
      },
      order: { checkedAt: 'DESC' },
      take: 1000,
    });
  }

  async performCheck(monitorId: string): Promise<CheckResultData> {
    const monitor = await this.findOne(monitorId);
    return this.executeCheck(monitor);
  }

  async executeCheck(monitor: Monitor): Promise<CheckResultData> {
    const startTime = Date.now();
    const timings = {
      dnsLookup: 0,
      tcpConnection: 0,
      tlsHandshake: 0,
      ttfb: 0,
    };

    try {
      // DNS 查询时间
      const dnsStart = Date.now();
      try {
        const url = new URL(monitor.url);
        await dnsLookup(url.hostname);
        timings.dnsLookup = Date.now() - dnsStart;
      } catch (e) {
        // DNS lookup failed, continue
      }

      const axiosConfig: any = {
        method: monitor.body ? 'POST' : 'GET',
        url: monitor.url,
        timeout: monitor.timeout,
        headers: {
          'User-Agent': 'SiteMonitor/1.0',
          ...monitor.headers,
        },
        validateStatus: () => true, // 不抛出HTTP错误
        httpsAgent: new https.Agent({
          rejectUnauthorized: false, // 允许自签名证书
        }),
        timing: true,
      };

      if (monitor.body) {
        axiosConfig.data = monitor.body;
      }

      const response = await axios(axiosConfig);
      const responseTime = Date.now() - startTime;
      timings.ttfb = responseTime;

      const checkResult: CheckResultData = {
        status: CheckStatus.UP,
        responseTime,
        statusCode: response.status,
        responseBody: response.data?.toString().substring(0, 10000),
        headers: response.headers as Record<string, string>,
        dnsLookupTime: `${timings.dnsLookup}ms`,
        ttfb: `${timings.ttfb}ms`,
      };

      // 检查状态码
      if (monitor.expectedStatusCode) {
        const expectedCodes = monitor.expectedStatusCode.split(',').map(c => parseInt(c.trim()));
        if (!expectedCodes.includes(response.status)) {
          checkResult.status = CheckStatus.DOWN;
          checkResult.errorMessage = `Status code ${response.status} does not match expected: ${monitor.expectedStatusCode}`;
        }
      } else if (response.status >= 400) {
        checkResult.status = CheckStatus.DOWN;
        checkResult.errorMessage = `HTTP error ${response.status}`;
      }

      // 检查关键字
      if (monitor.keyword && checkResult.status === CheckStatus.UP) {
        const bodyText = response.data?.toString() || '';
        if (!bodyText.includes(monitor.keyword)) {
          checkResult.status = CheckStatus.DOWN;
          checkResult.errorMessage = `Keyword "${monitor.keyword}" not found in response`;
        }
      }

      // SSL 证书检查
      if (monitor.sslCheck && monitor.url.startsWith('https')) {
        try {
          const sslInfo = await this.checkSSLCertificate(monitor.url);
          checkResult.sslDaysRemaining = sslInfo.daysRemaining;
          checkResult.sslIssuer = sslInfo.issuer;
          checkResult.sslExpiryDate = sslInfo.expiryDate;
        } catch (e) {
          // SSL check failed but don't mark as down
        }
      }

      return checkResult;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const axiosError = error as AxiosError;
      
      return {
        status: CheckStatus.DOWN,
        responseTime,
        errorMessage: axiosError.message || 'Unknown error',
        dnsLookupTime: `${timings.dnsLookup}ms`,
      };
    }
  }

  private async checkSSLCertificate(url: string): Promise<{
    daysRemaining: number;
    issuer: string;
    expiryDate: Date;
  }> {
    const { default: sslChecker } = await import('ssl-checker');
    const hostname = new URL(url).hostname;
    const result = await sslChecker(hostname);
    
    return {
      daysRemaining: result.daysRemaining,
      issuer: result.issuer,
      expiryDate: new Date(result.validTo),
    };
  }

  async saveCheckResult(monitorId: string, result: CheckResultData): Promise<CheckResult> {
    const checkResult = this.checkResultRepository.create({
      monitorId,
      status: result.status,
      responseTime: result.responseTime,
      statusCode: result.statusCode,
      errorMessage: result.errorMessage,
      responseBody: result.responseBody,
      headers: result.headers,
      sslDaysRemaining: result.sslDaysRemaining,
      sslIssuer: result.sslIssuer,
      sslExpiryDate: result.sslExpiryDate,
      dnsLookupTime: result.dnsLookupTime,
      ttfb: result.ttfb,
      checkedAt: new Date(),
    });

    return this.checkResultRepository.save(checkResult);
  }

  async updateMonitorStatus(
    monitorId: string,
    status: MonitorStatus,
    checkResult: CheckResultData,
  ): Promise<void> {
    const monitor = await this.findOne(monitorId);
    
    monitor.status = status;
    monitor.lastCheckedAt = new Date();
    monitor.lastCheckResult = {
      status: checkResult.status,
      responseTime: checkResult.responseTime,
      timestamp: new Date(),
      message: checkResult.errorMessage,
    };

    if (status === MonitorStatus.DOWN) {
      monitor.lastErrorAt = new Date();
      monitor.lastErrorMessage = checkResult.errorMessage;
    }

    // 更新可用率统计
    await this.updateUptimeStats(monitor);

    await this.monitorRepository.save(monitor);
  }

  private async updateUptimeStats(monitor: Monitor): Promise<void> {
    const now = new Date();
    
    // 24小时可用率
    const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const results24h = await this.checkResultRepository.find({
      where: { monitorId: monitor.id, checkedAt: LessThan(since24h) },
    });
    
    if (results24h.length > 0) {
      const upCount = results24h.filter(r => r.status === CheckStatus.UP).length;
      monitor.uptime24h = parseFloat(((upCount / results24h.length) * 100).toFixed(2));
    }

    // 7天可用率
    const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const results7d = await this.checkResultRepository.find({
      where: { monitorId: monitor.id, checkedAt: LessThan(since7d) },
    });
    
    if (results7d.length > 0) {
      const upCount = results7d.filter(r => r.status === CheckStatus.UP).length;
      monitor.uptime7d = parseFloat(((upCount / results7d.length) * 100).toFixed(2));
    }

    // 30天可用率
    const since30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const results30d = await this.checkResultRepository.find({
      where: { monitorId: monitor.id, checkedAt: LessThan(since30d) },
    });
    
    if (results30d.length > 0) {
      const upCount = results30d.filter(r => r.status === CheckStatus.UP).length;
      monitor.uptime30d = parseFloat(((upCount / results30d.length) * 100).toFixed(2));
    }
  }

  private async scheduleCheck(monitor: Monitor): Promise<void> {
    // 添加任务到Bull队列
    await this.monitorCheckQueue.add(
      'check',
      { monitorId: monitor.id },
      {
        repeat: {
          every: monitor.interval * 1000,
        },
        jobId: `monitor-${monitor.id}`,
        removeOnComplete: 10,
        removeOnFail: 10,
      },
    );
  }

  async getActiveMonitors(): Promise<Monitor[]> {
    return this.monitorRepository.find({
      where: { isActive: true },
      relations: ['alertChannels'],
    });
  }
}
