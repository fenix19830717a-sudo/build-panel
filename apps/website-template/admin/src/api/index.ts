import axios from 'axios';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  ThemeConfig, 
  SiteConfig,
  ContentSection,
  Product,
  ProductCategory,
  Page,
  MediaItem,
  SEOConfig,
  DashboardStats,
  AIGenerationTask,
  User,
  NavMenuItem
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// 请求拦截器 - 添加认证 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data?.error || '请求失败');
  }
);

// 认证 API
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/login', { email, password }),
  
  register: (email: string, password: string, name: string) =>
    apiClient.post<ApiResponse<User>>('/auth/register', { email, password, name }),
  
  me: () =>
    apiClient.get<ApiResponse<User>>('/auth/me'),
  
  updateProfile: (data: Partial<User>) =>
    apiClient.put<ApiResponse<User>>('/auth/profile', data),
  
  changePassword: (oldPassword: string, newPassword: string) =>
    apiClient.post<ApiResponse<void>>('/auth/change-password', { oldPassword, newPassword }),
};

// 主题 API
export const themeApi = {
  getAll: () =>
    apiClient.get<ApiResponse<ThemeConfig[]>>('/themes'),
  
  getCurrent: () =>
    apiClient.get<ApiResponse<ThemeConfig>>('/themes/current'),
  
  setTheme: (themeId: string) =>
    apiClient.post<ApiResponse<ThemeConfig>>(`/themes/${themeId}/activate`),
  
  updateTheme: (themeId: string, data: Partial<ThemeConfig>) =>
    apiClient.put<ApiResponse<ThemeConfig>>(`/themes/${themeId}`, data),
  
  createTheme: (data: Omit<ThemeConfig, 'id'>) =>
    apiClient.post<ApiResponse<ThemeConfig>>('/themes', data),
  
  deleteTheme: (themeId: string) =>
    apiClient.delete<ApiResponse<void>>(`/themes/${themeId}`),
};

// 站点配置 API
export const siteApi = {
  getConfig: () =>
    apiClient.get<ApiResponse<SiteConfig>>('/site/config'),
  
  updateConfig: (data: Partial<SiteConfig>) =>
    apiClient.put<ApiResponse<SiteConfig>>('/site/config', data),
  
  getNavMenu: () =>
    apiClient.get<ApiResponse<NavMenuItem[]>>('/site/nav-menu'),
  
  updateNavMenu: (menu: NavMenuItem[]) =>
    apiClient.put<ApiResponse<NavMenuItem[]>>('/site/nav-menu', { menu }),
};

// 内容 API
export const contentApi = {
  getSections: () =>
    apiClient.get<ApiResponse<ContentSection[]>>('/content/sections'),
  
  getSection: (id: string) =>
    apiClient.get<ApiResponse<ContentSection>>(`/content/sections/${id}`),
  
  createSection: (data: Omit<ContentSection, 'id'>) =>
    apiClient.post<ApiResponse<ContentSection>>('/content/sections', data),
  
  updateSection: (id: string, data: Partial<ContentSection>) =>
    apiClient.put<ApiResponse<ContentSection>>(`/content/sections/${id}`, data),
  
  deleteSection: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/content/sections/${id}`),
  
  reorderSections: (orders: { id: string; order: number }[]) =>
    apiClient.put<ApiResponse<void>>('/content/sections/reorder', { orders }),
  
  generateContent: (type: string, prompt: string) =>
    apiClient.post<ApiResponse<{ content: string }>>('/content/generate', { type, prompt }),
};

// 产品 API
export const productApi = {
  getProducts: (params?: { page?: number; pageSize?: number; categoryId?: string; search?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Product>>>('/products', { params }),
  
  getProduct: (id: string) =>
    apiClient.get<ApiResponse<Product>>(`/products/${id}`),
  
  createProduct: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<ApiResponse<Product>>('/products', data),
  
  updateProduct: (id: string, data: Partial<Product>) =>
    apiClient.put<ApiResponse<Product>>(`/products/${id}`, data),
  
  deleteProduct: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/products/${id}`),
  
  generateDescription: (productName: string, keywords: string[]) =>
    apiClient.post<ApiResponse<{ description: string }>>('/products/generate-description', { productName, keywords }),
};

