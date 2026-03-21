import { useState, useEffect } from "react";
import { Code2, Key, Copy, CheckCircle2, Terminal, ExternalLink, Network, Database, Plus, Settings2, Shield, Cpu, Activity, RefreshCw, Trash2, X, AlertCircle, Wallet, Bot, RotateCcw } from "lucide-react";
import { cn } from "../components/Layout";
import { ActionButton } from "../components/ActionButton";

export function ApiServices({ lang }: { lang: "zh" | "en" }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"llm" | "external" | "polymarket">("llm");
  const [modelConfigs, setModelConfigs] = useState<any[]>([]);
  const [externalKeys, setExternalKeys] = useState<any[]>([]);
  const [polyWallets, setPolyWallets] = useState<any[]>([]);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchConfigs();
    fetchKeys();
    fetchWallets();
  }, []);

  const fetchConfigs = async () => {
    const res = await fetch("/api/admin/model-configs");
    const data = await res.json();
    setModelConfigs(data);
  };

  const fetchKeys = async () => {
    const res = await fetch("/api/admin/external-keys");
    const data = await res.json();
    setExternalKeys(data);
  };

  const fetchWallets = async () => {
    const res = await fetch("/api/polymarket/wallets");
    const data = await res.json();
    setPolyWallets(data);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleAddModel = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await fetch("/api/admin/model-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      fetchConfigs();
      setShowModelModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateKey = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await fetch("/api/admin/external-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      fetchKeys();
      setShowKeyModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfig = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/admin/model-configs/${id}`, { method: "DELETE" });
    fetchConfigs();
  };

  const handleDeleteKey = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/admin/external-keys/${id}`, { method: "DELETE" });
    fetchKeys();
  };

  const handleRotateKey = async (id: number) => {
    if (!confirm(lang === "zh" ? "确定要轮换此 API Key 吗？旧 Key 将立即失效。" : "Are you sure you want to rotate this API Key? The old key will be disabled immediately.")) return;
    await fetch(`/api/admin/external-keys/${id}/rotate`, { method: "POST" });
    fetchKeys();
  };

  const handleAddWallet = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await fetch("/api/polymarket/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      fetchWallets();
      setShowWalletModal(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWallet = async (id: number, is_active: boolean) => {
    await fetch(`/api/polymarket/wallets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active })
    });
    fetchWallets();
  };

  const providers = [
    { id: "gemini", name: "Gemini", color: "blue" },
    { id: "openai", name: "OpenAI", color: "emerald" },
    { id: "kimi", name: "Moonshot (Kimi)", color: "indigo" },
    { id: "volcengine", name: "Volcengine (Ark)", color: "sky" },
    { id: "minimax", name: "MiniMax", color: "violet" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {lang === "zh" ? "API 开放平台与大模型配置" : "API Platform & LLM Config"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === "zh" 
              ? "配置多个大模型 API 轮询，生成平台外接 API Key 供客户调用。" 
              : "Configure multiple LLM APIs with round-robin, and generate platform API keys for external use."}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowModelModal(true)}
            className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            {lang === "zh" ? "添加模型 API" : "Add Model API"}
          </button>
          <button 
            onClick={() => setShowWalletModal(true)}
            className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {lang === "zh" ? "添加交易钱包" : "Add Trading Wallet"}
          </button>
          <button 
            onClick={() => setShowKeyModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Key className="w-4 h-4 mr-2" />
            {lang === "zh" ? "生成客户 API Key" : "Generate Client API Key"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab("llm")} className={cn("flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === "llm" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}>
          <Cpu className="w-4 h-4 mr-2" />
          {lang === "zh" ? "大模型池 (LLM Pool)" : "LLM Pool"}
        </button>
        <button onClick={() => setActiveTab("polymarket")} className={cn("flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === "polymarket" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}>
          <Bot className="w-4 h-4 mr-2" />
          {lang === "zh" ? "Poly 机器人钱包" : "Poly Bot Wallets"}
        </button>
        <button onClick={() => setActiveTab("external")} className={cn("flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === "external" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}>
          <Network className="w-4 h-4 mr-2" />
          {lang === "zh" ? "外接 API 接口" : "External API Endpoints"}
        </button>
      </div>

      {activeTab === "llm" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LLM Configs */}
            <div className="lg:col-span-2 space-y-4">
              {providers.map(p => {
                const configs = modelConfigs.filter(c => c.provider === p.id);
                return (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mr-3", `bg-${p.color}-100 text-${p.color}-600`)}>
                          <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{p.name}</h3>
                          <p className="text-xs text-slate-500">
                            {configs.length} {lang === "zh" ? "个可用密钥" : "active keys"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold flex items-center">
                          <RefreshCw className="w-3 h-3 mr-1" /> Round-Robin
                        </span>
                      </div>
                    </div>
                    <div className="p-0">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="p-3 text-xs font-semibold text-slate-500 uppercase">API Key</th>
                            <th className="p-3 text-xs font-semibold text-slate-500 uppercase">Base URL</th>
                            <th className="p-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                            <th className="p-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {configs.length > 0 ? configs.map(c => (
                            <tr key={c.id} className="border-b border-slate-100">
                              <td className="p-3 font-mono text-sm text-slate-600">
                                {c.api_key.substring(0, 8)}...{c.api_key.substring(c.api_key.length - 4)}
                              </td>
                              <td className="p-3 text-xs text-slate-500">{c.base_url || "Default"}</td>
                              <td className="p-3">
                                <span className="flex items-center text-xs text-emerald-600 font-medium">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                                  Active
                                </span>
                              </td>
                              <td className="p-3">
                                <button 
                                  onClick={() => handleDeleteConfig(c.id)}
                                  className="text-slate-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-slate-400 text-sm italic">
                                {lang === "zh" ? "暂无配置，将使用环境变量默认值" : "No config, using default environment key"}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-6 rounded-2xl shadow-sm text-white">
                <h2 className="text-lg font-bold mb-2 flex items-center">
                  <Activity className="w-5 h-5 mr-2 opacity-80" />
                  {lang === "zh" ? "大模型调用统计" : "LLM Usage Stats"}
                </h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1 opacity-80">
                      <span>{lang === "zh" ? "本月 Token 消耗" : "Tokens this month"}</span>
                      <span>12.4M / 50M</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full" style={{ width: '24.8%' }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <div className="text-2xl font-bold">120</div>
                      <div className="text-xs opacity-80">{lang === "zh" ? "当前并发 (QPS)" : "Current QPS"}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">99.9%</div>
                      <div className="text-xs opacity-80">{lang === "zh" ? "成功率" : "Success Rate"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "polymarket" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">{lang === "zh" ? "Polymarket 交易钱包池" : "Polymarket Trading Wallet Pool"}</h3>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold flex items-center">
                  <RefreshCw className="w-3 h-3 mr-1" /> Multi-Threaded Fetching
                </span>
              </div>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">{lang === "zh" ? "钱包名称" : "Wallet Name"}</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Private Key</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">API Key</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {polyWallets.map(w => (
                    <tr key={w.id} className="border-b border-slate-100">
                      <td className="p-4 text-sm font-medium text-slate-900">{w.name}</td>
                      <td className="p-4 font-mono text-xs text-slate-500">
                        {w.private_key.substring(0, 10)}...{w.private_key.substring(w.private_key.length - 6)}
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-500">{w.api_key || "-"}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => toggleWallet(w.id, !w.is_active)}
                          className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase", w.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}
                        >
                          {w.is_active ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="p-4">
                        <button className="text-slate-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {activeTab === "external" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client API Keys */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-indigo-500" />
                {lang === "zh" ? "客户外接 API Keys" : "Client External API Keys"}
              </h2>
              <div className="space-y-4">
                {externalKeys.length > 0 ? externalKeys.map(k => (
                  <div key={k.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-700">{k.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase">Active</span>
                        <ActionButton 
                          onClick={() => handleRotateKey(k.id)}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          title={lang === "zh" ? "轮换 Key" : "Rotate Key"}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </ActionButton>
                        <ActionButton 
                          onClick={() => handleDeleteKey(k.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title={lang === "zh" ? "删除" : "Delete"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </ActionButton>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-white px-2 py-1.5 rounded border border-slate-200 text-slate-600 truncate">
                        {k.key_value}
                      </code>
                      <button 
                        onClick={() => handleCopy(k.key_value, k.id.toString())}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        {copied === k.id.toString() ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-slate-400 text-sm italic">
                    {lang === "zh" ? "暂无外接 API Key" : "No external API keys generated"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* API Documentation */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <Terminal className="w-5 h-5 mr-2 text-slate-500" />
                  {lang === "zh" ? "外接接口文档 & 示例" : "External API Docs & Examples"}
                </h2>
              </div>
              
              <div className="p-0">
                {/* Endpoint 1 */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-mono text-xs font-bold rounded">POST</span>
                    <h3 className="font-semibold text-slate-900">/api/v1/ai/chat/completions</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    {lang === "zh" 
                      ? "统一的大模型对话接口，自动路由到后端的 LLM 池，支持 OpenAI 兼容格式。" 
                      : "Unified LLM chat interface, automatically routed to backend LLM pool, supports OpenAI compatible format."}
                  </p>
                  <div className="bg-slate-900 rounded-xl p-4 relative group">
                    <button 
                      onClick={() => handleCopy("curl -X POST \"https://api.b2bcrawler.com/v1/ai/chat/completions\" -H \"Authorization: Bearer YOUR_CLIENT_API_KEY\"", "code1")}
                      className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                    >
                      {copied === "code1" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
                      <code>
<span className="text-pink-400">curl</span> -X POST <span className="text-green-400">"https://api.b2bcrawler.com/v1/ai/chat/completions"</span> \
  -H <span className="text-green-400">"Authorization: Bearer YOUR_CLIENT_API_KEY"</span> \
  -H <span className="text-green-400">"Content-Type: application/json"</span> \
  -d <span className="text-yellow-300">'{JSON.stringify({
    model: "gemini-2.5-flash",
    messages: [{ role: "user", content: "Hello" }]
  }, null, 2)}'</span>
                      </code>
                    </pre>
                  </div>
                </div>

                {/* Endpoint 2 */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 font-mono text-xs font-bold rounded">GET</span>
                    <h3 className="font-semibold text-slate-900">/api/v1/leads/search</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    {lang === "zh" 
                      ? "搜索海外潜在客户数据（整合 Google Maps, LinkedIn 等），供独立站运营和 EDM 营销使用。" 
                      : "Search overseas leads data (integrating Google Maps, LinkedIn, etc.) for independent site operations and EDM marketing."}
                  </p>
                  <div className="bg-slate-900 rounded-xl p-4 relative group">
                    <button 
                      onClick={() => handleCopy("curl -X GET \"https://api.b2bcrawler.com/v1/leads/search?industry=software&location=new+york\" -H \"Authorization: Bearer YOUR_CLIENT_API_KEY\"", "code2")}
                      className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                    >
                      {copied === "code2" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
                      <code>
<span className="text-pink-400">curl</span> -X GET <span className="text-green-400">"https://api.b2bcrawler.com/v1/leads/search?industry=software&location=new+york"</span> \
  -H <span className="text-green-400">"Authorization: Bearer YOUR_CLIENT_API_KEY"</span>
                      </code>
                    </pre>
                  </div>
                </div>

                {/* Endpoint 3 */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-mono text-xs font-bold rounded">POST</span>
                    <h3 className="font-semibold text-slate-900">/api/v1/research/generate</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    {lang === "zh" 
                      ? "生成海外市场调查报告，支持指定区域、行业和商业模式 (B2B/B2C)。" 
                      : "Generate overseas market research reports, supporting specific regions, industries, and business models (B2B/B2C)."}
                  </p>
                  <div className="bg-slate-900 rounded-xl p-4 relative group">
                    <button 
                      onClick={() => handleCopy("curl -X POST \"https://api.b2bcrawler.com/v1/research/generate\" -H \"Authorization: Bearer YOUR_CLIENT_API_KEY\"", "code3")}
                      className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                    >
                      {copied === "code3" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
                      <code>
<span className="text-pink-400">curl</span> -X POST <span className="text-green-400">"https://api.b2bcrawler.com/v1/research/generate"</span> \
  -H <span className="text-green-400">"Authorization: Bearer YOUR_CLIENT_API_KEY"</span> \
  -H <span className="text-green-400">"Content-Type: application/json"</span> \
  -d <span className="text-yellow-300">'{JSON.stringify({
    region: "North America",
    industry: "Consumer Electronics",
    model: "B2C"
  }, null, 2)}'</span>
                      </code>
                    </pre>
                  </div>
                </div>

                {/* Endpoint 4 */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-mono text-xs font-bold rounded">POST</span>
                    <h3 className="font-semibold text-slate-900">/api/v1/video/remix</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    {lang === "zh" 
                      ? "调用云端 AI 视频混剪服务，支持传入素材链接或搜索关键词。" 
                      : "Call cloud AI video remix service, supporting asset links or search keywords."}
                  </p>
                  <div className="bg-slate-900 rounded-xl p-4 relative group">
                    <button 
                      onClick={() => handleCopy("curl -X POST \"https://api.b2bcrawler.com/v1/video/remix\" -H \"Authorization: Bearer YOUR_CLIENT_API_KEY\"", "code4")}
                      className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                    >
                      {copied === "code4" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
                      <code>
<span className="text-pink-400">curl</span> -X POST <span className="text-green-400">"https://api.b2bcrawler.com/v1/video/remix"</span> \
  -H <span className="text-green-400">"Authorization: Bearer YOUR_CLIENT_API_KEY"</span> \
  -H <span className="text-green-400">"Content-Type: application/json"</span> \
  -d <span className="text-yellow-300">'{JSON.stringify({
    source_url: "https://www.aliexpress.com/item/...",
    style: "TikTok Fast-paced",
    duration: 15
  }, null, 2)}'</span>
                      </code>
                    </pre>
                  </div>
                </div>

                {/* Endpoint 5 */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 font-mono text-xs font-bold rounded">GET</span>
                    <h3 className="font-semibold text-slate-900">/api/v1/logistics/track</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    {lang === "zh" 
                      ? "查询全球国际物流轨迹与实时状态。" 
                      : "Query global logistics trajectory and real-time status."}
                  </p>
                  <div className="bg-slate-900 rounded-xl p-4 relative group">
                    <button 
                      onClick={() => handleCopy("curl -X GET \"https://api.b2bcrawler.com/v1/logistics/track?number=YT1234567890\" -H \"Authorization: Bearer YOUR_CLIENT_API_KEY\"", "code5")}
                      className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                    >
                      {copied === "code5" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
                      <code>
<span className="text-pink-400">curl</span> -X GET <span className="text-green-400">"https://api.b2bcrawler.com/v1/logistics/track?number=YT1234567890"</span> \
  -H <span className="text-green-400">"Authorization: Bearer YOUR_CLIENT_API_KEY"</span>
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center justify-center w-full">
                  {lang === "zh" ? "查看完整 API 文档" : "View Full API Documentation"}
                  <ExternalLink className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modals */}
      {showModelModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">{lang === "zh" ? "添加模型 API" : "Add Model API"}</h3>
              <button onClick={() => setShowModelModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddModel} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "供应商" : "Provider"}</label>
                <select name="provider" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500">
                  {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">API Key</label>
                <input name="api_key" required type="password" placeholder="sk-..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Base URL (Optional)</label>
                <input name="base_url" type="url" placeholder="https://api.example.com/v1" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50">
                {isLoading ? "..." : (lang === "zh" ? "确认添加" : "Add Config")}
              </button>
            </form>
          </div>
        </div>
      )}

      {showWalletModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">{lang === "zh" ? "添加 Polymarket 钱包" : "Add Polymarket Wallet"}</h3>
              <button onClick={() => setShowWalletModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddWallet} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "钱包名称" : "Wallet Name"}</label>
                <input name="name" required type="text" placeholder="Main Wallet" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Private Key</label>
                <input name="private_key" required type="password" placeholder="0x..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">API Key (Optional)</label>
                <input name="api_key" type="text" placeholder="pk-..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50">
                {isLoading ? "..." : (lang === "zh" ? "确认添加" : "Add Wallet")}
              </button>
            </form>
          </div>
        </div>
      )}

      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">{lang === "zh" ? "生成客户 API Key" : "Generate Client API Key"}</h3>
              <button onClick={() => setShowKeyModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGenerateKey} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "客户名称 / 用途" : "Client Name / Purpose"}</label>
                <input name="name" required type="text" placeholder="Client A - CRM" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  {lang === "zh" 
                    ? "生成的 API Key 仅在创建时完整显示一次，请妥善保存。该 Key 将共享您的模型池资源。" 
                    : "The generated API Key is only shown once. Please save it securely. This key will share your model pool resources."}
                </p>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50">
                {isLoading ? "..." : (lang === "zh" ? "生成 Key" : "Generate Key")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
