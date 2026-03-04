import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Articles API
export const articlesApi = {
  getAll: (params?: any) => api.get('/articles', { params }),
  getBySlug: (slug: string) => api.get(`/articles/slug/${slug}`),
  getPopular: (limit = 5) => api.get('/articles/popular', { params: { limit } }),
  getRecent: (limit = 5) => api.get('/articles/recent', { params: { limit } }),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getTree: () => api.get('/categories/tree'),
  getBySlug: (slug: string) => api.get(`/categories/slug/${slug}`),
};

// Tags API
export const tagsApi = {
  getAll: () => api.get('/tags'),
  getPopular: (limit = 20) => api.get('/tags/popular', { params: { limit } }),
  getCloud: () => api.get('/tags/cloud'),
  getBySlug: (slug: string) => api.get(`/tags/slug/${slug}`),
};

// Search API
export const searchApi = {
  search: (query: string, page = 1, limit = 10) =>
    api.get('/articles', { params: { search: query, page, limit } }),
};
