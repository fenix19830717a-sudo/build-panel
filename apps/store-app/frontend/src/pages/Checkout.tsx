import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Truck, MapPin, Check } from 'lucide-react';
import { ordersApi } from '../services/api';
import { useCartStore, useAuthStore } from '../stores';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    phone: '',
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to sign in to complete your purchase</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Order Confirmed!</h2>
          <p className="text-gray-600 mb-6">Thank you for your purchase. You will receive a confirmation email shortly.</p>
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg"
          >
            View Orders
          </button>
        </motion.div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      await ordersApi.create({
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          attributes: item.attributes,
        })),
        shippingAddress,
      });
      clearCart();
      setOrderComplete(true);
    } catch (error) {
      console.error('Failed to place order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Steps */}
            <div className="bg-white rounded-xl p-6 mb-6">
              <div className="flex items-center space-x-4">
                {[
                  { num: 1, label: 'Shipping', icon: MapPin },
                  { num: 2, label: 'Payment', icon: CreditCard },
                  { num: 3, label: 'Review', icon: Check },
                ].map((s, i) => (
                  <div key={s.num} className="flex items-center">
                    <div className={`flex items-center space-x-2 ${step >= s.num ? 'text-primary-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step >= s.num ? 'bg-primary-100' : 'bg-gray-100'
                      }`}>
                        <s.icon size={16} />
                      </div>
                      <span className="font-medium">{s.label}</span>
                    </div>
                    {i < 2 && <div className="w-12 h-px bg-gray-200 mx-4" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Form */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6"
              >
                <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    placeholder="First Name"
                    className="px-4 py-3 border rounded-lg"
                    value={shippingAddress.firstName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                  />
                  <input
                    placeholder="Last Name"
                    className="px-4 py-3 border rounded-lg"
                    value={shippingAddress.lastName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                  />
                  <input
                    placeholder="Address"
                    className="col-span-2 px-4 py-3 border rounded-lg"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                  />
                  <input
                    placeholder="City"
                    className="px-4 py-3 border rounded-lg"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  />
                  <input
                    placeholder="State"
                    className="px-4 py-3 border rounded-lg"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  />
                  <input
                    placeholder="Postal Code"
                    className="px-4 py-3 border rounded-lg"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                  />
                  <input
                    placeholder="Phone"
                    className="px-4 py-3 border rounded-lg"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  />
                </div>
                
                <button
                  onClick={() => setStep(2)}
                  className="mt-6 w-full py-3 bg-primary-600 text-white rounded-lg font-semibold"
                >
                  Continue to Payment
                </button>
              </motion.div>
            )}

            {/* Payment Form */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6"
              >
                <h2 className="text-xl font-bold mb-6">Payment Method</h2>
                <div className="border-2 border-primary-500 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="text-primary-600" />
                    <span className="font-medium">Credit Card (Demo)</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <input placeholder="Card Number" className="w-full px-4 py-3 border rounded-lg" />
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="MM/YY" className="px-4 py-3 border rounded-lg" />
                    <input placeholder="CVC" className="px-4 py-3 border rounded-lg" />
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-gray-200 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 bg-primary-600 text-white rounded-lg"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* Review */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6"
              >
                <h2 className="text-xl font-bold mb-6">Review Order</h2>
                
                <div className="space-y-4 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 border border-gray-200 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 py-3 bg-primary-600 text-white rounded-lg disabled:opacity-50"
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <h3 className="font-bold mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{cart.total > 100 ? 'Free' : '$10.00'}</span>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${(cart.total + (cart.total > 100 ? 0 : 10)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
