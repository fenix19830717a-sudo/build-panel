import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, User, Share2 } from 'lucide-react';
import { articlesApi } from '../services/api';
import { TagList } from '../components/TagCloud';
import type { Article } from '../types';

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      setLoading(true);
      setError('');
      
      try {
        const res = await articlesApi.getBySlug(slug);
        setArticle(res.data);
        
        // 获取相关文章（同分类）
        if (res.data.categoryId) {
          const relatedRes = await articlesApi.getAll({
            categoryId: res.data.categoryId,
            limit: 4,
            status: 'published',
          });
          setRelatedArticles(
            relatedRes.data.items.filter((a: Article) => a.id !== res.data.id).slice(0, 3)
          );
        }
      } catch (err: any) {
        setError(err.response?.data?.message || '文章加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    window.scrollTo(0, 0);
  }, [slug]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          url: window.location.href,
        });
      } catch {
        // 用户取消分享
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">{error || '文章不存在'}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft size={18} />
          返回
        </button>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft size={18} />
        返回
      </button>

      {/* Article Header */}
      <header className="mb-8">
        {article.category && (
          <Link
            to={`/articles?category=${article.category.id}`}
            className="inline-block mb-4 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-200 transition-colors"
          >
            {article.category.name}
          </Link>
        )}

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <User size={16} />
            作者
          </span>
          <span className="flex items-center gap-2">
            <Clock size={16} />
            {formatDate(article.publishedAt || article.createdAt)}
          </span>
          <span className="flex items-center gap-2">
            <Eye size={16} />
            {article.views} 阅读
          </span>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 hover:text-primary-600 transition-colors"
          >
            <Share2 size={16} />
            分享
          </button>
        </div>
      </header>

      {/* Cover Image */}
      {article.coverImage && (
        <div className="mb-10 rounded-2xl overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full aspect-[16/9] object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <div className="prose-custom mb-10"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

      {/* Tags */}
      {article.tags?.length > 0 && (
        <div className="mb-10 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">标签</h3>
          <TagList tags={article.tags} />
        </div>
      )}

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="pt-8 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">相关文章</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((related) => (
              <Link
                key={related.id}
                to={`/article/${related.slug}`}
                className="group block p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all"
              >
                {related.coverImage && (
                  <div className="aspect-[16/10] rounded-lg overflow-hidden mb-3">
                    <img
                      src={related.coverImage}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600">
                  {related.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
