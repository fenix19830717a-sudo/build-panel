import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Dashboard
export const fetchDashboardStats = () => api.get('/monitor/stats')
export const fetchBackupTrend = (days: number) => api.get(`/monitor/trend?days=${days}`)
export const fetchRecentBackups = (limit: number) => api.get(`/monitor/recent?limit=${limit}`)
export const fetchAlerts = () => api.get('/monitor/alerts')

// Databases
export const fetchDatabases = () => api.get('/databases')
export const createDatabase = (data: any) => api.post('/databases', data)
export const updateDatabase = (id: string, data: any) => api.put(`/databases/${id}`, data)
export const deleteDatabase = (id: string) => api.delete(`/databases/${id}`)
export const testConnection = (data: any) => api.post('/databases/test-connection', data)

// Backups
export const fetchBackups = () => api.get('/backups')
export const createBackup = (data: any) => api.post('/backups', data)
export const deleteBackup = (id: string) => api.delete(`/backups/${id}`)
export const downloadBackup = async (id: string) => {
  const response = await api.get(`/backups/${id}/download`, { responseType: 'blob' })
  return response
}
export const verifyBackup = (id: string) => api.post(`/backups/${id}/verify`)

// Backup Jobs
export const fetchBackupJobs = () => api.get('/backups/jobs')
export const createBackupJob = (data: any) => api.post('/backups/jobs', data)
export const updateBackupJob = (id: string, data: any) => api.put(`/backups/jobs/${id}`, data)
export const deleteBackupJob = (id: string) => api.delete(`/backups/jobs/${id}`)
export const triggerBackupJob = (id: string) => api.post(`/backups/jobs/${id}/trigger`)

// Restore
export const fetchRestoreLogs = () => api.get('/restore')
export const restoreBackup = (data: any) => api.post('/restore', data)

// Storage
export const fetchStorageConfigs = () => api.get('/storage')
export const createStorageConfig = (data: any) => api.post('/storage', data)
export const updateStorageConfig = (id: string, data: any) => api.put(`/storage/${id}`, data)
export const deleteStorageConfig = (id: string) => api.delete(`/storage/${id}`)
export const testStorageConnection = (id: string) => api.post(`/storage/${id}/test`)

export default api
