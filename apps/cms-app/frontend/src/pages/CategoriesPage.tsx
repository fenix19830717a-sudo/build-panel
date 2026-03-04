import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, ChevronRight } from 'lucide-react';
import { categoriesApi } from '../services/api';
import type { Category } from '../types';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.getTree();
        setCategories(res.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const renderCategoryTree = (cats: Category[], level = 0) => {
    return cats.map((cat) => (
      <div key={cat.id} className={level > 0 ? 'ml-8 mt-4' : ''}>
        <Link
          to={`/articles?category=${cat.id}`}
          className="group flex items-start gap-4 p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all"
        >
          {cat.coverImage ? (
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={cat.coverImage}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
              <FolderOpen className="text-primary-600" size={28} />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                {cat.name}
              </h3>
              <ChevronRight
                size={18}
                className="text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all"
              />
            </div>
            
            {cat.description && (
              <p className="mt-1 text-gray-600 line-clamp-2">{cat.description}</p>
            )}
          </div>
        </Link>

        {cat.children?.length > 0 && renderCategoryTree(cat.children, level + 1)}
      </div>
    ));
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-3">文章分类</h1>
        <p className="text-gray-500">按主题浏览文章，发现感兴趣的内容</p>
      </div>

      <div className="space-y-4">
        {renderCategoryTree(categories)}
      </div>
    </div>
  );
}
