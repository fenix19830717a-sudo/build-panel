import { 
  IsString, 
  IsOptional, 
  IsObject, 
  IsNumber, 
  IsEnum, 
  IsUUID,
  IsArray,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../../database/entities/product.entity';

export class CreateProductDto {
  @ApiProperty({ description: '产品名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '产品描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '简短描述' })
  @IsString()
  @IsOptional()
  short_description?: string;

  @ApiPropertyOptional({ description: '价格' })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: '对比价格' })
  @IsNumber()
  @IsOptional()
  compare_price?: number;

  @ApiPropertyOptional({ description: '库存' })
  @IsInt()
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ description: 'SKU' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ description: '产品图片' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ description: '分类ID' })
  @IsUUID()
  @IsOptional()
  category_id?: string;

  @ApiPropertyOptional({ description: '标签ID列表' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tag_ids?: string[];

  @ApiPropertyOptional({ description: '产品状态', enum: ProductStatus })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiPropertyOptional({ description: 'SEO设置' })
  @IsObject()
  @IsOptional()
  seo?: { title?: string; description?: string; keywords?: string[] };

  @ApiPropertyOptional({ description: '产品属性' })
  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;

  tenantId?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ description: '产品名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '产品描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '简短描述' })
  @IsString()
  @IsOptional()
  short_description?: string;

  @ApiPropertyOptional({ description: '价格' })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: '库存' })
  @IsInt()
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ description: '产品状态', enum: ProductStatus })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiPropertyOptional({ description: '产品图片' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ description: 'SEO设置' })
  @IsObject()
  @IsOptional()
  seo?: { title?: string; description?: string; keywords?: string[] };
}

export class ProductQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsInt()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsInt()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: '状态' })
  @IsString()
  @IsOptional()
  status?: string;

  tenantId?: string;
}
