export interface Monitor {
  id: string;
  name: string;
  type: 'http' | 'https' | 'tcp' | 'ping';
  url: string;
  status: 'up' | 'down' | 'pending' | 'paused';
  interval: number;
  timeout: number;
  retries: number;
  description?: string;
  isActive: boolean;
  uptime24h: number;
  uptime7d: number;
  uptime30d: number;
  lastCheckedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  monitorId: string;
  monitor?: Monitor;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'pending' | 'sent' | 'acknowledged' | 'resolved' | 'failed';
  message: string;
  details?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertChannel {
  id: string;
  name: string;
  type: 'email' | 'webhook' | 'telegram' | 'dingtalk' | 'weixin' | 'slack' | 'discord';
  isActive: boolean;
  failureCount: number;
  createdAt: string;
}

export interface CheckResult {
  id: string;
  monitorId: string;
  status: 'up' | 'down';
  responseTime: number;
  statusCode?: number;
  errorMessage?: string;
  checkedAt: string;
}

export interface DashboardOverview {
  totalMonitors: number;
  upMonitors: number;
  downMonitors: number;
  pausedMonitors: number;
  pendingMonitors: number;
  avgUptime: number;
  avgResponseTime: number;
  activeAlerts: number;
  recentAlerts: number;
}
