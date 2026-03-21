import { ReactNode } from "react";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
  statusCode: number;
}

export interface Project {
  id: number;
  name: string;
  icon: string | null;
  created_at: string;
}

export interface KbFile {
  id: number;
  project_id: number;
  filename: string;
  content: string | null;
  status: string;
  created_at: string;
}

export interface User {
  id: number;
  email: string | null;
  phone: string | null;
  password: string;
  name: string | null;
  role: "admin" | "user";
  credits: number;
  leads_generated: number;
  site_visitors: number;
  tier: string;
  total_tokens_used: number;
  is_banned: number;
  verification_code: string | null;
  created_at: string;
}

export interface PolymarketWallet {
  id: number;
  name: string | null;
  private_key: string;
  api_key: string | null;
  is_active: number;
  created_at: string;
}

export interface PolymarketStrategy {
  id: number;
  name: string;
  description: string | null;
  type: "built-in" | "custom";
  trade_amount: number;
  weight: number;
  is_active: number;
  mode: "paper" | "live";
  created_at: string;
}

export interface PolymarketOrder {
  id: number;
  strategy_id: number | null;
  market_id: string | null;
  market_title: string | null;
  type: "YES" | "NO";
  amount: number | null;
  price: number | null;
  status: "open" | "closed" | "cancelled";
  mode: "paper" | "live";
  pnl: number;
  concurrency: number;
  is_server_side: number;
  created_at: string;
  closed_at: string | null;
}

export interface CrawlerTask {
  id: string;
  name: string;
  platform: string | null;
  status: "paused" | "running" | "completed";
  progress: number;
  total: number;
  creator: string | null;
  priority: "Low" | "Medium" | "High";
  type: "domestic" | "overseas";
  crawler_mode: "standard" | "quant";
  last_run: string | null;
  created_at: string;
}

export interface CrawlerLog {
  id: number;
  task_id: string | null;
  level: "info" | "warning" | "error";
  source: string | null;
  message: string;
  details: string | null;
  created_at: string;
}

export interface ServiceNode {
  id: number;
  node_id: string;
  name: string;
  region: string;
  type: string;
  port: number;
  status: "online" | "offline";
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_apps: number;
  last_heartbeat: string | null;
  created_at: string;
  updated_at: string;
}

export interface NodeApp {
  id: number;
  node_id: string;
  app_id: string;
  app_name: string | null;
  version: string | null;
  status: string;
  memory_usage: number;
  request_count: number;
  error_count: number;
  created_at: string;
  updated_at: string;
}

export interface ModularApp {
  id: number;
  name: string;
  app_key: string;
  description: string | null;
  icon: string | null;
  status: "active" | "inactive" | "upgrading";
  current_version_id: number | null;
  created_at: string;
  version_number?: string;
  endpoint_url?: string;
  changelog?: string;
  public_configs?: Record<string, unknown>;
}

export interface PricingConfig {
  id: number;
  feature_key: string;
  feature_name: string | null;
  credit_cost: number;
  updated_at: string;
}

export interface BillingHistory {
  id: number;
  user_id: number;
  amount: number;
  credits_added: number | null;
  payment_method: string | null;
  status: string;
  invoice_no: string | null;
  created_at: string;
  email?: string;
  name?: string;
}

export interface DedicatedIp {
  id: number;
  ip_address: string;
  server_id: string | null;
  user_id: number | null;
  status: "available" | "assigned" | "expired";
  created_at: string;
  expires_at: string | null;
  username?: string;
  email?: string;
}

export interface BrowserEnvironment {
  id: string;
  user_id: number;
  server_id: string | null;
  ip_id: number | null;
  fingerprint_data: string | null;
  status: string;
  created_at: string;
  username?: string;
  ip_address?: string;
}

export interface ThirdPartySaasConfig {
  id: number;
  name: string;
  type: "linkedin" | "customs" | "crm" | "email_automation";
  api_key: string | null;
  api_secret: string | null;
  base_url: string | null;
  status: "active" | "inactive";
  created_at: string;
}

export interface LayoutProps {
  children: ReactNode;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: "zh" | "en";
  setLang: (lang: "zh" | "en") => void;
  role: "admin" | "user";
  user: User | null;
  onLogout: () => void;
  onLoginRequired: () => void;
}

export interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void> | void;
  loading?: boolean;
  onCancel?: () => void;
  lockDuration?: number;
  showCancel?: boolean;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export interface CreditPackage {
  id: number;
  name: string;
  credits: number;
  price: number;
  is_active: number;
  created_at: string;
}

export interface ModelConfig {
  id: number;
  provider: string;
  api_key: string;
  base_url: string | null;
  is_active: number;
  last_used_at: string | null;
  created_at: string;
}

export interface ExternalApiKey {
  id: number;
  key_value: string;
  name: string | null;
  status: "active" | "inactive";
  created_at: string;
}

export interface Store {
  id: number;
  project_id: number;
  type: string;
  auth_method: string;
  store_url: string | null;
  access_token: string | null;
  username: string | null;
  password: string | null;
  status: string;
  created_at: string;
}

export interface AppVersion {
  id: number;
  app_id: number;
  version_number: string;
  endpoint_url: string;
  changelog: string | null;
  is_stable: number;
  created_at: string;
}

export interface ModularAppConfig {
  id: number;
  app_id: number;
  config_key: string;
  config_value: string | null;
  description: string | null;
  is_public: number;
  created_at: string;
}

export interface UserApiKey {
  id: number;
  user_id: number;
  provider: string;
  api_key: string;
  created_at: string;
}

export interface PolymarketConfig {
  id: number;
  key: string;
  value: string | null;
  updated_at: string;
}

export interface PolymarketStats {
  paper: {
    total_pnl: number;
    total_orders: number;
  };
  live: {
    total_pnl: number;
    total_orders: number;
  };
}

export interface PolymarketMarket {
  id: string;
  title: string;
  volume: number;
  endTime: string;
  odds: number;
}

export interface NodeConnection {
  nodeId: string;
  lastHeartbeat: Date;
  status: Record<string, unknown>;
}

export interface NodeCommand {
  id: string;
  type: string;
  payload: unknown;
  timestamp: string;
}

export interface NodeDeployManifest {
  name: string;
  version: string;
  [key: string]: unknown;
}
