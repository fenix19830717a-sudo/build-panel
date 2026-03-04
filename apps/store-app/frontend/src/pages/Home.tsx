import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, Shield, Headphones, Star } from 'lucide-react';
import { productsApi } from '../services/api';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, newArrivalsRes] = await Promise.all([
          productsApi.getFeatured(),
          productsApi.getNewArrivals(),
        ]);
        setFeaturedProducts(featuredRes.data.slice(0, 4));
        setNewArrivals(newArrivalsRes.data.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
    { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
    { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
    { icon: Star, title: 'Quality Guarantee', desc: 'Premium quality products' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-2 bg-primary-500/20 rounded-full text-primary-300 text-sm font-medium mb-6"
            >
              New Collection 2024
            </motion.span>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Discover Your
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">
                Perfect Style
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-lg">
              Explore our curated collection of premium products designed for modern living.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-primary-600 hover:bg-primary-700 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                >
                  <span>Shop Now</span>
                  <ArrowRight size={20} />
                </motion.button>
              </Link>
              
              <Link to="/products?featured=true">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-lg font-semibold backdrop-blur-sm transition-colors"
                >
                  View Featured
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center space-x-4 p-6 bg-white rounded-xl shadow-sm"
              >
                <div className="p-3 bg-primary-50 rounded-lg">
                  <feature.icon className="text-primary-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/products?featured=true" className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight size={18} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 bg-gray-100 rounded-xl animate-shimmer"></div>
              ))
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">New Arrivals</h2>
            <Link to="/products?sort=newest" className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight size={18} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-xl animate-shimmer"></div>
              ))
            ) : (
              newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
              Stay updated with our latest products, exclusive offers, and style tips delivered straight to your inbox.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-8 py-3 bg-gray-900 hover:bg-gray-800 rounded-lg font-semibold transition-colors"
              >
                Subscribe
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
