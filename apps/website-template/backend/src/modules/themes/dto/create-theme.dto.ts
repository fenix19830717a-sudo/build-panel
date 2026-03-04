import { IsString, IsOptional, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateThemeDto {
  @ApiProperty({ description: '主题名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '显示名称' })
  @IsString()
  display_name: string;

  @ApiPropertyOptional({ description: '主题描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '预览图片URL' })
  @IsString()
  @IsOptional()
  preview_image?: string;

  @ApiPropertyOptional({ description: '主题配置' })
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({ description: '主题分类', default: 'default' })
  @IsString()
  @IsOptional()
  category?: string;
}
