import { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid, List, Filter, ShoppingCart, Search } from 'lucide-react';
import Layout from '../components/Layout';
import type { Product } from '../types';

const products: Product[] = [
  {
    id: '1',
    name: 'Starter Package',
    description: 'Perfect for small teams and startups getting started with digital transformation.',
    price: 99,
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=500&h=400&fit=crop',
    category: 'Starter',
  },
  {
    id: '2',
    name: 'Business Pro',
    description: 'Advanced tools and features for growing businesses and enterprises.',
    price: 299,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=400&fit=crop',
    category: 'Business',
  },
  {
    id: '3',
    name: 'Enterprise Suite',
    description: 'Full-featured solution with premium support and custom integrations.',
    price: 599,
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&h=400&fit=crop',
    category: 'Enterprise',
  },
  {
    id: '4',
    name: 'Cloud Solution',
    description: 'Scalable cloud-based infrastructure for modern businesses.',
    price: 199,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&h=400&fit=crop',
    category: 'Cloud',
  },
  {
    id: '5',
    name: 'Security Package',
    description: 'Comprehensive security solutions to protect your digital assets.',
    price: 249,
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&h=400&fit=crop',
    category: 'Security',
  },
  {
    id: '6',
    name: 'Analytics Pro',
    description: 'Advanced analytics and reporting tools for data-driven decisions.',
    price: 179,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=400&fit=crop',
    category: 'Analytics',
  },
];

const categories = ['All', 'Starter', 'Business', 'Enterprise', 'Cloud', 'Security', 'Analytics'];

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
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
              Our Products
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-foreground mb-6">
              Solutions for Every Need
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover our range of products designed to help you achieve your goals 
              and transform your business.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-8"
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

          {/* Products Grid/List */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group bg-background rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-[4/3]'}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                <div className={`p-6 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                  <div>
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h3 className="text-xl font-semibold text-foreground mt-2 mb-2">{product.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{product.description}</p>
                  </div>
                  
                  <div className={`flex items-center ${viewMode === 'list' ? 'justify-between' : 'justify-between'}`}>
                    <span className="text-2xl font-bold text-primary">${product.price}</span>
                    
                    <motion.button
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ShoppingCart size={16} />
                      Add
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <Filter size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
