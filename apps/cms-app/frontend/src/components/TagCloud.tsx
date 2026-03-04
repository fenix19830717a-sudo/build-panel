import { Link } from 'react-router-dom';
import { Tag as TagIcon } from 'lucide-react';
import type { Tag } from '../types';

interface TagCloudProps {
  tags: Tag[];
}

export function TagCloud({ tags }: TagCloudProps) {
  const getTagSize = (count: number, maxCount: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.8) return 'text-lg px-4 py-2';
    if (ratio > 0.6) return 'text-base px-3.5 py-1.5';
    if (ratio > 0.4) return 'text-sm px-3 py-1';
    return 'text-xs px-2.5 py-1';
  };

  const maxCount = Math.max(...tags.map(t => t.articleCount), 1);

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          to={`/tag/${tag.slug}`}
          className={`inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 transition-all hover:bg-primary-100 hover:text-primary-700 ${getTagSize(tag.articleCount, maxCount)}`}
        >
          <TagIcon size={14} />
          <span>{tag.name}</span>
          <span className="text-gray-400">({tag.articleCount})</span>
        </Link>
      ))}
    </div>
  );
}

interface TagListProps {
  tags: { id: string; slug: string; name: string }[];
  size?: 'sm' | 'md';
}

export function TagList({ tags, size = 'md' }: TagListProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          to={`/tag/${tag.slug}`}
          className={`inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600 ${sizeClasses[size]}`}
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
