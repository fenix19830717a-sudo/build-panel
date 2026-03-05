import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TenantStatus, TenantPlan } from '../entities/tenant.entity';

export class CreateTenantDto {
  @ApiProperty({ description: '租户标识' })
  @IsString()
  slug: string;

  @ApiProperty({ description: '租户名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({ description: 'Favicon URL' })
  @IsString()
  @IsOptional()
  favicon?: string;

  @ApiPropertyOptional({ description: '计划', enum: TenantPlan, default: TenantPlan.FREE })
  @IsEnum(TenantPlan)
  @IsOptional()
  plan?: TenantPlan;

  @ApiPropertyOptional({ description: '设置' })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @ApiPropertyOptional({ description: '联系信息' })
  @IsObject()
  @IsOptional()
  contactInfo?: Record<string, any>;
}

export class UpdateTenantDto {
  @ApiPropertyOptional({ description: '租户标识' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ description: '租户名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({ description: 'Favicon URL' })
  @IsString()
  @IsOptional()
  favicon?: string;

  @ApiPropertyOptional({ description: '计划', enum: TenantPlan })
  @IsEnum(TenantPlan)
  @IsOptional()
  plan?: TenantPlan;

  @ApiPropertyOptional({ description: '设置' })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @ApiPropertyOptional({ description: '联系信息' })
  @IsObject()
  @IsOptional()
  contactInfo?: Record<string, any>;
}

export class TenantQueryDto {
  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: '状态', enum: TenantStatus })
  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  @ApiPropertyOptional({ description: '计划', enum: TenantPlan })
  @IsEnum(TenantPlan)
  @IsOptional()
  plan?: TenantPlan;
}
