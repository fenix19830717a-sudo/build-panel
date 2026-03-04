import { IsString, IsOptional, IsObject, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TenantStatus } from '../../database/entities/tenant.entity';

export class CreateTenantDto {
  @ApiProperty({ description: '租户名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '子域名' })
  @IsString()
  @IsOptional()
  subdomain?: string;

  @ApiPropertyOptional({ description: '自定义域名' })
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiPropertyOptional({ description: '主题ID' })
  @IsUUID()
  @IsOptional()
  theme_id?: string;

  @ApiPropertyOptional({ description: '站点配置' })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @ApiPropertyOptional({ description: '套餐类型', default: 'basic' })
  @IsString()
  @IsOptional()
  plan?: string;
}

export class UpdateTenantDto {
  @ApiPropertyOptional({ description: '租户名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '子域名' })
  @IsString()
  @IsOptional()
  subdomain?: string;

  @ApiPropertyOptional({ description: '自定义域名' })
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiPropertyOptional({ description: '主题ID' })
  @IsUUID()
  @IsOptional()
  theme_id?: string;

  @ApiPropertyOptional({ description: '站点配置' })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @ApiPropertyOptional({ description: '租户状态', enum: TenantStatus })
  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;
}

export class DeployTenantDto {
  @ApiPropertyOptional({ description: '服务器IP' })
  @IsString()
  @IsOptional()
  server_ip?: string;

  @ApiPropertyOptional({ description: '是否启用SSL', default: true })
  @IsOptional()
  ssl_enabled?: boolean;

  @ApiPropertyOptional({ description: '自定义域名' })
  @IsString()
  @IsOptional()
  custom_domain?: string;
}
