import { PartialType } from '@nestjs/swagger';

export class CreateCategoryDto {
  name: string;
  description?: string;
  coverImage?: string;
  parentId?: string;
  metaTitle?: string;
  metaDescription?: string;
  sortOrder?: number;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
