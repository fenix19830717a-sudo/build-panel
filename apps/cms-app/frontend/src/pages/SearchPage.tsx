import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { searchApi } from '../services/api';
import { ArticleCard } from '../components/ArticleCard';
import type { Article } from '../types';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setArticles([]);
        setTotal(0);
        return;
      }

      setLoading(true);
      try {
        const res = await searchApi.search(query);
        setArticles(res.data.items);
        setTotal(res.data.total);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">搜索文章</h1>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="输入关键词搜索..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-white py-4 pl-14 pr-12 text-lg shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} className="text-gray-400" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Results */}
      {query ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {loading ? '搜索中...' : `找到 ${total} 个结果`}
            </h2>
            {query && (
              <span className="text-sm text-gray-500">
                关键词: "{query}"
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : articles.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl bg-gray-50">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">未找到与 "{query}" 相关的文章</p>
              <p className="text-sm text-gray-400 mt-2">
                尝试使用其他关键词或检查拼写
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl bg-gray-50">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">输入关键词开始搜索</p>
          <p className="text-sm text-gray-400 mt-2">
            支持搜索文章标题和内容
          </p>
        </div>
      )}
    </div>
  );
}
