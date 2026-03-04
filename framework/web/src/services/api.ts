import axios from 'axios'
import { useAuthStore } from '../stores/auth.store'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
})

api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  profile: () => api.get('/auth/profile'),
}

export const serversApi = {
  list: () => api.get('/servers'),
  create: (data: any) => api.post('/servers', data),
  update: (id: string, data: any) => api.put(`/servers/${id}`, data),
  delete: (id: string) => api.delete(`/servers/${id}`),
  testSsh: (id: string, data: any) => api.post(`/servers/${id}/test-ssh`, data),
}

export const appsApi = {
  list: () => api.get('/apps'),
  create: (data: any) => api.post('/apps', data),
  deploy: (id: string, data: any) => api.post(`/apps/${id}/deploy`, data),
}

export const tasksApi = {
  list: () => api.get('/tasks'),
  create: (data: any) => api.post('/tasks', data),
  cancel: (id: string) => api.post(`/tasks/${id}/cancel`),
}

export const apiKeysApi = {
  list: () => api.get('/api-keys'),
  create: (data: any) => api.post('/api-keys', data),
  delete: (id: string) => api.delete(`/api-keys/${id}`),
}

export const usersApi = {
  list: () => api.get('/users'),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
}

export default api
