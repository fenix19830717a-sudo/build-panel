import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Search, Tag, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import type { NewsItem } from '../types';

const newsItems: NewsItem[] = [
  {
    id: '1',
    title: 'The Future of Digital Innovation in 2024',
    excerpt: 'Explore the latest trends shaping the digital landscape and how businesses can adapt to stay ahead of the curve.',
    content: 'Full article content here...',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=500&fit=crop',
    date: '2024-03-01',
    category: 'Technology',
    tags: ['Innovation', 'Digital', 'Trends'],
  },
  {
    id: '2',
    title: 'Building Strong Customer Relationships',
    excerpt: 'Learn proven strategies for creating lasting connections with your customers and driving long-term loyalty.',
    content: 'Full article content here...',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
    date: '2024-02-28',
    category: 'Business',
    tags: ['Customer', 'Strategy', 'Growth'],
  },
  {
    id: '3',
    title: 'Sustainable Business Practices Guide',
    excerpt: 'Discover how implementing sustainable practices can benefit your business and the environment simultaneously.',
    content: 'Full article content here...',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop',
    date: '2024-02-25',
    category: 'Sustainability',
    tags: ['Green', 'Business', 'Environment'],
  },
  {
    id: '4',
    title: 'Maximizing Team Productivity',
    excerpt: 'Expert tips and tools for boosting your team\'s productivity and creating a positive work environment.',
    content: 'Full article content here...',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop',
    date: '2024-02-20',
    category: 'Productivity',
    tags: ['Team', 'Productivity', 'Management'],
  },
  {
    id: '5',
    title: 'The Rise of AI in Business',
    excerpt: 'How artificial intelligence is transforming business operations and creating new opportunities.',
    content: 'Full article content here...',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=500&fit=crop',
    date: '2024-02-15',
    category: 'Technology',
    tags: ['AI', 'Technology', 'Innovation'],
  },
  {
    id: '6',
    title: 'Effective Marketing Strategies',
    excerpt: 'Modern marketing approaches that drive results and help businesses connect with their target audience.',
    content: 'Full article content here...',
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&h=500&fit=crop',
    date: '2024-02-10',
    category: 'Marketing',
    tags: ['Marketing', 'Strategy', 'Growth'],
  },
];

const categories = ['All', 'Technology', 'Business', 'Sustainability', 'Productivity', 'Marketing'];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNews = newsItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Blog
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-foreground mb-6">
              Latest Insights
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Stay updated with the latest news, trends, and insights from our team of experts.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative max-w-md mb-8"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Featured Article */}
          {filteredNews.length > 0 && selectedCategory === 'All' && !searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <a href={`/news/${filteredNews[0].id}`} className="group block">
                <article className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-muted/30 rounded-2xl overflow-hidden">
                  <div className="aspect-[16/10] lg:aspect-auto overflow-hidden">
                    <img
                      src={filteredNews[0].image}
                      alt={filteredNews[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="p-8 flex flex-col justify-center">
                    <span className="inline-block w-fit px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
                      {filteredNews[0].category}
                    </span>
                    
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                      {filteredNews[0].title}
                    </h2>
                    
                    <p className="text-muted-foreground mb-6">
                      {filteredNews[0].excerpt}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(filteredNews[0].date)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </a>
            </motion.div>
          )}

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(selectedCategory === 'All' && !searchQuery ? filteredNews.slice(1) : filteredNews).map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="group bg-background rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all"
              >
                <a href={`/news/${item.id}`}>
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
                      {item.category}
                    </span>
                    
                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {item.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        <span>{formatDate(item.date)}</span>
                      </div>
                      
                      <span className="text-primary text-sm font-medium">Read More →</span>
                    </div>
                  </div>
                </a>
              </motion.article>
            ))}
          </div>

          {filteredNews.length === 0 && (
            <div className="text-center py-20">
              <Tag size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground">No articles found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
