import { useEffect, useState } from 'react';
import { tagsApi } from '../services/api';
import { TagCloud } from '../components/TagCloud';
import type { Tag } from '../types';

export function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await tagsApi.getAll();
        setTags(res.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">标签云</h1>
        <p className="text-gray-500">探索不同主题的文章，点击标签浏览相关内容</p>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <TagCloud tags={tags} />
      </div>

      {/* Tag Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-white">
          <p className="text-3xl font-bold">{tags.length}</p>
          <p className="text-primary-100">标签总数</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
          <p className="text-3xl font-bold">
            {tags.reduce((acc, t) => acc + t.articleCount, 0)}
          </p>
          <p className="text-purple-100">标签文章</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white">
          <p className="text-3xl font-bold">
            {Math.max(...tags.map((t) => t.articleCount), 0)}
          </p>
          <p className="text-emerald-100">最热标签文章数</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white">
          <p className="text-3xl font-bold">
            {tags.filter((t) => t.articleCount > 0).length}
          </p>
          <p className="text-orange-100">已使用标签</p>
        </div>
      </div>
    </div>
  );
}
