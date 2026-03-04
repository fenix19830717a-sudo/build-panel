import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContentDto {
  @ApiProperty({ description: '内容键名' })
  @IsString()
  key: string;

  @ApiProperty({ description: '内容值' })
  @IsObject()
  value: any;

  @ApiPropertyOptional({ description: '语言', default: 'zh-CN' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ description: '内容区块' })
  @IsString()
  @IsOptional()
  section?: string;

  tenantId?: string;
}

export class UpdateContentDto {
  @ApiPropertyOptional({ description: '内容值' })
  @IsObject()
  @IsOptional()
  value?: any;

  @ApiPropertyOptional({ description: '语言' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ description: '内容区块' })
  @IsString()
  @IsOptional()
  section?: string;
}

export class GetContentQueryDto {
  @ApiPropertyOptional({ description: '内容键名' })
  @IsString()
  @IsOptional()
  key?: string;

  @ApiPropertyOptional({ description: '语言' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ description: '内容区块' })
  @IsString()
  @IsOptional()
  section?: string;

  tenantId?: string;
}
