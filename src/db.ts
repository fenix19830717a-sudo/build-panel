import Database from "better-sqlite3";
import { join } from "path";

const db = new Database(join(process.cwd(), "main.db"));

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS kb_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    filename TEXT NOT NULL,
    content TEXT,
    status TEXT DEFAULT 'parsed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS generated_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    type TEXT, -- 'blog', 'site_config', etc.
    title TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    type TEXT, -- 'shopify', 'wordpress', 'custom', etc.
    auth_method TEXT, -- 'oauth', 'token', 'credentials'
    store_url TEXT,
    access_token TEXT,
    username TEXT,
    password TEXT,
    status TEXT DEFAULT 'connected',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS model_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL, -- 'gemini', 'openai', 'kimi', etc.
    api_key TEXT NOT NULL,
    base_url TEXT,
    is_active INTEGER DEFAULT 1,
    last_used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS external_api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_value TEXT UNIQUE NOT NULL,
    name TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password TEXT DEFAULT '123456', -- Simple password for demo
    name TEXT,
    role TEXT DEFAULT 'user', -- 'admin', 'user'
    credits INTEGER DEFAULT 1250,
    leads_generated INTEGER DEFAULT 342,
    site_visitors INTEGER DEFAULT 12400,
    tier TEXT DEFAULT 'Professional', -- 'Basic', 'Professional', 'Enterprise'
    total_tokens_used INTEGER DEFAULT 0,
    is_banned INTEGER DEFAULT 0,
    verification_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS polymarket_wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    private_key TEXT NOT NULL,
    api_key TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    provider TEXT, -- 'openai', 'gemini', 'anthropic', etc.
    api_key TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES user_stats(id)
  );

  -- Update user_stats with role if not exists
  PRAGMA table_info(user_stats);

  CREATE TABLE IF NOT EXISTS pricing_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feature_key TEXT UNIQUE, -- 'ai_blog', 'market_research', 'lead_mining', etc.
    feature_name TEXT,
    credit_cost INTEGER DEFAULT 5,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS billing_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL, -- in USD
    credits_added INTEGER,
    payment_method TEXT,
    status TEXT DEFAULT 'completed',
    invoice_no TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES user_stats(id)
  );

  CREATE TABLE IF NOT EXISTS third_party_saas_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, -- 'LinkedIn Helper', 'Customs Data API', 'HubSpot CRM'
    type TEXT NOT NULL, -- 'linkedin', 'customs', 'crm', 'email_automation'
    api_key TEXT,
    api_secret TEXT,
    base_url TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Insert default user stats if not exists
  INSERT OR IGNORE INTO user_stats (id, email, name, credits, tier, role, password) 
  VALUES (1, 'admin', 'Administrator', 999999, 'Enterprise', 'admin', 'admin123');

  INSERT OR IGNORE INTO user_stats (id, email, name, credits, tier, role, password) 
  VALUES (2, 'std', 'Standard User', 1250, 'Professional', 'user', 'Fenix1983@');

  INSERT OR IGNORE INTO user_stats (id, email, name, credits, tier, role, password) 
  VALUES (3, 'fenix19830717a@gmail.com', 'Fenix User', 1250, 'Professional', 'admin', 'admin123');

  -- Insert default polymarket wallets
  INSERT OR IGNORE INTO polymarket_wallets (name, private_key, api_key, is_active) VALUES 
    ('Main Wallet', '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 'api-key-1', 1),
    ('Secondary Wallet', '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', 'api-key-2', 1);

  -- Insert default pricing configs
  INSERT OR IGNORE INTO pricing_configs (feature_key, feature_name, credit_cost) VALUES 
    ('ai_blog', 'AI Blog Writing', 5),
    ('market_research', 'Market Research', 10),
    ('lead_mining', 'B2B Lead Mining', 2),
    ('site_gen', 'Site Generation', 50),
    ('video_remix', 'AI Video Remix', 20);

  CREATE TABLE IF NOT EXISTS credit_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    price REAL NOT NULL, -- in USD
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  INSERT OR IGNORE INTO credit_packages (name, credits, price) VALUES 
    ('Starter Pack', 1000, 19.99),
    ('Pro Pack', 5000, 79.99),
    ('Enterprise Pack', 20000, 249.99);

  CREATE TABLE IF NOT EXISTS crawler_tasks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    platform TEXT,
    status TEXT DEFAULT 'paused',
    progress INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    creator TEXT,
    priority TEXT DEFAULT 'Medium', -- 'Low', 'Medium', 'High'
    type TEXT, -- 'domestic', 'overseas'
    crawler_mode TEXT DEFAULT 'standard', -- 'standard', 'quant'
    last_run DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS polymarket_strategies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'custom', -- 'built-in', 'custom'
    trade_amount REAL DEFAULT 100,
    weight REAL DEFAULT 1.0,
    is_active INTEGER DEFAULT 1,
    mode TEXT DEFAULT 'paper', -- 'paper', 'live'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS polymarket_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    strategy_id INTEGER,
    market_id TEXT,
    market_title TEXT,
    type TEXT, -- 'YES', 'NO'
    amount REAL,
    price REAL,
    status TEXT DEFAULT 'open', -- 'open', 'closed', 'cancelled'
    mode TEXT, -- 'paper', 'live'
    pnl REAL DEFAULT 0,
    concurrency INTEGER DEFAULT 1,
    is_server_side INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME,
    FOREIGN KEY(strategy_id) REFERENCES polymarket_strategies(id)
  );

  CREATE TABLE IF NOT EXISTS dedicated_ips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address TEXT UNIQUE NOT NULL,
    server_id TEXT,
    user_id INTEGER,
    status TEXT DEFAULT 'available', -- 'available', 'assigned', 'expired'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY(user_id) REFERENCES user_stats(id)
  );

  CREATE TABLE IF NOT EXISTS browser_environments (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    server_id TEXT,
    ip_id INTEGER,
    fingerprint_data TEXT, -- JSON string
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES user_stats(id),
    FOREIGN KEY(ip_id) REFERENCES dedicated_ips(id)
  );

  CREATE TABLE IF NOT EXISTS polymarket_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Add mode column to polymarket_strategies if it doesn't exist
  PRAGMA table_info(polymarket_strategies);

  -- Insert initial crawler tasks
  INSERT OR IGNORE INTO crawler_tasks (id, name, platform, status, progress, total, creator, priority, type, crawler_mode, last_run) VALUES 
    ('T-1001', '1688五金工具供应商', '1688', 'running', 45, 10000, 'Admin', 'High', 'domestic', 'standard', '2026-02-26 10:30'),
    ('T-1002', '美国海关进口商数据', 'US CBP', 'paused', 12, 5000, 'Fenix', 'Medium', 'overseas', 'standard', '2026-02-26 09:15'),
    ('T-1003', 'LinkedIn欧洲采购经理', 'LinkedIn', 'completed', 100, 8500, 'Admin', 'Low', 'overseas', 'standard', '2026-02-25 18:00'),
    ('T-1004', 'Polymarket 高频价格监控', 'Polymarket', 'running', 88, 100000, 'Admin', 'High', 'overseas', 'quant', '2026-03-02 05:00');

  -- Insert initial polymarket strategies
  INSERT OR IGNORE INTO polymarket_strategies (name, description, type, trade_amount, weight, mode) VALUES 
    ('Risk-free Arbitrage', 'Cross-market price difference exploitation (Low risk)', 'built-in', 100, 40, 'paper'),
    ('High Win-rate Follower', 'Copy trades from top 1% profitable accounts (Medium risk)', 'built-in', 50, 30, 'paper'),
    ('AI Sentiment Analysis', 'Social media and news sentiment-based prediction (High risk)', 'built-in', 20, 30, 'paper');

  -- Insert initial polymarket orders
  INSERT OR IGNORE INTO polymarket_orders (strategy_id, market_id, market_title, type, amount, price, mode, status, pnl) VALUES 
    (1, 'm-init-1', 'Bitcoin above $100k', 'YES', 100, 64, 'paper', 'closed', 45.20),
    (2, 'm-init-2', 'Fed Rate Cut', 'NO', 50, 80, 'live', 'closed', -12.50);

  CREATE TABLE IF NOT EXISTS crawler_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT,
    level TEXT DEFAULT 'info', -- 'info', 'warning', 'error'
    source TEXT, -- 'google_search', 'linkedin', 'custom_scraper'
    message TEXT NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Insert some dummy error logs for debugging display
  INSERT INTO crawler_logs (task_id, level, source, message, details) VALUES 
    ('TASK-001', 'error', 'google_search', 'Rate limit exceeded', 'IP 192.168.1.1 blocked for 3600s'),
    ('TASK-002', 'error', 'linkedin', 'Authentication failed', 'Invalid session cookie provided'),
    ('TASK-003', 'warning', 'custom_scraper', 'Selector not found', 'Failed to find .product-price on page https://example.com/p1');

  CREATE TABLE IF NOT EXISTS modular_apps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    app_key TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'upgrading'
    current_version_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS app_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id INTEGER,
    version_number TEXT NOT NULL,
    endpoint_url TEXT NOT NULL,
    changelog TEXT,
    is_stable INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(app_id) REFERENCES modular_apps(id)
  );

  -- Insert some default modular apps
  INSERT OR IGNORE INTO modular_apps (id, name, app_key, description, icon) VALUES 
    (1, 'CRM Module', 'crm-module', 'Customer relationship management and lead tracking.', 'Users'),
    (2, 'Inventory AI', 'inventory-ai', 'AI-powered inventory forecasting and management.', 'Package'),
    (3, 'PolyBot Pro', 'polybot-pro', 'Advanced trading bot for Polymarket prediction markets.', 'Bot');

  -- Insert initial versions
  INSERT OR IGNORE INTO app_versions (app_id, version_number, endpoint_url, changelog) VALUES 
    (1, '1.0.0', '/apps/crm-v1', 'Initial release of CRM module.'),
    (2, '1.2.5', '/apps/inventory-v1.2', 'Added AI forecasting support.'),
    (3, '2.0.1', '/apps/polybot-v2', 'New server-side execution engine.');

  -- Update current version pointers
  UPDATE modular_apps SET current_version_id = 1 WHERE id = 1;
  UPDATE modular_apps SET current_version_id = 2 WHERE id = 2;
  UPDATE modular_apps SET current_version_id = 3 WHERE id = 3;

  CREATE TABLE IF NOT EXISTS modular_app_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_id INTEGER,
    config_key TEXT NOT NULL,
    config_value TEXT,
    description TEXT,
    is_public INTEGER DEFAULT 0, -- 0: Hidden from user, 1: Visible to user
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(app_id) REFERENCES modular_apps(id),
    UNIQUE(app_id, config_key)
  );

  -- Seed initial platform configs for PolyBot Pro (app_id 3)
  INSERT OR IGNORE INTO modular_app_configs (app_id, config_key, config_value, description, is_public) VALUES 
    (3, 'max_concurrency_live', '1', 'Maximum concurrent trades in Live mode', 0),
    (3, 'max_concurrency_paper', '10', 'Maximum concurrent trades in Paper mode', 0),
    (3, 'api_rate_limit', '5', 'Requests per second to Polymarket API', 0),
    (3, 'slippage_tolerance', '1.5', 'Default slippage tolerance percentage', 0),
    (3, 'allowed_trading_modes', '["paper", "live"]', 'Available trading modes for this app', 1);

  -- Service Nodes Table for distributed deployment
  CREATE TABLE IF NOT EXISTS service_nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    region TEXT DEFAULT 'default',
    type TEXT DEFAULT 'worker',
    port INTEGER DEFAULT 3100,
    status TEXT DEFAULT 'offline',
    cpu_usage REAL DEFAULT 0,
    memory_usage REAL DEFAULT 0,
    disk_usage REAL DEFAULT 0,
    active_apps INTEGER DEFAULT 0,
    last_heartbeat DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Node Apps Table for tracking apps on each node
  CREATE TABLE IF NOT EXISTS node_apps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    node_id TEXT NOT NULL,
    app_id TEXT NOT NULL,
    app_name TEXT,
    version TEXT,
    status TEXT DEFAULT 'stopped',
    memory_usage REAL DEFAULT 0,
    request_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(node_id) REFERENCES service_nodes(node_id),
    UNIQUE(node_id, app_id)
  );

  -- Insert default service nodes for demo
  INSERT OR IGNORE INTO service_nodes (node_id, name, region, type, port, status) VALUES 
    ('node-demo-1', 'US-East-Worker-1', 'us-east', 'worker', 3100, 'offline'),
    ('node-demo-2', 'EU-West-Proxy-1', 'eu-west', 'proxy', 3101, 'offline'),
    ('node-demo-3', 'Asia-Trading-1', 'asia', 'trading', 3102, 'offline');
`);

export default db;
