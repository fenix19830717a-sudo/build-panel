import { IsString, IsEnum, IsInt, IsBoolean, IsOptional, IsJSON, Min, Max, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MonitorType, MonitorStatus } from '../../entities/monitor.entity';

export class CreateMonitorDto {
  @ApiProperty({ description: '监控名称', example: 'Google Homepage' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ description: '监控类型', enum: MonitorType, example: MonitorType.HTTPS })
  @IsEnum(MonitorType)
  type: MonitorType;

  @ApiProperty({ description: '监控URL', example: 'https://www.google.com' })
  @IsString()
  @Length(1, 500)
  url: string;

  @ApiPropertyOptional({ description: '检查间隔（秒）', default: 60, minimum: 30, maximum: 86400 })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(86400)
  interval?: number = 60;

  @ApiPropertyOptional({ description: '超时时间（毫秒）', default: 5000, minimum: 1000, maximum: 60000 })
  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(60000)
  timeout?: number = 5000;

  @ApiPropertyOptional({ description: '重试次数', default: 3, minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  retries?: number = 3;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: '期望的HTTP状态码（逗号分隔）', example: '200,201' })
  @IsOptional()
  @IsString()
  expectedStatusCode?: string;

  @ApiPropertyOptional({ description: '页面关键字匹配' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '是否检查SSL证书', default: false })
  @IsOptional()
  @IsBoolean()
  sslCheck?: boolean = false;

  @ApiPropertyOptional({ description: 'SSL证书过期提前告警天数', default: 7 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  sslExpiryDays?: number = 7;

  @ApiPropertyOptional({ description: '自定义HTTP头', example: { 'User-Agent': 'SiteMonitor/1.0' } })
  @IsOptional()
  headers?: Record<string, string>;

  @ApiPropertyOptional({ description: 'POST请求体' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ description: '关联的告警渠道ID列表' })
  @IsOptional()
  alertChannelIds?: string[];
}

export class UpdateMonitorDto extends CreateMonitorDto {}

export class MonitorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: MonitorType })
  type: MonitorType;

  @ApiProperty()
  url: string;

  @ApiProperty({ enum: MonitorStatus })
  status: MonitorStatus;

  @ApiProperty()
  interval: number;

  @ApiProperty()
  timeout: number;

  @ApiProperty()
  retries: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  expectedStatusCode: string;

  @ApiProperty()
  keyword: string;

  @ApiProperty()
  sslCheck: boolean;

  @ApiProperty()
  sslExpiryDays: number;

  @ApiProperty()
  uptime24h: number;

  @ApiProperty()
  uptime7d: number;

  @ApiProperty()
  uptime30d: number;

  @ApiProperty()
  lastCheckedAt: Date;

  @ApiProperty()
  lastErrorAt: Date;

  @ApiProperty()
  lastErrorMessage: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class MonitorListResponseDto {
  @ApiProperty({ type: [MonitorResponseDto] })
  data: MonitorResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class MonitorStatusResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: MonitorStatus })
  status: MonitorStatus;

  @ApiProperty()
  uptime24h: number;

  @ApiProperty()
  uptime7d: number;

  @ApiProperty()
  uptime30d: number;

  @ApiProperty()
  lastCheckedAt: Date;

  @ApiProperty()
  lastCheckResult: {
    status: string;
    responseTime: number;
    timestamp: Date;
    message?: string;
  };
}

export class QuickCheckDto {
  @ApiProperty({ description: '监控ID' })
  @IsString()
  monitorId: string;
}

export class QuickCheckResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data?: {
    status: string;
    responseTime: number;
    statusCode?: number;
    errorMessage?: string;
  };
}
