import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { cartApi } from '../services/api';
import { Cart } from '../types';
import { useCartStore, useAuthStore } from '../stores';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, setCart, getSessionId } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const sessionId = getSessionId();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartApi.get(isAuthenticated ? undefined : sessionId);
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const response = await cartApi.updateItem(
        itemId,
        { quantity },
        isAuthenticated ? undefined : sessionId
      );
      setCart(response.data);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const response = await cartApi.removeItem(itemId, isAuthenticated ? undefined : sessionId);
      setCart(response.data);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clear(isAuthenticated ? undefined : sessionId);
      setCart(null);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <ShoppingBag size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some items to get started</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/products')}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold"
        >
          Continue Shopping
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({cart.itemCount})</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm flex gap-4"
              >
                <img
                  src={item.productImage || 'https://via.placeholder.com/100'}
                  alt={item.productName}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                  <p className="text-gray-500">${item.price.toFixed(2)}</p>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${item.total.toFixed(2)}</p>
                </div>
              </motion.div>
            ))}
            
            <button
              onClick={clearCart}
              className="text-red-600 hover:underline"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{cart.total > 100 ? 'Free' : '$10.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${(cart.total * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${(cart.total + (cart.total > 100 ? 0 : 10) + cart.total * 0.08).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-primary-600 text-white rounded-lg font-semibold flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </motion.button>
              
              <button
                onClick={() => navigate('/products')}
                className="w-full mt-4 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
