import React from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import type { Product } from '../../types';

const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Solution',
    description: 'Our flagship product with all the features you need to succeed.',
    price: 299,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=400&fit=crop',
    category: 'Solutions',
    featured: true,
  },
  {
    id: '2',
    name: 'Business Pro',
    description: 'Advanced tools for growing businesses and enterprises.',
    price: 599,
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&h=400&fit=crop',
    category: 'Business',
    featured: true,
  },
  {
    id: '3',
    name: 'Starter Pack',
    description: 'Perfect for small teams and startups getting started.',
    price: 99,
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=500&h=400&fit=crop',
    category: 'Starter',
    featured: true,
  },
];

export default function Products() {
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
              Our Products
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-foreground mb-4">
              Featured Solutions
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Discover our range of products designed to help you achieve your goals.
            </p>
          </div>
          <motion.a
            href="/products"
            className="inline-flex items-center gap-2 text-primary font-medium mt-4 md:mt-0 hover:underline"
            whileHover={{ x: 5 }}
          >
            View All Products
            <ArrowRight size={20} />
          </motion.a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-background rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:shadow-primary/5 transition-all"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <motion.button
                  className="absolute bottom-4 left-4 right-4 py-3 bg-primary text-white font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </motion.button>
              </div>
              
              <div className="p-6">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {product.category}
                </span>
                <h3 className="text-xl font-semibold text-foreground mt-2 mb-2">
                  {product.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    ${product.price}
                  </span>
                  <motion.a
                    href={`/products/${product.id}`}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    whileHover={{ x: 3 }}
                  >
                    Learn More →
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
