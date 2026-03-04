import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateProductDescriptionDto {
  @ApiProperty({ description: '产品名称' })
  @IsString()
  productName: string;

  @ApiPropertyOptional({ description: '产品特点', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({ description: '目标受众' })
  @IsString()
  @IsOptional()
  targetAudience?: string;

  @ApiPropertyOptional({ description: '品牌调性', default: 'professional' })
  @IsString()
  @IsOptional()
  tone?: string;
}

export class TranslateProductDto {
  @ApiProperty({ description: '原文内容' })
  @IsString()
  content: string;

  @ApiProperty({ description: '目标语言', example: 'zh-CN' })
  @IsString()
  targetLanguage: string;

  @ApiPropertyOptional({ description: '源语言', example: 'en' })
  @IsString()
  @IsOptional()
  sourceLanguage?: string;
}

export class GetRecommendationsDto {
  @ApiProperty({ description: '产品ID' })
  @IsString()
  productId: string;

  @ApiPropertyOptional({ description: '推荐数量', default: 4 })
  @IsNumber()
  @IsOptional()
  limit?: number = 4;
}

export class ChatMessageDto {
  @ApiProperty({ description: '用户消息' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: '会话ID' })
  @IsString()
  @IsOptional()
  sessionId?: string;
}

export class AIResponseDto {
  @ApiProperty({ description: 'AI生成的内容' })
  content: string;

  @ApiPropertyOptional({ description: '会话ID' })
  sessionId?: string;
}