// 产品分类 API
export const categoryApi = {
  getCategories: () =>
    apiClient.get<ApiResponse<ProductCategory[]>>('/categories'),
  
  getCategory: (id: string) =>
    apiClient.get<ApiResponse<ProductCategory>>(`/categories/${id}`),
  
  createCategory: (data: Omit<ProductCategory, 'id'>) =>
    apiClient.post<ApiResponse<ProductCategory>>('/categories', data),
  
  updateCategory: (id: string, data: Partial<ProductCategory>) =>
    apiClient.put<ApiResponse<ProductCategory>>(`/categories/${id}`, data),
  
  deleteCategory: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/categories/${id}`),
};

// 页面 API
export const pageApi = {
  getPages: (params?: { isPublished?: boolean }) =>
    apiClient.get<ApiResponse<Page[]>>('/pages', { params }),
  
  getPage: (id: string) =>
    apiClient.get<ApiResponse<Page>>(`/pages/${id}`),
  
  getPageBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Page>>(`/pages/slug/${slug}`),
  
  createPage: (data: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<ApiResponse<Page>>('/pages', data),
  
  updatePage: (id: string, data: Partial<Page>) =>
    apiClient.put<ApiResponse<Page>>(`/pages/${id}`, data),
  
  deletePage: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/pages/${id}`),
};

// 媒体 API
export const mediaApi = {
  getMedia: (params?: { type?: string; page?: number; pageSize?: number }) =>
    apiClient.get<ApiResponse<PaginatedResponse<MediaItem>>>('/media', { params }),
  
  uploadMedia: (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<ApiResponse<MediaItem>>('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
  },
  
  deleteMedia: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/media/${id}`),
  
  updateMedia: (id: string, data: Partial<MediaItem>) =>
    apiClient.put<ApiResponse<MediaItem>>(`/media/${id}`, data),
  
  generateImage: (prompt: string, style?: string) =>
    apiClient.post<ApiResponse<{ url: string }>>('/media/generate', { prompt, style }),
};

// SEO API
export const seoApi = {
  getConfig: () =>
    apiClient.get<ApiResponse<SEOConfig>>('/seo/config'),
  
  updateConfig: (data: Partial<SEOConfig>) =>
    apiClient.put<ApiResponse<SEOConfig>>('/seo/config', data),
  
  generateSitemap: () =>
    apiClient.post<ApiResponse<{ url: string }>>('/seo/sitemap'),
  
  analyzeSEO: (pageId?: string) =>
    apiClient.post<ApiResponse<{ score: number; suggestions: string[] }>>('/seo/analyze', { pageId }),
  
  optimizeSEO: (pageId: string) =>
    apiClient.post<ApiResponse<{ seoTitle: string; seoDescription: string; seoKeywords: string }>>('/seo/optimize', { pageId }),
};

// 仪表盘 API
export const dashboardApi = {
  getStats: (period?: 'day' | 'week' | 'month' | 'year') =>
    apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats', { params: { period } }),
  
  getRecentActivities: () =>
    apiClient.get<ApiResponse<{ id: string; action: string; user: string; time: string }[]>>('/dashboard/activities'),
};

// AI API
export const aiApi = {
  generateContent: (type: string, params: Record<string, unknown>) =>
    apiClient.post<ApiResponse<{ content: string }>>('/ai/generate', { type, params }),
  
  generateBatch: (tasks: { type: string; params: Record<string, unknown> }[]) =>
    apiClient.post<ApiResponse<{ taskId: string }>>('/ai/generate-batch', { tasks }),
  
  getTaskStatus: (taskId: string) =>
    apiClient.get<ApiResponse<AIGenerationTask>>(`/ai/tasks/${taskId}`),
  
  translate: (content: string, targetLang: string, sourceLang?: string) =>
    apiClient.post<ApiResponse<{ translated: string }>>('/ai/translate', { content, targetLang, sourceLang }),
  
  batchTranslate: (items: { id: string; content: string }[], targetLang: string) =>
    apiClient.post<ApiResponse<{ taskId: string }>>('/ai/translate-batch', { items, targetLang }),
  
  getSuggestions: (context: string, type: string) =>
    apiClient.post<ApiResponse<{ suggestions: string[] }>>('/ai/suggestions', { context, type }),
};

export default apiClient;
