import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid3X3, List } from 'lucide-react';
import { articlesApi, categoriesApi } from '../services/api';
import { ArticleCard } from '../components/ArticleCard';
import type { Article, Category } from '../types';

export function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 12;
  const categoryId = searchParams.get('category') || undefined;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.getAll();
        setCategories(res.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await articlesApi.getAll({
          page,
          limit,
          categoryId,
          status: 'published',
        });
        setArticles(res.data.items);
        setTotal(res.data.total);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [page, categoryId]);

  const totalPages = Math.ceil(total / limit);

  const handleCategoryChange = (catId: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (catId) {
      newParams.set('category', catId);
    } else {
      newParams.delete('category');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">文章列表</h1>
          <p className="text-gray-500 mt-1">共 {total} 篇文章</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-primary-100 text-primary-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Grid3X3 size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-100 text-primary-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter size={18} className="text-gray-400 flex-shrink-0" />
        <button
          onClick={() => handleCategoryChange(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            !categoryId
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              categoryId === cat.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Articles Grid/List */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }
      >
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            variant={viewMode === 'list' ? 'compact' : 'default'}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <button
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set('page', String(page - 1));
              setSearchParams(newParams);
            }}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            上一页
          </button>
          <span className="text-sm text-gray-600">
            第 {page} 页，共 {totalPages} 页
          </span>
          <button
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set('page', String(page + 1));
              setSearchParams(newParams);
            }}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
