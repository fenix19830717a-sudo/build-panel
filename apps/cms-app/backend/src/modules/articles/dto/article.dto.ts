export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface CreateArticleDto {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status: ArticleStatus;
  categoryId?: string;
  tagIds?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  publishedAt?: Date;
}

export interface UpdateArticleDto {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  status?: ArticleStatus;
  categoryId?: string;
  tagIds?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  publishedAt?: Date;
}

export interface ArticleQueryDto {
  page?: number;
  limit?: number;
  categoryId?: string;
  tagId?: string;
  status?: ArticleStatus;
  search?: string;
  orderBy?: 'createdAt' | 'publishedAt' | 'views';
  order?: 'ASC' | 'DESC';
}
