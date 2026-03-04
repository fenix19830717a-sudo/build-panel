/**
 * API 客户端
 */
import axios, { AxiosError } from 'axios';
import type { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<ApiResponse>) => {
    const message = error.response?.data?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

// 系统信息 API
export const systemApi = {
  getInfo: () => apiClient.get<ApiResponse>('/system/info'),
  getCpu: () => apiClient.get<ApiResponse>('/system/cpu'),
  getMemory: () => apiClient.get<ApiResponse>('/system/memory'),
  getDisk: () => apiClient.get<ApiResponse>('/system/disk'),
  getNetwork: () => apiClient.get<ApiResponse>('/system/network')
};

// 文件管理 API
export const fileApi = {
  list: (path: string) => apiClient.get<ApiResponse>('/files/list', { params: { path } }),
  getContent: (path: string) => apiClient.get<ApiResponse>('/files/content', { params: { path } }),
  saveContent: (path: string, content: string) =>
    apiClient.post<ApiResponse>('/files/content', { path, content }),
  mkdir: (path: string) => apiClient.post<ApiResponse>('/files/mkdir', { path }),
  delete: (path: string) => apiClient.delete<ApiResponse>('/files/delete', { params: { path } }),
  stat: (path: string) => apiClient.get<ApiResponse>('/files/stat', { params: { path } })
};

// 进程管理 API
export const processApi = {
  list: () => apiClient.get<ApiResponse>('/processes/list'),
  kill: (pid: number, signal?: string) =>
    apiClient.post<ApiResponse>('/processes/kill', { pid, signal }),
  get: (pid: number) => apiClient.get<ApiResponse>(`/processes/${pid}`)
};

// 服务管理 API
export const serviceApi = {
  list: () => apiClient.get<ApiResponse>('/services/list'),
  status: (name: string) => apiClient.get<ApiResponse>(`/services/${name}/status`),
  start: (name: string) => apiClient.post<ApiResponse>(`/services/${name}/start`),
  stop: (name: string) => apiClient.post<ApiResponse>(`/services/${name}/stop`),
  restart: (name: string) => apiClient.post<ApiResponse>(`/services/${name}/restart`),
  enable: (name: string) => apiClient.post<ApiResponse>(`/services/${name}/enable`),
  disable: (name: string) => apiClient.post<ApiResponse>(`/services/${name}/disable`),
  logs: (name: string, lines?: number) =>
    apiClient.get<ApiResponse>(`/services/${name}/logs`, { params: { lines } })
};

export default apiClient;
