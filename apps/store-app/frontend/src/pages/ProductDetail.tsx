import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Share2, Check } from 'lucide-react';
import { productsApi, cartApi, aiApi } from '../services/api';
import { Product } from '../types';
import { useCartStore, useAuthStore } from '../stores';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { setCart, getSessionId } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const sessionId = getSessionId();

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchRecommendations();
      productsApi.incrementView(id);
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsApi.getById(id!);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await aiApi.getRecommendations(id!, 4);
      setRecommendations(response.data.products);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const handleAddToCart = async () => {
    try {
      const response = await cartApi.addItem(
        { productId: id!, quantity },
        isAuthenticated ? undefined : sessionId
      );
      setCart(response.data);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Product not found</p>
      </div>
    );
  }

  const discount = product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-white rounded-2xl overflow-hidden"
            >
              <img
                src={product.images?.[0] || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            {product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button key={i} className="w-20 h-20 rounded-lg overflow-hidden border-2 border-primary-500">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">{product.category?.name}</p>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-1">
                  <Star className="text-yellow-400 fill-yellow-400" size={20} />
                  <span className="font-medium">{product.rating.toFixed(1)}</span>
                  <span className="text-gray-400">({product.reviewCount} reviews)</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">{product.viewCount} views</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              {discount > 0 && (
                <>
                  <span className="text-2xl text-gray-400 line-through">${product.compareAtPrice.toFixed(2)}</span>
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-50"
                >
                  -
                </button>
                <span className="px-4">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-50"
                >
                  +
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check size={20} />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    <span>Add to Cart</span>
                  </>
                )}
              </motion.button>

              <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Heart size={20} />
              </button>

              <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Share2 size={20} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">AI Recommended For You</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
