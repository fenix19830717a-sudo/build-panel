import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Clock } from 'lucide-react';
import { articlesApi, tagsApi } from '../services/api';
import { ArticleCard } from '../components/ArticleCard';
import { TagCloud } from '../components/TagCloud';
import type { Article, Tag } from '../types';

export function HomePage() {
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recentRes, popularRes, tagsRes] = await Promise.all([
          articlesApi.getRecent(7),
          articlesApi.getPopular(5),
          tagsApi.getPopular(20),
        ]);

        const recent = recentRes.data;
        setFeaturedArticle(recent[0] || null);
        setRecentArticles(recent.slice(1, 7));
        setPopularArticles(popularRes.data);
        setTags(tagsRes.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative px-8 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            探索知识的海洋
          </h1>
          <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto mb-8">
            分享技术见解、生活感悟，记录成长的每一个瞬间
          </p>
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-primary-700 font-semibold hover:bg-primary-50 transition-colors"
          >
            浏览文章
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">精选文章</h2>
            <Link
              to={`/article/${featuredArticle.slug}`}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              阅读全文 <ArrowRight size={16} />
            </Link>
          </div>
          <ArticleCard article={featuredArticle} variant="featured" />
        </section>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Articles */}
        <section className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="text-primary-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">最新文章</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {recentArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              查看更多文章
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-8">
          {/* Popular Articles */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-primary-600" size={20} />
              <h3 className="font-bold text-gray-900">热门文章</h3>
            </div>
            <div className="space-y-3">
              {popularArticles.map((article) => (
                <ArticleCard key={article.id} article={article} variant="compact" />
              ))}
            </div>
          </div>

          {/* Tag Cloud */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">热门标签</h3>
            <TagCloud tags={tags} />
          </div>
        </aside>
      </div>
    </div>
  );
}
