import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Calendar } from 'lucide-react';
import { authApi } from '../services/api';
import { User as UserType } from '../types';
import { useAuthStore } from '../stores';

const Profile = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user: authUser, clearAuth } = useAuthStore();
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      const response = await authApi.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
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

  const displayUser = user || authUser;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-8"
        >
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={40} className="text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{displayUser?.firstName} {displayUser?.lastName}</h1>
              <p className="text-gray-500">{displayUser?.role === 'admin' ? 'Administrator' : 'Customer'}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Mail className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{displayUser?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Calendar className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">{displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t">
            <button
              onClick={() => {
                clearAuth();
                navigate('/');
              }}
              className="w-full py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
