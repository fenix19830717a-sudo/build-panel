import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';
import type { NewsItem } from '../../types';

const newsItems: NewsItem[] = [
  {
    id: '1',
    title: 'The Future of Digital Innovation in 2024',
    excerpt: 'Explore the latest trends shaping the digital landscape and how businesses can adapt to stay ahead.',
    content: '',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=400&fit=crop',
    date: '2024-03-01',
    category: 'Technology',
    tags: ['Innovation', 'Digital'],
  },
  {
    id: '2',
    title: 'Building Strong Customer Relationships',
    excerpt: 'Learn proven strategies for creating lasting connections with your customers and driving loyalty.',
    content: '',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=400&fit=crop',
    date: '2024-02-28',
    category: 'Business',
    tags: ['Customer', 'Strategy'],
  },
  {
    id: '3',
    title: 'Sustainable Business Practices Guide',
    excerpt: 'Discover how implementing sustainable practices can benefit your business and the environment.',
    content: '',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=400&fit=crop',
    date: '2024-02-25',
    category: 'Sustainability',
    tags: ['Green', 'Business'],
  },
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function News() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Latest News
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-foreground mb-4">
              From Our Blog
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Stay updated with the latest insights, news, and trends from our industry experts.
            </p>
          </div>
          <motion.a
            href="/news"
            className="inline-flex items-center gap-2 text-primary font-medium mt-4 md:mt-0 hover:underline"
            whileHover={{ x: 5 }}
          >
            View All Articles
            <ArrowRight size={20} />
          </motion.a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-background rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:shadow-primary/5 transition-all"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium rounded-full">
                    {item.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(item.date)}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {item.excerpt}
                </p>
                
                <motion.a
                  href={`/news/${item.id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  whileHover={{ x: 3 }}
                >
                  Read More
                  <ArrowRight size={16} />
                </motion.a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
