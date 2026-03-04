import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: '分类名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '分类别名' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ description: '分类描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '分类图片' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ description: '父分类ID' })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ description: '是否激活' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCategoryDto extends CreateCategoryDto {}
