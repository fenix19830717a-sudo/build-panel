import { 
  IsString, 
  IsOptional, 
  IsObject, 
  IsEnum, 
  IsBoolean,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PageStatus } from '../../database/entities/page.entity';

export class CreatePageDto {
  @ApiProperty({ description: '页面标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '页面slug' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: '页面内容' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: '页面区块' })
  @IsObject()
  @IsOptional()
  blocks?: any[];

  @ApiPropertyOptional({ description: '页面状态', enum: PageStatus })
  @IsEnum(PageStatus)
  @IsOptional()
  status?: PageStatus;

  @ApiPropertyOptional({ description: '是否为首页', default: false })
  @IsBoolean()
  @IsOptional()
  is_homepage?: boolean;

  @ApiPropertyOptional({ description: '是否在导航显示', default: true })
  @IsBoolean()
  @IsOptional()
  show_in_nav?: boolean;

  @ApiPropertyOptional({ description: '导航标签' })
  @IsString()
  @IsOptional()
  nav_label?: string;

  @ApiPropertyOptional({ description: '导航排序', default: 0 })
  @IsInt()
  @IsOptional()
  nav_order?: number;

  @ApiPropertyOptional({ description: 'SEO设置' })
  @IsObject()
  @IsOptional()
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    og_image?: string;
  };

  @ApiPropertyOptional({ description: '自定义CSS' })
  @IsString()
  @IsOptional()
  custom_css?: string;

  @ApiPropertyOptional({ description: '自定义JS' })
  @IsString()
  @IsOptional()
  custom_js?: string;

  tenantId?: string;
}

export class UpdatePageDto {
  @ApiPropertyOptional({ description: '页面标题' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: '页面内容' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: '页面区块' })
  @IsObject()
  @IsOptional()
  blocks?: any[];

  @ApiPropertyOptional({ description: '页面状态', enum: PageStatus })
  @IsEnum(PageStatus)
  @IsOptional()
  status?: PageStatus;

  @ApiPropertyOptional({ description: 'SEO设置' })
  @IsObject()
  @IsOptional()
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    og_image?: string;
  };

  @ApiPropertyOptional({ description: '自定义CSS' })
  @IsString()
  @IsOptional()
  custom_css?: string;

  @ApiPropertyOptional({ description: '自定义JS' })
  @IsString()
  @IsOptional()
  custom_js?: string;
}
