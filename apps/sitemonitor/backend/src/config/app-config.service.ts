import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService) {}

  get databaseHost(): string {
    return this.configService.get('DB_HOST', 'localhost');
  }

  get databasePort(): number {
    return this.configService.get('DB_PORT', 5432);
  }

  get databaseName(): string {
    return this.configService.get('DB_NAME', 'sitemonitor');
  }

  get databaseUser(): string {
    return this.configService.get('DB_USER', 'postgres');
  }

  get databasePassword(): string {
    return this.configService.get('DB_PASSWORD', 'postgres');
  }

  get redisHost(): string {
    return this.configService.get('REDIS_HOST', 'localhost');
  }

  get redisPort(): number {
    return this.configService.get('REDIS_PORT', 6379);
  }

  get redisPassword(): string {
    return this.configService.get('REDIS_PASSWORD', '');
  }

  get appPort(): number {
    return this.configService.get('PORT', 3001);
  }

  get nodeEnv(): string {
    return this.configService.get('NODE_ENV', 'development');
  }

  get jwtSecret(): string {
    return this.configService.get('JWT_SECRET', 'your-secret-key');
  }

  // Email 配置
  get smtpHost(): string {
    return this.configService.get('SMTP_HOST', '');
  }

  get smtpPort(): number {
    return this.configService.get('SMTP_PORT', 587);
  }

  get smtpUser(): string {
    return this.configService.get('SMTP_USER', '');
  }

  get smtpPass(): string {
    return this.configService.get('SMTP_PASS', '');
  }

  get smtpFrom(): string {
    return this.configService.get('SMTP_FROM', 'noreply@sitemonitor.com');
  }

  // 监控配置
  get maxCheckResults(): number {
    return this.configService.get('MAX_CHECK_RESULTS', 10000);
  }

  get cleanupInterval(): number {
    return this.configService.get('CLEANUP_INTERVAL', 86400); // 24小时
  }
}
