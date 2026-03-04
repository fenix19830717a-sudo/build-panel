import axios from 'axios';
import { Product, Category, Cart, Order, User, ApiResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Products API
export const productsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; categoryId?: string }) =>
    api.get<ApiResponse<Product[]>>('/products', { params }),
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  getFeatured: () => api.get<Product[]>('/products/featured'),
  getNewArrivals: () => api.get<Product[]>('/products/new-arrivals'),
  incrementView: (id: string) => api.post(`/products/${id}/view`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories'),
  getTree: () => api.get<Category[]>('/categories/tree'),
  getById: (id: string) => api.get<Category>(`/categories/${id}`),
};

// Cart API
export const cartApi = {
  get: (sessionId?: string) => api.get<Cart>('/cart', { params: { sessionId } }),
  addItem: (data: { productId: string; quantity: number; attributes?: Record<string, any> }, sessionId?: string) =>
    api.post<Cart>('/cart/items', data, { params: { sessionId } }),
  updateItem: (itemId: string, data: { quantity: number }, sessionId?: string) =>
    api.put<Cart>(`/cart/items/${itemId}`, data, { params: { sessionId } }),
  removeItem: (itemId: string, sessionId?: string) =>
    api.delete<Cart>(`/cart/items/${itemId}`, { params: { sessionId } }),
  clear: (sessionId?: string) => api.delete('/cart', { params: { sessionId } }),
  merge: (sessionId: string) => api.post<Cart>('/cart/merge', {}, { params: { sessionId } }),
};

// Orders API
export const ordersApi = {
  getAll: (params?: { page?: number; limit?: number }) => api.get<ApiResponse<Order[]>>('/orders', { params }),
  getById: (id: string) => api.get<Order>(`/orders/${id}`),
  create: (data: {
    items: { productId: string; quantity: number; attributes?: Record<string, any> }[];
    shippingAddress: Order['shippingAddress'];
    notes?: string;
  }) => api.post<Order>('/orders', data),
  cancel: (id: string) => api.post<Order>(`/orders/${id}/cancel`),
};

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) => api.post<{ accessToken: string; user: User }>('/auth/login', data),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => api.post<{ accessToken: string; user: User }>('/auth/register', data),
  getProfile: () => api.get<User>('/auth/profile'),
};

// AI API
export const aiApi = {
  generateDescription: (data: { productName: string; features?: string[]; targetAudience?: string; tone?: string }) => api.post<{ content: string }>('/ai/products/generate', data),
  translate: (data: { content: string; targetLanguage: string; sourceLanguage?: string }) =>
    api.post<{ content: string }>('/ai/products/translate', data),
  getRecommendations: (productId: string, limit?: number) =>
    api.post<{ products: Product[]; reason: string }>('/ai/recommendations', { productId, limit }),
  chat: (message: string, sessionId?: string) =>
    api.post<{ content: string; sessionId: string }>('/ai/chat', { message, sessionId }),
};

export default api;
