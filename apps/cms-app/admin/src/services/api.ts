import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Articles API
export const articlesApi = {
  getAll: (params?: any) => api.get('/articles', { params }),
  getById: (id: string) => api.get(`/articles/${id}`),
  create: (data: any) => api.post('/articles', data),
  update: (id: string, data: any) => api.put(`/articles/${id}`, data),
  delete: (id: string) => api.delete(`/articles/${id}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getTree: () => api.get('/categories/tree'),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Tags API
export const tagsApi = {
  getAll: () => api.get('/tags'),
  create: (data: any) => api.post('/tags', data),
  update: (id: string, data: any) => api.put(`/tags/${id}`, data),
  delete: (id: string) => api.delete(`/tags/${id}`),
};

// Media API
export const mediaApi = {
  getAll: (params?: any) => api.get('/media', { params }),
  upload: (formData: FormData) =>
    api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: string) => api.delete(`/media/${id}`),
};

// AI API
export const aiApi = {
  writeArticle: (prompt: string, options?: any) =>
    api.post('/ai/articles/write', { prompt, options }),
  generateSummary: (content: string, maxLength?: number) =>
    api.post('/ai/articles/summary', { content, maxLength }),
  optimizeSEO: (content: string, currentTitle?: string) =>
    api.post('/ai/seo/optimize', { content, currentTitle }),
  suggestTags: (content: string) =>
    api.post('/ai/tags/suggest', { content }),
  improveWriting: (content: string, type?: string) =>
    api.post('/ai/writing/improve', { content, type }),
};
