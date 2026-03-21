import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer as createHttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import axios from "axios";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import db from "./src/db";

const upload = multer({ storage: multer.memoryStorage() });

interface NodeConnection {
  nodeId: string;
  ws: WebSocket;
  lastHeartbeat: Date;
  status: any;
}

const nodeConnections = new Map<string, NodeConnection>();
const nodeTokens = new Map<string, { token: string; expiresAt: number }>();

async function startServer() {
  const app = express();

  app.use(express.json());

  // --- Projects API ---
  app.get("/api/projects", (req, res) => {
    const projects = db.prepare("SELECT * FROM projects ORDER BY created_at DESC").all();
    res.json(projects);
  });

  app.post("/api/projects", (req, res) => {
    const { name, icon } = req.body;
    const result = db.prepare("INSERT INTO projects (name, icon) VALUES (?, ?)").run(name, icon || "📁");
    res.json({ id: result.lastInsertRowid, name, icon: icon || "📁" });
  });

  // --- Knowledge Base API ---
  app.get("/api/kb/:projectId", (req, res) => {
    const files = db.prepare("SELECT * FROM kb_files WHERE project_id = ?").all(req.params.projectId);
    res.json(files);
  });

  app.post("/api/kb/:projectId/upload", upload.single("file"), (req, res) => {
    const { projectId } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // In a real app, we'd extract text from PDF/Docx here. 
    // For this demo, we'll simulate content extraction.
    const content = `Simulated content from ${file.originalname}. This file contains information about ${file.originalname.split('.')[0]} for project ${projectId}.`;
    
    const result = db.prepare("INSERT INTO kb_files (project_id, filename, content) VALUES (?, ?, ?)")
      .run(projectId, file.originalname, content);

    res.json({ id: result.lastInsertRowid, filename: file.originalname, status: "parsed" });
  });

  // --- Billing & Pricing API ---
  app.get("/api/admin/pricing", (req, res) => {
    const configs = db.prepare("SELECT * FROM pricing_configs").all();
    res.json(configs);
  });

  app.post("/api/admin/pricing", (req, res) => {
    const { feature_key, credit_cost } = req.body;
    db.prepare("UPDATE pricing_configs SET credit_cost = ?, updated_at = CURRENT_TIMESTAMP WHERE feature_key = ?")
      .run(credit_cost, feature_key);
    res.json({ success: true });
  });

  app.get("/api/admin/billing-history", (req, res) => {
    const history = db.prepare(`
      SELECT bh.*, us.email, us.name 
      FROM billing_history bh 
      JOIN user_stats us ON bh.user_id = us.id
      ORDER BY bh.created_at DESC
    `).all();
    res.json(history);
  });

  // --- Credit Packages API ---
  app.get("/api/admin/packages", (req, res) => {
    const packages = db.prepare("SELECT * FROM credit_packages").all();
    res.json(packages);
  });

  app.post("/api/admin/packages", (req, res) => {
    const { name, credits, price } = req.body;
    const result = db.prepare("INSERT INTO credit_packages (name, credits, price) VALUES (?, ?, ?)")
      .run(name, credits, price);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/admin/packages/:id", (req, res) => {
    db.prepare("DELETE FROM credit_packages WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/billing-history", (req, res) => {
    const { user_id, amount, credits_added, payment_method } = req.body;
    const invoiceNo = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const result = db.prepare(`
      INSERT INTO billing_history (user_id, amount, credits_added, payment_method, invoice_no)
      VALUES (?, ?, ?, ?, ?)
    `).run(user_id, amount, credits_added, payment_method, invoiceNo);
    
    // Update user credits
    db.prepare("UPDATE user_stats SET credits = credits + ? WHERE id = ?").run(credits_added, user_id);
    
    res.json({ id: result.lastInsertRowid, invoice_no: invoiceNo });
  });

  // --- User Management API ---
  app.get("/api/admin/users", (req, res) => {
    const users = db.prepare("SELECT * FROM user_stats").all();
    res.json(users);
  });

  app.post("/api/admin/users", (req, res) => {
    const { name, email, tier, credits } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO user_stats (name, email, tier, credits, password)
        VALUES (?, ?, ?, ?, '123456')
      `).run(name, email, tier, credits);
      res.json({ id: result.lastInsertRowid, success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/users/:id", (req, res) => {
    const { name, tier, credits, is_banned } = req.body;
    const { id } = req.params;
    
    let query = "UPDATE user_stats SET ";
    let params = [];
    let updates = [];

    if (name !== undefined) { updates.push("name = ?"); params.push(name); }
    if (tier !== undefined) { updates.push("tier = ?"); params.push(tier); }
    if (credits !== undefined) { updates.push("credits = ?"); params.push(credits); }
    if (is_banned !== undefined) { updates.push("is_banned = ?"); params.push(is_banned ? 1 : 0); }

    if (updates.length === 0) return res.json({ success: true });

    query += updates.join(", ") + " WHERE id = ?";
    params.push(id);

    db.prepare(query).run(...params);
    res.json({ success: true });
  });

  // --- Crawler Logs API ---
  app.get("/api/crawler/logs", (req, res) => {
    const { level } = req.query;
    let query = "SELECT * FROM crawler_logs";
    let params: any[] = [];
    
    if (level) {
      query += " WHERE level = ?";
      params.push(level);
    }
    
    query += " ORDER BY created_at DESC LIMIT 100";
    const logs = db.prepare(query).all(...params);
    res.json(logs);
  });

  app.post("/api/crawler/logs", (req, res) => {
    const { task_id, level, source, message, details } = req.body;
    const result = db.prepare(`
      INSERT INTO crawler_logs (task_id, level, source, message, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(task_id, level || 'info', source, message, details);
    res.json({ id: result.lastInsertRowid });
  });

  // --- Crawler Tasks API ---
  app.get("/api/crawler/tasks", (req, res) => {
    const tasks = db.prepare("SELECT * FROM crawler_tasks ORDER BY created_at DESC").all();
    res.json(tasks);
  });

  app.post("/api/crawler/tasks", (req, res) => {
    const { id, name, platform, type, creator, priority, crawler_mode } = req.body;
    db.prepare(`
      INSERT INTO crawler_tasks (id, name, platform, type, creator, priority, crawler_mode)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, platform, type, creator, priority, crawler_mode || 'standard');
    res.json({ success: true });
  });

  app.patch("/api/crawler/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { status, progress } = req.body;
    if (status !== undefined) {
      db.prepare("UPDATE crawler_tasks SET status = ? WHERE id = ?").run(status, id);
    }
    if (progress !== undefined) {
      db.prepare("UPDATE crawler_tasks SET progress = ? WHERE id = ?").run(progress, id);
    }
    res.json({ success: true });
  });

  app.delete("/api/crawler/tasks/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM crawler_tasks WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // --- Dedicated IP & Environment API ---
  app.get("/api/admin/dedicated-ips", (req, res) => {
    const ips = db.prepare(`
      SELECT di.*, us.name as username, us.email 
      FROM dedicated_ips di 
      LEFT JOIN user_stats us ON di.user_id = us.id
    `).all();
    res.json(ips);
  });

  app.post("/api/admin/dedicated-ips", (req, res) => {
    const { ip_address, server_id, user_id, expires_at } = req.body;
    const result = db.prepare(`
      INSERT INTO dedicated_ips (ip_address, server_id, user_id, status, expires_at)
      VALUES (?, ?, ?, 'assigned', ?)
    `).run(ip_address, server_id, user_id, expires_at);
    res.json({ id: result.lastInsertRowid, success: true });
  });

  app.get("/api/admin/environments", (req, res) => {
    const envs = db.prepare(`
      SELECT be.*, us.name as username, di.ip_address 
      FROM browser_environments be 
      JOIN user_stats us ON be.user_id = us.id
      LEFT JOIN dedicated_ips di ON be.ip_id = di.id
    `).all();
    res.json(envs);
  });

  // --- Authentication API ---
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    // Support both email and username (email field in DB stores both for this demo)
    const user = db.prepare("SELECT * FROM user_stats WHERE (email = ? OR name = ?) AND password = ?").get(email, email, password) as any;
    if (user) {
      if (user.is_banned) {
        return res.status(403).json({ success: false, message: "Your account has been banned." });
      }
      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role, credits: user.credits } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  app.post("/api/auth/forgot-password", (req, res) => {
    const { contact } = req.body; // email or phone
    const user = db.prepare("SELECT * FROM user_stats WHERE email = ? OR phone = ?").get(contact, contact) as any;
    if (user) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      db.prepare("UPDATE user_stats SET verification_code = ? WHERE id = ?").run(code, user.id);
      // In a real app, send SMS/Email here.
      console.log(`Verification code for ${contact}: ${code}`);
      res.json({ success: true, message: "Verification code sent." });
    } else {
      res.status(404).json({ error: "User not found." });
    }
  });

  app.post("/api/auth/reset-password", (req, res) => {
    const { contact, code, newPassword } = req.body;
    const user = db.prepare("SELECT * FROM user_stats WHERE (email = ? OR phone = ?) AND verification_code = ?").get(contact, contact, code) as any;
    if (user) {
      db.prepare("UPDATE user_stats SET password = ?, verification_code = NULL WHERE id = ?").run(newPassword, user.id);
      res.json({ success: true, message: "Password reset successful." });
    } else {
      res.status(400).json({ error: "Invalid verification code." });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    // For demo, just return the first user
    const user = db.prepare("SELECT * FROM user_stats WHERE id = 1").get() as any;
    if (user && user.is_banned) {
      return res.status(403).json({ error: "Banned" });
    }
    res.json(user);
  });

  // --- Polymarket Wallets API ---
  app.get("/api/polymarket/wallets", (req, res) => {
    const wallets = db.prepare("SELECT * FROM polymarket_wallets").all();
    res.json(wallets);
  });

  app.post("/api/polymarket/wallets", (req, res) => {
    const { name, private_key, api_key } = req.body;
    const result = db.prepare("INSERT INTO polymarket_wallets (name, private_key, api_key) VALUES (?, ?, ?)").run(name, private_key, api_key);
    res.json({ id: result.lastInsertRowid, success: true });
  });

  app.patch("/api/polymarket/wallets/:id", (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    db.prepare("UPDATE polymarket_wallets SET is_active = ? WHERE id = ?").run(is_active ? 1 : 0, id);
    res.json({ success: true });
  });

  // --- User API Keys API ---
  app.get("/api/user/api-keys", (req, res) => {
    const keys = db.prepare("SELECT * FROM user_api_keys WHERE user_id = 1").all();
    res.json(keys);
  });

  app.post("/api/user/api-keys", (req, res) => {
    const { provider, api_key } = req.body;
    db.prepare("INSERT INTO user_api_keys (user_id, provider, api_key) VALUES (1, ?, ?)").run(provider, api_key);
    res.json({ success: true });
  });

  // --- Admin API Keys API ---
  app.get("/api/admin/api-keys", (req, res) => {
    const keys = db.prepare("SELECT * FROM external_api_keys").all();
    res.json(keys);
  });

  app.post("/api/admin/api-keys", (req, res) => {
    const { name, key_value } = req.body;
    db.prepare("INSERT INTO external_api_keys (name, key_value) VALUES (?, ?)").run(name, key_value);
    res.json({ success: true });
  });
  app.get("/api/polymarket/strategies", (req, res) => {
    const strategies = db.prepare("SELECT * FROM polymarket_strategies ORDER BY created_at DESC").all();
    res.json(strategies);
  });

  app.post("/api/polymarket/strategies", (req, res) => {
    const { name, description, trade_amount, weight, type } = req.body;
    const result = db.prepare(`
      INSERT INTO polymarket_strategies (name, description, trade_amount, weight, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, description, trade_amount, weight, type || 'custom');
    res.json({ id: result.lastInsertRowid, success: true });
  });

  app.patch("/api/polymarket/strategies/:id", (req, res) => {
    const { id } = req.params;
    const { is_active, trade_amount, weight, mode } = req.body;
    if (is_active !== undefined) {
      db.prepare("UPDATE polymarket_strategies SET is_active = ? WHERE id = ?").run(is_active ? 1 : 0, id);
    }
    if (trade_amount !== undefined) {
      db.prepare("UPDATE polymarket_strategies SET trade_amount = ? WHERE id = ?").run(trade_amount, id);
    }
    if (weight !== undefined) {
      db.prepare("UPDATE polymarket_strategies SET weight = ? WHERE id = ?").run(weight, id);
    }
    if (mode !== undefined) {
      db.prepare("UPDATE polymarket_strategies SET mode = ? WHERE id = ?").run(mode, id);
    }
    res.json({ success: true });
  });

  app.delete("/api/polymarket/strategies/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM polymarket_strategies WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // --- Polymarket Market Scraping (Gamma API Simulation) ---
  app.get("/api/polymarket/scrape", (req, res) => {
    // Get active wallets for multi-threaded simulation
    const activeWallets = db.prepare("SELECT * FROM polymarket_wallets WHERE is_active = 1").all() as any[];
    const walletCount = activeWallets.length || 1;

    console.log(`Starting multi-threaded market scraping using ${walletCount} wallets...`);
    
    const simulatedMarkets = [];
    // Simulate multi-threaded fetching by increasing the number of items based on wallet count
    const totalItems = 20 * walletCount;
    for (let i = 0; i < totalItems; i++) {
      simulatedMarkets.push({
        id: `m${i}`,
        title: `Will ${['Bitcoin', 'Ethereum', 'Solana', 'Trump', 'Harris'][i % 5]} ${['reach $100k', 'win the election', 'flip market cap', 'be regulated'][Math.floor(Math.random() * 4)]}?`,
        volume: 100000 + Math.random() * 5000000,
        endTime: new Date(Date.now() + (2 + Math.random() * 100) * 3600000).toISOString(),
        odds: Math.random()
      });
    }

    // Filter: Volume > 100k and End Time > 1 hour from now
    const filteredMarkets = simulatedMarkets.filter(m => {
      const vol = m.volume > 100000;
      const time = new Date(m.endTime).getTime() > Date.now() + 3600000;
      return vol && time;
    });

    res.json(filteredMarkets);
  });

  // --- Polymarket Config API ---
  app.get("/api/polymarket/config", (req, res) => {
    const configs = db.prepare("SELECT * FROM polymarket_config").all();
    const configMap: Record<string, string> = {};
    configs.forEach((c: any) => {
      configMap[c.key] = c.value;
    });
    res.json(configMap);
  });

  app.post("/api/polymarket/config", (req, res) => {
    const { key, value } = req.body;
    db.prepare(`
      INSERT INTO polymarket_config (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run(key, value);
    res.json({ success: true });
  });

  app.post("/api/polymarket/test-connection", (req, res) => {
    const { privateKey, apiKey } = req.body;
    // Simulate connection test
    const success = privateKey && privateKey.length > 20;
    if (success) {
      res.json({ success: true, message: "Connection successful. Wallet connected." });
    } else {
      res.status(400).json({ success: false, message: "Invalid Private Key or API Key." });
    }
  });

  // --- Polymarket Orders API ---
  app.get("/api/polymarket/orders", (req, res) => {
    const orders = db.prepare("SELECT * FROM polymarket_orders ORDER BY created_at DESC").all();
    res.json(orders);
  });

  app.post("/api/polymarket/orders", (req, res) => {
    const { strategy_id, market_id, market_title, type, amount, price, mode, isServerSide } = req.body;
    
    // Fetch server-side concurrency and slippage limits for PolyBot Pro (app_id 3)
    const configKey = mode === 'live' ? 'max_concurrency_live' : 'max_concurrency_paper';
    const concurrencyConfig = db.prepare("SELECT config_value FROM modular_app_configs WHERE app_id = 3 AND config_key = ?").get(configKey) as any;
    const slippageConfig = db.prepare("SELECT config_value FROM modular_app_configs WHERE app_id = 3 AND config_key = 'slippage_tolerance'").get() as any;
    
    const serverConcurrency = concurrencyConfig ? parseInt(concurrencyConfig.config_value) : 1;
    const slippage = slippageConfig ? parseFloat(slippageConfig.config_value) : 1.5;

    // If it's a real trade (live), we simulate server-side processing
    if (mode === 'live' || isServerSide) {
      console.log(`[Server-Side Bot] Executing ${mode} trade for ${market_title} with server-enforced concurrency ${serverConcurrency} and slippage ${slippage}%`);
    }

    const result = db.prepare(`
      INSERT INTO polymarket_orders (strategy_id, market_id, market_title, type, amount, price, mode, status, concurrency, is_server_side)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)
    `).run(strategy_id, market_id, market_title, type, amount, price, mode, serverConcurrency, isServerSide ? 1 : 0);
    res.json({ id: result.lastInsertRowid, success: true });
  });

  app.get("/api/polymarket/stats", (req, res) => {
    const paperStats = db.prepare("SELECT SUM(pnl) as total_pnl, COUNT(*) as total_orders FROM polymarket_orders WHERE mode = 'paper'").get() as any;
    const liveStats = db.prepare("SELECT SUM(pnl) as total_pnl, COUNT(*) as total_orders FROM polymarket_orders WHERE mode = 'live'").get() as any;
    
    res.json({
      paper: {
        total_pnl: paperStats?.total_pnl || 0,
        total_orders: paperStats?.total_orders || 0
      },
      live: {
        total_pnl: liveStats?.total_pnl || 0,
        total_orders: liveStats?.total_orders || 0
      }
    });
  });

  // --- AI Generation Route (Updated with Dynamic Pricing) ---
  app.post("/api/ai/generate", async (req, res) => {
    const { prompt, provider, model, systemInstruction, projectId, featureKey } = req.body;

    try {
      const { key, baseUrl } = getNextApiKey(provider);
      if (!key) return res.status(400).json({ error: `No API key configured for ${provider}` });

      // Get credit cost
      const pricing = db.prepare("SELECT credit_cost FROM pricing_configs WHERE feature_key = ?").get(featureKey || 'ai_blog') as any;
      const cost = pricing ? pricing.credit_cost : 5;

      // Check credits
      const user = db.prepare("SELECT credits FROM user_stats WHERE id = 1").get() as any;
      if (user.credits < cost) {
        return res.status(402).json({ error: "Insufficient credits" });
      }

      // Fetch KB context if projectId is provided
      let kbContext = "";
      if (projectId) {
        const files = db.prepare("SELECT content FROM kb_files WHERE project_id = ?").all(projectId) as { content: string }[];
        kbContext = files.map(f => f.content).join("\n\n");
      }

      const finalSystemInstruction = `${systemInstruction || "You are a professional assistant."} 
      ${kbContext ? `\n\nUse the following knowledge base context to inform your response:\n${kbContext}` : ""}`;

      let result = "";
      let tokensUsed = 0; // Simulated token count

      switch (provider) {
        case "gemini":
          const ai = new GoogleGenAI({ apiKey: key });
          const geminiResponse = await ai.models.generateContent({
            model: model || "gemini-2.0-flash",
            contents: prompt,
            config: {
              systemInstruction: finalSystemInstruction
            }
          });
          result = geminiResponse.text || "";
          tokensUsed = result.length / 4; // Rough estimate
          break;

        case "openai":
          const openai = new OpenAI({ apiKey: key, baseURL: baseUrl || undefined });
          const completion = await openai.chat.completions.create({
            model: model || "gpt-4o-mini",
            messages: [
              { role: "system", content: finalSystemInstruction },
              { role: "user", content: prompt }
            ],
          });
          result = completion.choices[0].message.content || "";
          tokensUsed = completion.usage?.total_tokens || 0;
          break;

        case "kimi":
          const kimi = new OpenAI({ 
            apiKey: key,
            baseURL: baseUrl || "https://api.moonshot.cn/v1"
          });
          const kimiCompletion = await kimi.chat.completions.create({
            model: model || "moonshot-v1-8k",
            messages: [
              { role: "system", content: finalSystemInstruction },
              { role: "user", content: prompt }
            ],
          });
          result = kimiCompletion.choices[0].message.content || "";
          tokensUsed = kimiCompletion.usage?.total_tokens || 0;
          break;

        case "volcengine":
          const volcResponse = await axios.post(
            baseUrl || "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
            {
              model: model,
              messages: [
                { role: "system", content: finalSystemInstruction },
                { role: "user", content: prompt }
              ],
            },
            {
              headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json"
              }
            }
          );
          result = volcResponse.data.choices[0].message.content;
          tokensUsed = volcResponse.data.usage?.total_tokens || 0;
          break;

        case "minimax":
          const minimaxResponse = await axios.post(
            baseUrl || "https://api.minimax.chat/v1/text/chatcompletion_v2",
            {
              model: model || "abab6.5-chat",
              messages: [
                { role: "system", content: finalSystemInstruction },
                { role: "user", content: prompt }
              ],
            },
            {
              headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json"
              }
            }
          );
          result = minimaxResponse.data.choices[0].message.content;
          tokensUsed = minimaxResponse.data.usage?.total_tokens || 0;
          break;

        default:
          return res.status(400).json({ error: "Unsupported provider" });
      }

      if (req.destroyed) return;
      res.json({ text: result });

      // Deduct credits and update token usage
      db.prepare("UPDATE user_stats SET credits = credits - ?, total_tokens_used = total_tokens_used + ? WHERE id = 1")
        .run(cost, Math.floor(tokensUsed));
    } catch (error: any) {
      console.error("AI Generation Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to generate content", details: error.message });
    }
  });

  // --- User Stats API ---
  app.get("/api/user/stats", (req, res) => {
    const stats = db.prepare("SELECT * FROM user_stats WHERE id = 1").get();
    res.json(stats);
  });

  // --- Stores API ---
  app.get("/api/stores/:projectId", (req, res) => {
    const stores = db.prepare("SELECT * FROM stores WHERE project_id = ?").all(req.params.projectId);
    res.json(stores);
  });

  app.post("/api/stores/:projectId/bind", (req, res) => {
    const { projectId } = req.params;
    const { type, auth_method, store_url, access_token, username, password } = req.body;
    
    const result = db.prepare(`
      INSERT INTO stores (project_id, type, auth_method, store_url, access_token, username, password)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(projectId, type, auth_method, store_url, access_token, username, password);

    res.json({ id: result.lastInsertRowid, status: "connected" });
  });

  // --- Model Configs (Round-Robin) API ---
  app.get("/api/admin/model-configs", (req, res) => {
    const configs = db.prepare("SELECT * FROM model_configs").all();
    res.json(configs);
  });

  app.post("/api/admin/model-configs", (req, res) => {
    const { provider, api_key, base_url } = req.body;
    const result = db.prepare("INSERT INTO model_configs (provider, api_key, base_url) VALUES (?, ?, ?)")
      .run(provider, api_key, base_url);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/admin/model-configs/:id", (req, res) => {
    db.prepare("DELETE FROM model_configs WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // --- External API Keys API ---
  app.get("/api/admin/external-keys", (req, res) => {
    const keys = db.prepare("SELECT * FROM external_api_keys").all();
    res.json(keys);
  });

  app.post("/api/admin/external-keys", (req, res) => {
    const { name } = req.body;
    const keyValue = `sk-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const result = db.prepare("INSERT INTO external_api_keys (key_value, name) VALUES (?, ?)")
      .run(keyValue, name);
    res.json({ id: result.lastInsertRowid, key_value: keyValue });
  });

  app.delete("/api/admin/external-keys/:id", (req, res) => {
    db.prepare("DELETE FROM external_api_keys WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/external-keys/:id/rotate", (req, res) => {
    const { id } = req.params;
    const newKey = `sk-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    db.prepare("UPDATE external_api_keys SET key_value = ? WHERE id = ?").run(newKey, id);
    res.json({ success: true, key_value: newKey });
  });

  // Helper to get next API key for round-robin
  const getNextApiKey = (provider: string) => {
    const config = db.prepare(`
      SELECT * FROM model_configs 
      WHERE provider = ? AND is_active = 1 
      ORDER BY last_used_at ASC NULLS FIRST 
      LIMIT 1
    `).get(provider) as any;

    if (config) {
      db.prepare("UPDATE model_configs SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?").run(config.id);
      return { key: config.api_key, baseUrl: config.base_url };
    }

    const envKey = process.env[`${provider.toUpperCase()}_API_KEY`];
    return { key: envKey, baseUrl: null };
  };

  // --- Third-Party SaaS Configs API ---
  app.get("/api/admin/saas-configs", (req, res) => {
    const configs = db.prepare("SELECT * FROM third_party_saas_configs").all();
    res.json(configs);
  });

  app.post("/api/admin/saas-configs", (req, res) => {
    const { name, type, api_key, api_secret, base_url } = req.body;
    const result = db.prepare(`
      INSERT INTO third_party_saas_configs (name, type, api_key, api_secret, base_url)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, type, api_key, api_secret, base_url);
    res.json({ id: result.lastInsertRowid, success: true });
  });

  app.delete("/api/admin/saas-configs/:id", (req, res) => {
    db.prepare("DELETE FROM third_party_saas_configs WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // --- SaaS Proxy Endpoints ---
  app.post("/api/saas/linkedin/search", async (req, res) => {
    const { query } = req.body;
    const config = db.prepare("SELECT * FROM third_party_saas_configs WHERE type = 'linkedin' AND status = 'active' LIMIT 1").get() as any;
    
    if (!config) return res.status(503).json({ error: "LinkedIn service not configured." });

    // Simulate calling a real SaaS API like LinkedIn Helper or similar
    console.log(`Proxying LinkedIn search to ${config.base_url} with key ${config.api_key}`);
    
    // Simulated results
    const results = [
      { name: "John Doe", title: "Procurement Manager", company: "Global Sourcing Ltd", location: "London, UK" },
      { name: "Jane Smith", title: "Supply Chain Director", company: "EuroTrade", location: "Berlin, Germany" }
    ];
    
    res.json(results);
  });

  app.post("/api/saas/customs/search", async (req, res) => {
    const { hsCode, country } = req.body;
    const config = db.prepare("SELECT * FROM third_party_saas_configs WHERE type = 'customs' AND status = 'active' LIMIT 1").get() as any;
    
    if (!config) return res.status(503).json({ error: "Customs data service not configured." });

    // Simulated results from a SaaS like ImportGenius or Panjiva API
    const results = [
      { importer: "US Retail Corp", exporter: "China Tools Factory", date: "2026-01-15", weight: "5000kg" },
      { importer: "Global Logistics", exporter: "Ningbo Hardware", date: "2026-02-10", weight: "12000kg" }
    ];
    
    res.json(results);
  });

  app.post("/api/saas/crm/sync", async (req, res) => {
    const { leads } = req.body;
    const config = db.prepare("SELECT * FROM third_party_saas_configs WHERE type = 'crm' AND status = 'active' LIMIT 1").get() as any;
    
    if (!config) return res.status(503).json({ error: "CRM service not configured." });

    // Simulate syncing to HubSpot or Salesforce
    console.log(`Syncing ${leads.length} leads to CRM at ${config.base_url}`);
    res.json({ success: true, syncedCount: leads.length });
  });

  // --- Modular Apps API ---
  app.get("/api/modular-apps", (req, res) => {
    const apps = db.prepare(`
      SELECT ma.*, av.version_number, av.endpoint_url, av.changelog
      FROM modular_apps ma
      LEFT JOIN app_versions av ON ma.current_version_id = av.id
    `).all() as any[];

    // Fetch public configs for each app
    const appsWithConfigs = apps.map(app => {
      const configs = db.prepare("SELECT config_key, config_value FROM modular_app_configs WHERE app_id = ? AND is_public = 1").all(app.id);
      const configMap: Record<string, any> = {};
      configs.forEach((c: any) => {
        try {
          configMap[c.config_key] = JSON.parse(c.config_value);
        } catch {
          configMap[c.config_key] = c.config_value;
        }
      });
      return { ...app, public_configs: configMap };
    });

    res.json(appsWithConfigs);
  });

  app.get("/api/modular-apps/:id/configs", (req, res) => {
    const configs = db.prepare("SELECT * FROM modular_app_configs WHERE app_id = ?").all(req.params.id);
    res.json(configs);
  });

  app.post("/api/modular-apps/:id/configs", (req, res) => {
    const { id } = req.params;
    const { config_key, config_value, description, is_public } = req.body;
    db.prepare(`
      INSERT INTO modular_app_configs (app_id, config_key, config_value, description, is_public)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(app_id, config_key) DO UPDATE SET 
        config_value = excluded.config_value,
        description = excluded.description,
        is_public = excluded.is_public
    `).run(id, config_key, config_value, description, is_public ? 1 : 0);
    res.json({ success: true });
  });

  app.get("/api/modular-apps/:id/versions", (req, res) => {
    const versions = db.prepare("SELECT * FROM app_versions WHERE app_id = ? ORDER BY created_at DESC").all(req.params.id);
    res.json(versions);
  });

  app.post("/api/modular-apps/:id/upgrade", (req, res) => {
    const { id } = req.params;
    const { version_id } = req.body;
    
    // Simulate upgrade process
    db.prepare("UPDATE modular_apps SET status = 'upgrading' WHERE id = ?").run(id);
    
    setTimeout(() => {
      db.prepare("UPDATE modular_apps SET current_version_id = ?, status = 'active' WHERE id = ?").run(version_id, id);
      console.log(`App ${id} upgraded to version ${version_id}`);
    }, 2000);

    res.json({ success: true, message: "Upgrade started." });
  });

  // --- Modular App Proxy (Simulated) ---
  // This endpoint acts as the "API interface for docking"
  app.all("/api/app/:appKey/*", async (req, res) => {
    const { appKey } = req.params;
    const app = db.prepare(`
      SELECT ma.*, av.endpoint_url 
      FROM modular_apps ma 
      JOIN app_versions av ON ma.current_version_id = av.id 
      WHERE ma.app_key = ?
    `).get(appKey) as any;

    if (!app) return res.status(404).json({ error: "App not found" });
    if (app.status !== 'active') return res.status(503).json({ error: "App is currently unavailable (upgrading or inactive)" });

    const subPath = req.params[0];
    console.log(`[Modular Proxy] Routing request for ${appKey} to ${app.endpoint_url}/${subPath}`);
    
    // In a real microservices architecture, we would use axios to proxy the request:
    // const response = await axios({
    //   method: req.method,
    //   url: `${app.endpoint_url}/${subPath}`,
    //   data: req.body,
    //   headers: req.headers
    // });
    // res.status(response.status).send(response.data);

    // For this simulation, we'll return a mock response from the "app"
    res.json({
      app: app.name,
      version: app.version_number,
      path: subPath,
      data: `Response from ${app.name} (v${app.version_number}) at ${app.endpoint_url}`,
      timestamp: new Date().toISOString()
    });
  });

  // --- External API Proxy ---
  app.post("/api/external/generate", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const keyValue = authHeader.split(" ")[1];
    const key = db.prepare("SELECT * FROM external_api_keys WHERE key_value = ? AND status = 'active'").get(keyValue);
    
    if (!key) {
      return res.status(401).json({ error: "Invalid or inactive API key" });
    }

    // Forward to internal generation logic
    req.url = "/api/ai/generate";
    return app._router.handle(req, res, () => {});
  });

  // ==================== Node Management API ====================

  // Node registration
  app.post("/api/node/register", (req, res) => {
    const { nodeId, name, region, type, port, secretKey } = req.body;
    
    const validSecretKey = process.env.NODE_SECRET_KEY || "your-secret-key-change-in-production";
    if (secretKey !== validSecretKey) {
      return res.status(403).json({ success: false, error: "Invalid secret key" });
    }

    const token = uuidv4();
    const expiresAt = Date.now() + 3600000;
    nodeTokens.set(nodeId, { token, expiresAt });

    db.prepare(`
      INSERT INTO service_nodes (node_id, name, region, type, port, status, last_heartbeat)
      VALUES (?, ?, ?, ?, ?, 'online', CURRENT_TIMESTAMP)
      ON CONFLICT(node_id) DO UPDATE SET 
        name = excluded.name,
        region = excluded.region,
        type = excluded.type,
        port = excluded.port,
        status = 'online',
        last_heartbeat = CURRENT_TIMESTAMP
    `).run(nodeId, name, region, type, port);

    console.log(`[Node Manager] Node registered: ${nodeId} (${name})`);
    res.json({ success: true, token, nodeId });
  });

  // Node heartbeat
  app.post("/api/node/heartbeat", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const { nodeId, status, apps } = req.body;

    const storedToken = nodeTokens.get(nodeId);
    if (!storedToken || storedToken.token !== token) {
      return res.status(401).json({ error: "Invalid token" });
    }

    db.prepare(`
      UPDATE service_nodes SET 
        status = 'online',
        cpu_usage = ?,
        memory_usage = ?,
        disk_usage = ?,
        active_apps = ?,
        last_heartbeat = CURRENT_TIMESTAMP
      WHERE node_id = ?
    `).run(status.cpu, status.memory, status.disk, status.activeApps, nodeId);

    if (apps && apps.length > 0) {
      for (const app of apps) {
        db.prepare(`
          INSERT INTO node_apps (node_id, app_id, app_name, version, status, memory_usage, request_count, error_count)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(node_id, app_id) DO UPDATE SET
            status = excluded.status,
            memory_usage = excluded.memory_usage,
            request_count = excluded.request_count,
            error_count = excluded.error_count,
            updated_at = CURRENT_TIMESTAMP
        `).run(nodeId, app.appId, app.name, app.version, app.status, app.memory, app.requests, app.errors);
      }
    }

    res.json({ success: true });
  });

  // Node unregister
  app.post("/api/node/unregister", (req, res) => {
    const { nodeId } = req.body;
    
    db.prepare("UPDATE service_nodes SET status = 'offline' WHERE node_id = ?").run(nodeId);
    nodeTokens.delete(nodeId);
    nodeConnections.delete(nodeId);

    console.log(`[Node Manager] Node unregistered: ${nodeId}`);
    res.json({ success: true });
  });

  // Get all nodes
  app.get("/api/admin/nodes", (req, res) => {
    const nodes = db.prepare("SELECT * FROM service_nodes ORDER BY last_heartbeat DESC").all();
    res.json(nodes);
  });

  // Get node by ID
  app.get("/api/admin/nodes/:nodeId", (req, res) => {
    const node = db.prepare("SELECT * FROM service_nodes WHERE node_id = ?").get(req.params.nodeId);
    if (!node) {
      return res.status(404).json({ error: "Node not found" });
    }
    
    const apps = db.prepare("SELECT * FROM node_apps WHERE node_id = ?").all(req.params.nodeId);
    res.json({ ...node, apps });
  });

  // Send command to node
  app.post("/api/admin/nodes/:nodeId/command", (req, res) => {
    const { nodeId } = req.params;
    const { type, payload } = req.body;

    const connection = nodeConnections.get(nodeId);
    if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
      return res.status(503).json({ error: "Node not connected" });
    }

    const command = {
      id: uuidv4(),
      type,
      payload,
      timestamp: new Date().toISOString()
    };

    connection.ws.send(JSON.stringify({ type: 'command', payload: command }));
    res.json({ success: true, commandId: command.id });
  });

  // Deploy app to node
  app.post("/api/admin/nodes/:nodeId/deploy", (req, res) => {
    const { nodeId } = req.params;
    const { appId, manifest } = req.body;

    const connection = nodeConnections.get(nodeId);
    if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
      return res.status(503).json({ error: "Node not connected" });
    }

    const command = {
      id: uuidv4(),
      type: 'app_load',
      payload: manifest,
      timestamp: new Date().toISOString()
    };

    connection.ws.send(JSON.stringify({ type: 'command', payload: command }));
    
    db.prepare(`
      INSERT INTO node_apps (node_id, app_id, app_name, version, status)
      VALUES (?, ?, ?, ?, 'loading')
    `).run(nodeId, appId, manifest.name, manifest.version);

    res.json({ success: true, commandId: command.id, message: `Deploying ${manifest.name} to ${nodeId}` });
  });

  // Unload app from node
  app.post("/api/admin/nodes/:nodeId/unload", (req, res) => {
    const { nodeId } = req.params;
    const { appId } = req.body;

    const connection = nodeConnections.get(nodeId);
    if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
      return res.status(503).json({ error: "Node not connected" });
    }

    const command = {
      id: uuidv4(),
      type: 'app_unload',
      payload: { appId },
      timestamp: new Date().toISOString()
    };

    connection.ws.send(JSON.stringify({ type: 'command', payload: command }));
    res.json({ success: true, commandId: command.id });
  });

  // Get node apps
  app.get("/api/admin/nodes/:nodeId/apps", (req, res) => {
    const apps = db.prepare("SELECT * FROM node_apps WHERE node_id = ?").all(req.params.nodeId);
    res.json(apps);
  });

  // Proxy request to node app
  app.all("/api/node/:nodeId/app/:appId/*", async (req, res) => {
    const { nodeId, appId } = req.params;
    const route = '/' + req.params[0];

    const connection = nodeConnections.get(nodeId);
    if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
      return res.status(503).json({ error: "Node not connected" });
    }

    const command = {
      id: uuidv4(),
      type: 'execute',
      payload: {
        appId,
        route,
        method: req.method,
        data: { body: req.body, query: req.query }
      },
      timestamp: new Date().toISOString()
    };

    connection.ws.send(JSON.stringify({ type: 'command', payload: command }));
    res.json({ success: true, message: "Command sent to node", commandId: command.id });
  });

  // Create HTTP server for WebSocket support
  const httpServer = createHttpServer(app);

  // WebSocket server for node connections
  const wss = new WebSocketServer({ server: httpServer, path: '/ws/node' });

  wss.on('connection', (ws, req) => {
    const nodeId = req.headers['x-node-id'] as string;
    const authHeader = req.headers.authorization as string;

    if (!nodeId || !authHeader) {
      ws.close(4001, 'Missing authentication');
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const storedToken = nodeTokens.get(nodeId);

    if (!storedToken || storedToken.token !== token) {
      ws.close(4003, 'Invalid token');
      return;
    }

    console.log(`[WebSocket] Node connected: ${nodeId}`);
    nodeConnections.set(nodeId, {
      nodeId,
      ws,
      lastHeartbeat: new Date(),
      status: {}
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        const connection = nodeConnections.get(nodeId);
        
        if (connection) {
          connection.lastHeartbeat = new Date();
          
          if (message.type === 'pong') {
            console.log(`[WebSocket] Pong from ${nodeId}`);
          } else if (message.type === 'status') {
            connection.status = message.payload;
          }
        }
      } catch (error) {
        console.error('[WebSocket] Parse error:', error);
      }
    });

    ws.on('close', () => {
      console.log(`[WebSocket] Node disconnected: ${nodeId}`);
      nodeConnections.delete(nodeId);
      db.prepare("UPDATE service_nodes SET status = 'offline' WHERE node_id = ?").run(nodeId);
    });

    ws.on('error', (error) => {
      console.error(`[WebSocket] Error for ${nodeId}:`, error);
    });

    ws.send(JSON.stringify({ type: 'connected', nodeId }));
  });

  // Heartbeat check interval
  setInterval(() => {
    const now = Date.now();
    for (const [nodeId, connection] of nodeConnections) {
      if (now - connection.lastHeartbeat.getTime() > 60000) {
        console.log(`[WebSocket] Node timeout: ${nodeId}`);
        connection.ws.close();
        nodeConnections.delete(nodeId);
        db.prepare("UPDATE service_nodes SET status = 'offline' WHERE node_id = ?").run(nodeId);
      }
    }
  }, 30000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  const PORT = process.env.PORT || 5555;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`WebSocket server ready at ws://0.0.0.0:${PORT}/ws/node`);
  });
}

startServer();
