import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: '产品名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '产品描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '产品价格' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: '对比价格' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({ description: '库存数量' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: 'SKU' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: '产品图片', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ description: '是否上架' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '产品属性' })
  @IsOptional()
  attributes?: Record<string, any>;
}

export class UpdateProductDto extends CreateProductDto {}

export class ProductQueryDto {
  @ApiPropertyOptional({ description: '分页 - 页码', default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: '分页 - 每页数量', default: 10 })
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: '最低价格' })
  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({ description: '最高价格' })
  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({ description: '排序字段', enum: ['createdAt', 'price', 'name', 'viewCount'] })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: '排序方向', enum: ['ASC', 'DESC'] })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
