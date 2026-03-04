import api from './api'

export interface Monitor {
  id: string
  name: string
  type: 'http' | 'https' | 'tcp' | 'ping'
  url: string
  status: 'up' | 'down' | 'pending' | 'paused'
  interval: number
  timeout: number
  retries: number
  description?: string
  isActive: boolean
  expectedStatusCode?: string
  keyword?: string
  sslCheck: boolean
  sslExpiryDays: number
  uptime24h: number
  uptime7d: number
  uptime30d: number
  lastCheckedAt?: string
  lastErrorAt?: string
  lastErrorMessage?: string
  createdAt: string
  updatedAt: string
  alertChannels?: AlertChannel[]
}

export interface AlertChannel {
  id: string
  name: string
  type: 'email' | 'webhook' | 'telegram' | 'dingtalk' | 'weixin' | 'slack' | 'discord'
  isActive: boolean
}

export interface CreateMonitorData {
  name: string
  type: 'http' | 'https' | 'tcp' | 'ping'
  url: string
  interval?: number
  timeout?: number
  retries?: number
  description?: string
  isActive?: boolean
  expectedStatusCode?: string
  keyword?: string
  sslCheck?: boolean
  sslExpiryDays?: number
  headers?: Record<string, string>
  body?: string
  alertChannelIds?: string[]
}

export const monitorsApi = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/monitors?page=${page}&limit=${limit}`),

  getById: (id: string) => api.get(`/monitors/${id}`),

  create: (data: CreateMonitorData) => api.post('/monitors', data),

  update: (id: string, data: Partial<CreateMonitorData>) =>
    api.put(`/monitors/${id}`, data),

  delete: (id: string) => api.delete(`/monitors/${id}`),

  getStatus: (id: string) => api.get(`/monitors/${id}/status`),

  getHistory: (id: string, hours = 24) =>
    api.get(`/monitors/${id}/history?hours=${hours}`),

  checkNow: (id: string) => api.post(`/monitors/${id}/check`),

  pause: (id: string) => api.post(`/monitors/${id}/pause`),

  resume: (id: string) => api.post(`/monitors/${id}/resume`),
}

export const dashboardApi = {
  getOverview: () => api.get('/dashboard/overview'),

  getStatusDistribution: () => api.get('/dashboard/status-distribution'),

  getResponseTimeStats: (hours = 24) =>
    api.get(`/dashboard/response-time-stats?hours=${hours}`),

  getUptimeTrend: (days = 7) =>
    api.get(`/dashboard/uptime-trend?days=${days}`),

  getRecentAlerts: (limit = 10) =>
    api.get(`/dashboard/recent-alerts?limit=${limit}`),

  getRecentChecks: (limit = 50) =>
    api.get(`/dashboard/recent-checks?limit=${limit}`),
}

export const alertsApi = {
  getAll: (page = 1, limit = 20, status?: string, severity?: string) => {
    let url = `/alerts?page=${page}&limit=${limit}`
    if (status) url += `&status=${status}`
    if (severity) url += `&severity=${severity}`
    return api.get(url)
  },

  getById: (id: string) => api.get(`/alerts/${id}`),

  acknowledge: (id: string) => api.post(`/alerts/${id}/acknowledge`),

  resolve: (id: string) => api.post(`/alerts/${id}/resolve`),

  delete: (id: string) => api.delete(`/alerts/${id}`),

  getStats: (hours = 24) => api.get(`/alerts/stats/overview?hours=${hours}`),
}

export const alertChannelsApi = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/alert-channels?page=${page}&limit=${limit}`),

  getById: (id: string) => api.get(`/alert-channels/${id}`),

  create: (data: any) => api.post('/alert-channels', data),

  update: (id: string, data: any) => api.put(`/alert-channels/${id}`, data),

  delete: (id: string) => api.delete(`/alert-channels/${id}`),

  test: (id: string, message?: string) =>
    api.post(`/alert-channels/${id}/test`, { message }),
}

export const checkResultsApi = {
  getByMonitor: (monitorId: string, page = 1, limit = 50) => api.get(`/check-results/monitor/${monitorId}?page=${page}&limit=${limit}`),

  getLatest: (monitorId: string, limit = 1) =>
    api.get(`/check-results/monitor/${monitorId}/latest?limit=${limit}`),

  getStats: (monitorId: string, hours = 24) =>
    api.get(`/check-results/monitor/${monitorId}/stats?hours=${hours}`),

  getTrend: (monitorId: string, hours = 24, interval = 60) =>
    api.get(`/check-results/monitor/${monitorId}/trend?hours=${hours}&interval=${interval}`),
}
