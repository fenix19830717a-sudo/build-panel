import { IsString, IsOptional, IsEnum, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ThemeStatus } from '../entities/theme.entity';

export class CreateThemeDto {
  @ApiProperty({ description: '主题名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '主题标识' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '状态', enum: ThemeStatus, default: ThemeStatus.DRAFT })
  @IsEnum(ThemeStatus)
  @IsOptional()
  status?: ThemeStatus;

  @ApiPropertyOptional({ description: '是否默认主题' })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({ description: '主题配置' })
  @IsObject()
  config: Record<string, any>;

  @ApiPropertyOptional({ description: '自定义CSS' })
  @IsString()
  @IsOptional()
  customCss?: string;

  @ApiPropertyOptional({ description: '预览图' })
  @IsString()
  @IsOptional()
  previewImage?: string;
}

export class UpdateThemeDto extends CreateThemeDto {}

export class ApplyThemeDto {
  @ApiProperty({ description: '主题ID' })
  @IsString()
  themeId: string;
}

export class ThemePreviewDto {
  @ApiProperty({ description: '主题配置' })
  @IsObject()
  config: Record<string, any>;
}
