import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '../types';
import { cartApi } from '../services/api';
import { useCartStore, useAuthStore } from '../stores';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { setCart, getSessionId } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const sessionId = getSessionId();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await cartApi.addItem(
        { productId: product.id, quantity: 1 },
        isAuthenticated ? undefined : sessionId
      );
      setCart(response.data);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const discount = product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <Link to={`/products/${product.id}`}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </div>
          )}
          
          {/* Wishlist Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart size={18} className="text-gray-600" />
          </motion.button>
          
          {/* Add to Cart Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 p-3 bg-primary-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
          >
            <ShoppingCart size={18} />
          </motion.button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.category?.name || 'Uncategorized'}
          </p>
          
          {/* Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            <Star className="text-yellow-400 fill-yellow-400" size={14} />
            <span className="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
            <span className="text-sm text-gray-400">({product.reviewCount})</span>
          </div>
          
          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {product.compareAtPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
