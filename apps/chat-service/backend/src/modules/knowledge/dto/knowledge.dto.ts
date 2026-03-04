import { IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';
export class CreateCategoryDto {
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  description?: string;
}
export class CreateArticleDto {
  @IsString()
  title: string;
  @IsString()
  content: string;
  @IsUUID()
  categoryId: string;
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
export class SearchKnowledgeDto {
  @IsString()
  query: string;
}
