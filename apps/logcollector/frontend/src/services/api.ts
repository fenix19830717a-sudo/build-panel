import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Logs API
export const logsApi = {
  getAll: (params?: any) => api.get('/v1/logs', { params }),
  getById: (id: string) => api.get(`/v1/logs/${id}`),
  create: (data: any) => api.post('/v1/logs', data),
  delete: (id: string) => api.delete(`/v1/logs/${id}`),
  search: (params?: any) => api.get('/v1/logs/search', { params }),
  getStats: () => api.get('/v1/logs/stats'),
  query: (data: { query: string; params?: any[] }) => api.post('/v1/logs/query', data),
  ingest: (data: any) => api.post('/v1/logs/ingest', data),
}

// Sources API
export const sourcesApi = {
  getAll: () => api.get('/v1/sources'),
  getById: (id: string) => api.get(`/v1/sources/${id}`),
  create: (data: any) => api.post('/v1/sources', data),
  update: (id: string, data: any) => api.put(`/v1/sources/${id}`, data),
  delete: (id: string) => api.delete(`/v1/sources/${id}`),
}

// Parsers API
export const parsersApi = {
  getAll: () => api.get('/v1/parsers'),
  getById: (id: string) => api.get(`/v1/parsers/${id}`),
  create: (data: any) => api.post('/v1/parsers', data),
  update: (id: string, data: any) => api.put(`/v1/parsers/${id}`, data),
  delete: (id: string) => api.delete(`/v1/parsers/${id}`),
}

// Alert Rules API
export const alertRulesApi = {
  getAll: () => api.get('/v1/alert-rules'),
  getById: (id: string) => api.get(`/v1/alert-rules/${id}`),
  create: (data: any) => api.post('/v1/alert-rules', data),
  update: (id: string, data: any) => api.put(`/v1/alert-rules/${id}`, data),
  delete: (id: string) => api.delete(`/v1/alert-rules/${id}`),
}

export default api
