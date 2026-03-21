export interface NodeConfig {
  id: string;
  name: string;
  region: string;
  type: 'worker' | 'proxy' | 'browser' | 'trading';
  port: number;
  masterUrl: string;
  secretKey: string;
}

export interface AppManifest {
  id: string;
  name: string;
  version: string;
  entry: string;
  routes: AppRoute[];
  dependencies?: string[];
  permissions?: string[];
  enabled: boolean;
}

export interface AppRoute {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  handler: string;
}

export interface NodeStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  cpu: number;
  memory: number;
  disk: number;
  network: {
    in: number;
    out: number;
  };
  uptime: number;
  activeApps: number;
  lastHeartbeat: string;
}

export interface HeartbeatPayload {
  nodeId: string;
  timestamp: string;
  status: NodeStatus;
  apps: AppStatus[];
}

export interface AppStatus {
  appId: string;
  name: string;
  version: string;
  status: 'running' | 'stopped' | 'error' | 'loading';
  memory: number;
  requests: number;
  errors: number;
}

export interface CommandMessage {
  id: string;
  type: 'app_load' | 'app_unload' | 'app_reload' | 'config_update' | 'execute' | 'shutdown';
  payload: any;
  timestamp: string;
}

export interface CommandResponse {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
  timestamp: string;
}

export interface AppContext {
  nodeId: string;
  appId: string;
  log: (level: string, message: string, data?: any) => void;
  db: any;
  fetch: typeof fetch;
  config: Record<string, any>;
}

export interface LoadedApp {
  manifest: AppManifest;
  status: 'loading' | 'running' | 'stopped' | 'error';
  module: any;
  startTime?: Date;
  memoryUsage: number;
  requestCount: number;
  errorCount: number;
  lastError?: string;
}
