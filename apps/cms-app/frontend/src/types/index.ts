export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  category: Category | null;
  categoryId: string;
  tags: Tag[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  coverImage: string;
  sortOrder: number;
  parent: Category | null;
  parentId: string;
  children: Category[];
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
  description: string;
  articleCount: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ArticleQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  tagId?: string;
  search?: string;
  orderBy?: 'createdAt' | 'publishedAt' | 'views';
  order?: 'ASC' | 'DESC';
}
