import { Link } from 'react-router-dom';
import { Clock, Eye, Tag as TagIcon } from 'lucide-react';
import type { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact';
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (variant === 'featured') {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="group relative block overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:shadow-xl"
      >
        {article.coverImage && (
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={article.coverImage}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-6">
          {article.category && (
            <span className="mb-2 inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
              {article.category.name}
            </span>
          )}
          <h2 className="mb-3 text-2xl font-bold text-gray-900 group-hover:text-primary-600">
            {article.title}
          </h2>
          <p className="mb-4 line-clamp-2 text-gray-600">
            {article.excerpt}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {formatDate(article.publishedAt || article.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {article.views}
            </span>
            {article.tags?.length > 0 && (
              <span className="flex items-center gap-1">
                <TagIcon size={14} />
                {article.tags.length}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="group flex gap-4 rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md"
      >
        {article.coverImage && (
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
            <img
              src={article.coverImage}
              alt={article.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="mb-1 font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600">
            {article.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatDate(article.publishedAt || article.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {article.views}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex flex-col rounded-xl bg-white shadow-sm transition-all hover:shadow-md overflow-hidden"
    >
      {article.coverImage && (
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      
      <div className="flex flex-1 flex-col p-5">
        {article.category && (
          <span className="mb-2 inline-flex w-fit rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
            {article.category.name}
          </span>
        )}
        
        <h3 className="mb-2 flex-1 font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600">
          {article.title}
        </h3>
        
        <p className="mb-4 line-clamp-2 text-sm text-gray-600">
          {article.excerpt}
        </p>
        
        <div className="mt-auto flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDate(article.publishedAt || article.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={12} />
            {article.views}
          </span>
        </div>
      </div>
    </Link>
  );
}
