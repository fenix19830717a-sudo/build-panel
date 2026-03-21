import { useState, useEffect, useRef } from "react";
import { TrendingUp, Activity, DollarSign, Play, Square, ArrowUpRight, Wallet, Settings2, Target, ShieldAlert, Zap, Users, BrainCircuit, Server, Globe, Coins, RefreshCw, ArrowDownRight, History, Settings, Shield, AlertTriangle, ExternalLink } from "lucide-react";
import { cn } from "../../components/Layout";
import { ActionButton } from "../../components/ActionButton";

function MarketItem({ market, lang, onExecute }: { market: any, lang: string, onExecute: any }) {
  const [amount, setAmount] = useState(10);
  
  return (
    <div className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-slate-900">{market.title}</h3>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Vol: {market.vol}</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <button 
            onClick={() => onExecute(market, 'YES', amount)}
            className="flex-1 flex justify-between items-center px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold transition-colors"
          >
            <span>Buy YES</span>
            <span>¢{market.yes}</span>
          </button>
          <button 
            onClick={() => onExecute(market, 'NO', amount)}
            className="flex-1 flex justify-between items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-bold transition-colors"
          >
            <span>Buy NO</span>
            <span>¢{market.no}</span>
          </button>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">$</span>
            <input 
              type="number" 
              min="1" 
              step="1" 
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              placeholder={lang === "zh" ? "输入金额" : "Amount"} 
              className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" 
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">USD</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PolymarketBot({ lang, onLaunch }: { lang: "zh" | "en", onLaunch?: (tab: string) => void }) {
  const [isRunning, setIsRunning] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "markets" | "history" | "settings">("overview");
  const [tradingMode, setTradingMode] = useState<"paper" | "live">("paper");
  const [authMethod, setAuthMethod] = useState<"wallet" | "privateKey">("wallet");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  
  const [walletConfig, setWalletConfig] = useState({
    privateKey: "",
    apiKey: ""
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [stats, setStats] = useState({
    paper: { total_pnl: 0, total_orders: 0 },
    live: { total_pnl: 0, total_orders: 0 }
  });
  const [orders, setOrders] = useState<any[]>([]);
  
  // Strategies
  const [strategies, setStrategies] = useState({
    arbitrage: true,
    quant5in1: false,
    copyTrading: true,
    smartMoney: false
  });

  const toggleStrategy = (key: keyof typeof strategies) => {
    setStrategies(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [isScraping, setIsScraping] = useState(false);
  const [isAnalyzingStrategies, setIsAnalyzingStrategies] = useState(false);
  const [isTrading, setIsTrading] = useState(false);
  const [scrapedMarkets, setScrapedMarkets] = useState<any[]>([]);
  const [activeWalletsCount, setActiveWalletsCount] = useState(0);
  const scrapeAbortControllerRef = useRef<AbortController | null>(null);
  const generateAbortControllerRef = useRef<AbortController | null>(null);

  const handleScrape = async () => {
    if (onLaunch) {
      window.history.pushState({}, '', '?app=polymarket');
      onLaunch("tasks");
      return;
    }
    setIsScraping(true);
    scrapeAbortControllerRef.current = new AbortController();
    try {
      const res = await fetch("/api/polymarket/scrape", {
        signal: scrapeAbortControllerRef.current.signal
      });
      const data = await res.json();
      setScrapedMarkets(data);
      // Fetch active wallets count
      const wRes = await fetch("/api/polymarket/wallets");
      const wData = await wRes.json();
      setActiveWalletsCount(wData.filter((w: any) => w.is_active).length);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Scrape cancelled');
      } else {
        console.error(error);
      }
    } finally {
      setIsScraping(false);
      scrapeAbortControllerRef.current = null;
    }
  };

  const cancelScrape = () => {
    if (scrapeAbortControllerRef.current) {
      scrapeAbortControllerRef.current.abort();
    }
  };

  const [customStrategy, setCustomStrategy] = useState("");
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);

  const handleGenerateStrategy = async () => {
    setIsGeneratingStrategy(true);
    generateAbortControllerRef.current = new AbortController();
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: generateAbortControllerRef.current.signal,
        body: JSON.stringify({
          prompt: `Create a Polymarket trading strategy based on this description: ${customStrategy}. Return a JSON with name and logic summary.`,
          systemInstruction: "You are a quant trading expert.",
          featureKey: "polymarket_bot"
        })
      });
      const data = await res.json();
      // In a real app, we'd parse and save this to the DB
      alert(lang === 'zh' ? "策略已生成并添加！" : "Strategy generated and added!");
      fetchStrategies();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Generation cancelled');
      } else {
        console.error(error);
      }
    } finally {
      setIsGeneratingStrategy(false);
      generateAbortControllerRef.current = null;
    }
  };

  const cancelGenerate = () => {
    if (generateAbortControllerRef.current) {
      generateAbortControllerRef.current.abort();
    }
  };

  const [dbStrategies, setDbStrategies] = useState<any[]>([]);
  useEffect(() => {
    fetchStrategies();
    fetchConfig();
    fetchStats();
    fetchOrders();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/polymarket/config");
      const data = await res.json();
      setWalletConfig({
        privateKey: data.privateKey || "",
        apiKey: data.apiKey || ""
      });
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/polymarket/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/polymarket/orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveConfig = async (key: string, value: string) => {
    try {
      await fetch("/api/polymarket/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      });
      fetchConfig();
    } catch (error) {
      console.error(error);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const res = await fetch("/api/polymarket/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(walletConfig)
      });
      const data = await res.json();
      alert(data.message);
    } catch (error) {
      console.error(error);
      alert("Connection failed.");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleConnectWallet = async () => {
    setIsTestingConnection(true);
    // Simulate wallet connection
    setTimeout(() => {
      setIsWalletConnected(true);
      setWalletAddress("0x71C...3921");
      setIsTestingConnection(false);
      alert(lang === 'zh' ? "钱包连接成功！" : "Wallet connected successfully!");
    }, 1000);
  };

  const handleExecuteTrade = async (market: any, type: 'YES' | 'NO', amount: number) => {
    try {
      if (tradingMode === 'live' && !isWalletConnected && !walletConfig.privateKey) {
        alert(lang === 'zh' ? "请先连接钱包或输入私钥以进行真实交易。" : "Please connect wallet or enter private key for live trading.");
        return;
      }

      // Find an active strategy to associate with
      const activeStrat = dbStrategies.find(s => s.is_active);
      
      await fetch("/api/polymarket/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy_id: activeStrat?.id || null,
          market_id: market.id || `m-${Math.random()}`,
          market_title: market.title,
          type,
          amount,
          price: type === 'YES' ? market.yes : market.no,
          mode: tradingMode, // Use global trading mode for manual trades
          concurrency: 1, // Platform default
          isServerSide: tradingMode === 'live' // Live trades are handled by server bots
        })
      });
      alert(lang === 'zh' ? "订单已提交！" : "Order submitted!");
      fetchOrders();
      fetchStats();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStrategies = async () => {
    try {
      const res = await fetch("/api/polymarket/strategies");
      const data = await res.json();
      setDbStrategies(data);
    } catch (error) {
      console.error(error);
    }
  };

  const updateStrategy = async (id: number, updates: any) => {
    try {
      await fetch(`/api/polymarket/strategies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      fetchStrategies();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            {lang === "zh" ? "Polymarket 交易机器人" : "Polymarket Trading Bot"}
            <span className={cn("ml-3 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center", isRunning ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>
              <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", isRunning ? "bg-emerald-500 animate-pulse" : "bg-slate-400")}></span>
              {isRunning ? (lang === "zh" ? "运行中" : "Running") : (lang === "zh" ? "已停止" : "Stopped")}
            </span>
            <span className={cn("ml-2 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider", tradingMode === "live" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700")}>
              {tradingMode === "live" ? (lang === "zh" ? "真实交易" : "Live Trading") : (lang === "zh" ? "模拟交易" : "Paper Trading")}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === "zh" ? "自动追踪高胜率巨鲸账号并执行跟单策略。" : "Auto-track high win-rate whales and execute copy-trading strategies."}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200 flex items-center">
              <Coins className="w-3 h-3 mr-1" />
              {lang === "zh" ? "模拟交易: 免费" : "Paper Trading: Free"}
            </span>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-200 flex items-center">
              <Coins className="w-3 h-3 mr-1" />
              {lang === "zh" ? "真实交易: $49/月 节点费" : "Live Trading: $49/mo Node Fee"}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={cn("flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm", isRunning ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-500 text-white hover:bg-emerald-600")}
          >
            {isRunning ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isRunning ? (lang === "zh" ? "停止机器人" : "Stop Bot") : (lang === "zh" ? "启动机器人" : "Start Bot")}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
            activeTab === "overview" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          {lang === "zh" ? "运行概览" : "Overview"}
        </button>
        <button
          onClick={() => setActiveTab("markets")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
            activeTab === "markets" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          {lang === "zh" ? "市场与手动交易" : "Markets & Manual"}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
            activeTab === "history" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          {lang === "zh" ? "交易记录与AI分析" : "History & AI Analysis"}
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
            activeTab === "settings" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          {lang === "zh" ? "机器人配置" : "Configuration"}
        </button>
      </div>

      {activeTab === "overview" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-medium text-blue-600">{lang === "zh" ? "模拟交易盈亏 (Paper)" : "Paper Trading PnL"}</div>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">Simulation</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 flex items-center">
                ${stats.paper.total_pnl.toFixed(2)}
                <span className="ml-2 text-sm font-medium text-slate-500">
                  ({stats.paper.total_orders} {lang === "zh" ? "笔订单" : "orders"})
                </span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm bg-gradient-to-br from-red-50/50 to-white">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-medium text-red-600">{lang === "zh" ? "真实交易盈亏 (Live)" : "Live Trading PnL"}</div>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase">Real Money</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 flex items-center">
                ${stats.live.total_pnl.toFixed(2)}
                <span className="ml-2 text-sm font-medium text-slate-500">
                  ({stats.live.total_orders} {lang === "zh" ? "笔订单" : "orders"})
                </span>
              </div>
            </div>
          </div>
          {/* Async Workflow Status */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl text-white">
            <h2 className="text-lg font-bold mb-6 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-amber-400" />
              {lang === "zh" ? "异步交易流水线" : "Async Trading Pipeline"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1: Scraping */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold", isScraping ? "bg-amber-500 animate-pulse" : "bg-slate-800 border border-slate-700")}>1</div>
                  <div>
                    <div className="font-bold">{lang === "zh" ? "多线程抓取" : "Multi-threaded Scraping"}</div>
                    <div className="text-[10px] text-slate-400">
                      {lang === "zh" ? `使用 ${activeWalletsCount || 2} 个钱包 API` : `Using ${activeWalletsCount || 2} Wallet APIs`}
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="text-xs text-slate-400 mb-2">{lang === "zh" ? "过滤条件: 交易额 > 100k, 剩余 > 1h" : "Filters: Vol > 100k, End > 1h"}</div>
                  <ActionButton 
                    onClick={handleScrape}
                    loading={isScraping}
                    showCancel={true}
                    onCancel={cancelScrape}
                    className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold transition-colors text-white"
                  >
                    {!isScraping && <Globe className="w-3 h-3 mr-2" />}
                    {lang === "zh" ? "立即抓取" : "Scrape Now"}
                  </ActionButton>
                </div>
              </div>

              {/* Step 2: Analysis */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold", isAnalyzingStrategies ? "bg-indigo-500 animate-pulse" : "bg-slate-800 border border-slate-700")}>2</div>
                  <div>
                    <div className="font-bold">{lang === "zh" ? "策略分析" : "Strategy Analysis"}</div>
                    <div className="text-[10px] text-slate-400">AI Logic + Quant Models</div>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="text-xs text-slate-400 mb-2">{lang === "zh" ? "分析中: 12 个活跃策略" : "Analyzing: 12 Active Strategies"}</div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-2/3"></div>
                  </div>
                </div>
              </div>

              {/* Step 3: Trading */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold", isTrading ? "bg-emerald-500 animate-pulse" : "bg-slate-800 border border-slate-700")}>3</div>
                  <div>
                    <div className="font-bold">{lang === "zh" ? "执行交易" : "Execution"}</div>
                    <div className="text-[10px] text-slate-400">On-chain Polygon TX</div>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="text-xs text-slate-400 mb-2">{lang === "zh" ? "待处理订单: 0" : "Pending Orders: 0"}</div>
                  <div className="flex items-center gap-2 text-[10px] text-emerald-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></div>
                    {lang === "zh" ? "节点连接正常" : "Node Connected"}
                  </div>
                </div>
              </div>

              {/* Connector Lines (Desktop) */}
              <div className="hidden md:block absolute top-5 left-[15%] right-[15%] h-0.5 bg-slate-800 -z-0"></div>
            </div>
          </div>

          {/* Active Positions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">{lang === "zh" ? "当前活跃仓位" : "Active Positions"}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="p-4 text-sm font-semibold text-slate-600">{lang === "zh" ? "市场" : "Market"}</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">{lang === "zh" ? "预测" : "Prediction"}</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">{lang === "zh" ? "买入均价" : "Avg Buy Price"}</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">{lang === "zh" ? "当前价格" : "Current Price"}</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">{lang === "zh" ? "未实现盈亏" : "Unrealized PnL"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 text-sm font-medium text-slate-900">Will AI surpass human intelligence by 2027?</td>
                    <td className="p-4 text-sm"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-bold text-xs">YES</span></td>
                    <td className="p-4 text-sm font-mono text-slate-600">¢45.2</td>
                    <td className="p-4 text-sm font-mono text-slate-900">¢52.0</td>
                    <td className="p-4 text-sm font-mono text-emerald-600 font-medium">+$150.40</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 text-sm font-medium text-slate-900">Fed Interest Rate Cut in March?</td>
                    <td className="p-4 text-sm"><span className="px-2 py-1 bg-red-100 text-red-700 rounded font-bold text-xs">NO</span></td>
                    <td className="p-4 text-sm font-mono text-slate-600">¢80.0</td>
                    <td className="p-4 text-sm font-mono text-slate-900">¢75.5</td>
                    <td className="p-4 text-sm font-mono text-red-600 font-medium">-$45.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "markets" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h2 className="font-bold text-slate-900">{lang === "zh" ? "实时市场列表" : "Live Market List"}</h2>
              <p className="text-xs text-slate-500 mt-1">{lang === "zh" ? "最后更新: " : "Last updated: "} {new Date().toLocaleTimeString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" className="mr-2 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                {lang === "zh" ? "启用限价单模式" : "Enable Limit Orders"}
              </label>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-4 space-y-4">
            {[
              { id: 'm1', title: "Bitcoin above $100k in 2026?", yes: 65, no: 35, vol: "$12.5M" },
              { id: 'm2', title: "Ethereum ETF Approval by June?", yes: 82, no: 18, vol: "$8.2M" },
              { id: 'm3', title: "US Presidential Election Winner", yes: 55, no: 45, vol: "$45.1M" },
            ].map((market, idx) => (
              <MarketItem key={idx} market={market} lang={lang} onExecute={handleExecuteTrade} />
            ))}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{lang === "zh" ? "交易记录" : "Trade History"}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="p-4 text-sm font-semibold text-slate-600">{lang === "zh" ? "时间" : "Time"}</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">{lang === "zh" ? "市场" : "Market"}</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">{lang === "zh" ? "操作" : "Action"}</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">{lang === "zh" ? "策略" : "Strategy"}</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">{lang === "zh" ? "盈亏" : "PnL"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.length > 0 ? orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="p-4 text-sm text-slate-500">{new Date(order.created_at).toLocaleString()}</td>
                      <td className="p-4 text-sm font-medium text-slate-900">
                        <div className="flex flex-col">
                          <span>{order.market_title}</span>
                          <span className={cn("text-[10px] font-bold uppercase", order.mode === 'live' ? "text-red-500" : "text-blue-500")}>
                            {order.mode === 'live' ? "Live" : "Paper"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <span className={cn("font-bold", order.type === 'YES' ? "text-emerald-600" : "text-red-600")}>
                          Buy {order.type}
                        </span> @ ¢{order.price}
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {dbStrategies.find(s => s.id === order.strategy_id)?.name || "Manual"}
                      </td>
                      <td className="p-4 text-sm font-mono font-medium">
                        {order.pnl > 0 ? `+$${order.pnl.toFixed(2)}` : order.pnl < 0 ? `-$${Math.abs(order.pnl).toFixed(2)}` : "-"}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 text-sm">
                        {lang === "zh" ? "暂无交易记录" : "No trade history yet"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <BrainCircuit className="w-5 h-5 mr-2 text-indigo-500" />
                {lang === "zh" ? "AI 策略分析" : "AI Strategy Analysis"}
              </h2>
              <button 
                onClick={handleGenerateStrategy}
                disabled={isGeneratingStrategy}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                title={lang === "zh" ? "重新分析" : "Re-analyze"}
              >
                <RefreshCw className={cn("w-4 h-4", isGeneratingStrategy && "animate-spin")} />
              </button>
            </div>
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed markdown-body">
              <p>
                {lang === "zh" 
                  ? "AI 正在实时监控 market 波动、巨鲸动向及宏观新闻。点击上方按钮生成最新的策略建议。" 
                  : "AI is monitoring market volatility, whale movements, and macro news in real-time. Click the button above to generate the latest strategy suggestions."}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Trading Mode */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <ShieldAlert className="w-5 h-5 mr-2 text-indigo-500" />
                {lang === "zh" ? "交易模式" : "Trading Mode"}
              </h2>
              <div className="flex gap-4">
                <button 
                  onClick={() => setTradingMode("paper")}
                  className={cn("flex-1 p-4 rounded-xl border-2 text-left transition-all", tradingMode === "paper" ? "border-blue-500 bg-blue-50" : "border-slate-100 hover:border-slate-200")}
                >
                  <div className="font-bold text-slate-900 mb-1">{lang === "zh" ? "模拟交易" : "Paper Trading"}</div>
                  <div className="text-xs text-slate-500">{lang === "zh" ? "使用虚拟资金测试策略" : "Test strategies with virtual funds"}</div>
                </button>
                <button 
                  onClick={() => setTradingMode("live")}
                  className={cn("flex-1 p-4 rounded-xl border-2 text-left transition-all", tradingMode === "live" ? "border-red-500 bg-red-50" : "border-slate-100 hover:border-slate-200")}
                >
                  <div className="font-bold text-slate-900 mb-1">{lang === "zh" ? "真实交易" : "Live Trading"}</div>
                  <div className="text-xs text-slate-500">{lang === "zh" ? "使用真实钱包资金执行" : "Execute with real wallet funds"}</div>
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <Wallet className="w-5 h-5 mr-2 text-indigo-500" />
                {lang === "zh" ? "身份授权与钱包" : "Auth & Wallet"}
              </h2>
              
              <div className="flex p-1 bg-slate-100 rounded-lg mb-4">
                <button 
                  onClick={() => setAuthMethod("wallet")}
                  className={cn("flex-1 py-1.5 text-xs font-medium rounded-md transition-all", authMethod === "wallet" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                >
                  {lang === "zh" ? "钱包授权" : "Wallet Connect"}
                </button>
                <button 
                  onClick={() => setAuthMethod("privateKey")}
                  className={cn("flex-1 py-1.5 text-xs font-medium rounded-md transition-all", authMethod === "privateKey" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                >
                  {lang === "zh" ? "私钥登录" : "Private Key"}
                </button>
              </div>

              <div className="space-y-4">
                {authMethod === "wallet" ? (
                  <div className="space-y-3">
                    {isWalletConnected ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white mr-3">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-emerald-700">{lang === "zh" ? "已连接" : "Connected"}</div>
                            <div className="text-xs text-emerald-600 font-mono">{walletAddress}</div>
                          </div>
                        </div>
                        <button onClick={() => setIsWalletConnected(false)} className="text-xs text-slate-400 hover:text-red-500 underline">
                          {lang === "zh" ? "断开" : "Disconnect"}
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={handleConnectWallet}
                        disabled={isTestingConnection}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center shadow-lg shadow-indigo-200"
                      >
                        {isTestingConnection ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Wallet className="w-4 h-4 mr-2" />}
                        {lang === "zh" ? "连接 Web3 钱包" : "Connect Web3 Wallet"}
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">
                      {lang === "zh" ? "钱包私钥" : "Wallet Private Key"}
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="password" 
                        value={walletConfig.privateKey}
                        onChange={(e) => setWalletConfig({ ...walletConfig, privateKey: e.target.value })}
                        placeholder="0x..."
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      />
                      <button 
                        onClick={() => handleSaveConfig("privateKey", walletConfig.privateKey)}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                      >
                        {lang === "zh" ? "保存" : "Save"}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5 italic">
                      {lang === "zh" ? "私钥将用于服务器上的交易机器人执行真实订单。" : "Private key will be used by the server-side bot to execute live orders."}
                    </p>
                  </div>
                )}
                
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">{lang === "zh" ? "并发限制" : "Concurrency"}</span>
                    <span className="font-bold text-slate-900">1 (Default)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {lang === "zh" ? "真实交易由平台服务器统一处理，默认并发为 1。" : "Live trades are processed by platform servers with a default concurrency of 1."}
                  </p>
                </div>
              </div>
            </div>

            {/* Server Deployment */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <Server className="w-5 h-5 mr-2 text-indigo-500" />
                {lang === "zh" ? "后台服务器部署 (防封控)" : "Server Deployment (Anti-ban)"}
              </h2>
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  {lang === "zh" ? "平台将安排部署 BOT 在不同服务器执行交易，以绕过 Polymarket 区域限制。" : "The platform will deploy BOTs on different servers to bypass Polymarket region restrictions."}
                </p>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">
                    {lang === "zh" ? "执行节点区域" : "Execution Node Region"}
                  </label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                    <option>Auto-Select (Recommended)</option>
                    <option>Europe (Frankfurt)</option>
                    <option>Asia (Tokyo)</option>
                    <option>South America (São Paulo)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Strategy Config */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-indigo-500" />
                {lang === "zh" ? "策略管理" : "Strategy Management"}
              </h2>
              
              {/* Custom Strategy Input */}
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                  {lang === "zh" ? "自定义 AI 策略描述" : "Custom AI Strategy Description"}
                </label>
                <textarea 
                  value={customStrategy}
                  onChange={(e) => setCustomStrategy(e.target.value)}
                  placeholder={lang === "zh" ? "例如：当交易量突增且胜率大于 80% 的巨鲸买入时，跟单 50 USDC..." : "e.g., When volume spikes and whales with >80% win rate buy, copy 50 USDC..."}
                  className="w-full h-24 p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                />
                <ActionButton 
                  onClick={handleGenerateStrategy}
                  loading={isGeneratingStrategy}
                  showCancel={true}
                  onCancel={cancelGenerate}
                  disabled={!customStrategy}
                  className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                >
                  {!isGeneratingStrategy && <BrainCircuit className="w-3 h-3 mr-2" />}
                  {lang === "zh" ? "AI 生成并部署策略" : "Generate & Deploy Strategy"}
                </ActionButton>
              </div>

              <div className="space-y-4">
                {dbStrategies.map((strat) => (
                  <div key={strat.id} className={cn("p-4 rounded-xl border transition-colors", strat.is_active ? "border-indigo-500 bg-indigo-50/30" : "border-slate-200")}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{strat.name}</h3>
                        <p className="text-[10px] text-slate-500">{strat.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold uppercase", strat.type === 'built-in' ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700")}>
                          {strat.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">{lang === "zh" ? "交易模式" : "Trading Mode"}</label>
                        <select 
                          value={strat.mode}
                          onChange={(e) => updateStrategy(strat.id, { mode: e.target.value })}
                          className={cn("w-full px-2 py-1 border rounded text-xs outline-none font-bold", strat.mode === 'live' ? "border-red-200 text-red-600 bg-red-50" : "border-blue-200 text-blue-600 bg-blue-50")}
                        >
                          <option value="paper">{lang === "zh" ? "模拟 (Paper)" : "Paper"}</option>
                          <option value="live">{lang === "zh" ? "真实 (Live)" : "Live"}</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">{lang === "zh" ? "状态" : "Status"}</label>
                        <button 
                          onClick={() => updateStrategy(strat.id, { is_active: !strat.is_active })}
                          className={cn("w-full px-2 py-1 rounded text-xs font-bold transition-colors", strat.is_active ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600")}
                        >
                          {strat.is_active ? (lang === "zh" ? "已启用" : "Active") : (lang === "zh" ? "已禁用" : "Disabled")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
