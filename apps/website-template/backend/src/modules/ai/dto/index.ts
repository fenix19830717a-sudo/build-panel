import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateContentDto {
  @ApiProperty({ description: '内容类型' })
  @IsString()
  type: string;

  @ApiProperty({ description: '行业' })
  @IsString()
  industry: string;

  @ApiPropertyOptional({ description: '关键词' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];

  @ApiPropertyOptional({ description: '语言', default: 'zh-CN' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ description: '上下文信息' })
  @IsString()
  @IsOptional()
  context?: string;
}

export class GenerateProductDescriptionDto {
  @ApiProperty({ description: '产品名称' })
  @IsString()
  product_name: string;

  @ApiPropertyOptional({ description: '产品特性' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({ description: '风格', default: 'professional' })
  @IsString()
  @IsOptional()
  tone?: string;

  @ApiPropertyOptional({ description: '语言', default: 'zh-CN' })
  @IsString()
  @IsOptional()
  language?: string;
}

export class TranslateDto {
  @ApiProperty({ description: '要翻译的内容' })
  @IsString()
  content: string;

  @ApiProperty({ description: '目标语言' })
  @IsString()
  target_language: string;

  @ApiPropertyOptional({ description: '上下文' })
  @IsString()
  @IsOptional()
  context?: string;
}

export class OptimizeSeoDto {
  @ApiPropertyOptional({ description: '标题' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '关键词' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];

  @ApiPropertyOptional({ description: '内容' })
  @IsString()
  @IsOptional()
  content?: string;
}

export class GenerateImageDto {
  @ApiProperty({ description: '提示词' })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({ description: '尺寸', default: '1024x1024' })
  @IsString()
  @IsOptional()
  size?: string;

  @ApiPropertyOptional({ description: '风格' })
  @IsString()
  @IsOptional()
  style?: string;
}
