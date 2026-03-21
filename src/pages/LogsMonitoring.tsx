import { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Bug,
} from "lucide-react";
import { cn } from "../components/Layout";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const levelMap: Record<
  string,
  { icon: any; color: string; bg: string; label: string }
> = {
  info: {
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-100",
    label: "信息",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-100",
    label: "警告",
  },
  warn: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-100",
    label: "警告",
  },
  error: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-100",
    label: "错误",
  },
  success: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    label: "成功",
  },
};

const rateData = [
  { time: "12:00", rate: 450 },
  { time: "12:05", rate: 480 },
  { time: "12:10", rate: 420 },
  { time: "12:15", rate: 510 },
  { time: "12:20", rate: 490 },
  { time: "12:25", rate: 530 },
  { time: "12:30", rate: 500 },
];

export function LogsMonitoring({ lang }: { lang: "zh" | "en" }) {
  const [activeTab, setActiveTab] = useState("logs");
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterLevel, setFilterLevel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [filterLevel]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const url = filterLevel ? `/api/crawler/logs?level=${filterLevel}` : "/api/crawler/logs";
      const res = await fetch(url);
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateError = async () => {
    const sources = ['google_search', 'linkedin', 'custom_scraper'];
    const errors = [
      'Connection timeout',
      'Proxy authentication failed',
      'Captcha detected',
      'Invalid JSON response',
      'Target element not found'
    ];
    
    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    const randomError = errors[Math.floor(Math.random() * errors.length)];
    
    try {
      await fetch("/api/crawler/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: `TASK-${Math.floor(Math.random() * 1000)}`,
          level: 'error',
          source: randomSource,
          message: randomError,
          details: `Automatic simulation at ${new Date().toISOString()}`
        })
      });
      fetchLogs();
    } catch (error) {
      console.error("Failed to simulate error:", error);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.task_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">
          {lang === "zh" ? "日志与监控" : "Logs & Monitoring"}
        </h1>
        <div className="flex space-x-3">
          <button 
            onClick={simulateError}
            className="flex items-center px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            <Bug className="w-4 h-4 mr-2" />
            {lang === "zh" ? "模拟错误" : "Simulate Error"}
          </button>
          <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            {lang === "zh" ? "导出日志" : "Export Logs"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("logs")}
          className={cn(
            "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === "logs"
              ? "bg-white text-emerald-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200",
          )}
        >
          <Info
            className={cn(
              "w-4 h-4 mr-2",
              activeTab === "logs" ? "text-emerald-500" : "text-slate-400",
            )}
          />
          {lang === "zh" ? "运行日志" : "Run Logs"}
        </button>
        <button
          onClick={() => setActiveTab("monitor")}
          className={cn(
            "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === "monitor"
              ? "bg-white text-emerald-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200",
          )}
        >
          <Activity
            className={cn(
              "w-4 h-4 mr-2",
              activeTab === "monitor" ? "text-emerald-500" : "text-slate-400",
            )}
          />
          {lang === "zh" ? "实时监控" : "Real-time Monitor"}
        </button>
      </div>

      {activeTab === "logs" ? (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={lang === "zh" ? "搜索日志内容、任务ID..." : "Search logs, task ID..."}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              >
                <option value="">{lang === "zh" ? "所有级别" : "All Levels"}</option>
                <option value="info">{lang === "zh" ? "信息" : "Info"}</option>
                <option value="warning">{lang === "zh" ? "警告" : "Warning"}</option>
                <option value="error">{lang === "zh" ? "错误" : "Error"}</option>
              </select>
              <button 
                onClick={fetchLogs}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
              </button>
            </div>
          </div>

          {/* Log List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="p-4 text-sm font-semibold text-slate-600 w-48">
                    {lang === "zh" ? "时间" : "Time"}
                  </th>
                  <th className="p-4 text-sm font-semibold text-slate-600 w-24">
                    {lang === "zh" ? "级别" : "Level"}
                  </th>
                  <th className="p-4 text-sm font-semibold text-slate-600 w-32">
                    {lang === "zh" ? "任务 ID" : "Task ID"}
                  </th>
                  <th className="p-4 text-sm font-semibold text-slate-600 w-32">
                    {lang === "zh" ? "来源" : "Source"}
                  </th>
                  <th className="p-4 text-sm font-semibold text-slate-600">
                    {lang === "zh" ? "日志内容" : "Log Content"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-sm">
                {filteredLogs.map((log) => {
                  const levelInfo = levelMap[log.level] || levelMap.info;
                  const LevelIcon = levelInfo.icon;
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="p-4 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-md text-xs font-medium flex items-center w-fit",
                            levelInfo.bg,
                            levelInfo.color,
                          )}
                        >
                          <LevelIcon className="w-3 h-3 mr-1" />
                          {levelInfo.label}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{log.task_id}</td>
                      <td className="p-4 text-slate-600">{log.source}</td>
                      <td className="p-4">
                        <div className="text-slate-800">{log.message}</div>
                        {log.details && (
                          <div className="text-[10px] text-slate-400 mt-1 truncate max-w-md">
                            {log.details}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredLogs.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400">
                      {lang === "zh" ? "暂无日志数据" : "No log data available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <div>{lang === "zh" ? `共 ${filteredLogs.length} 条日志` : `Total ${filteredLogs.length} logs`}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rate Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">
              {lang === "zh" ? "实时抓取速率 (条/分钟)" : "Real-time Scrape Rate (items/min)"}
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rateData}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRate)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Error Rate Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">
              {lang === "zh" ? "反爬触发频次" : "Anti-scrape Triggers"}
            </h2>
            <div className="h-72 flex items-center justify-center text-slate-400 flex-col">
              <AlertTriangle className="w-12 h-12 mb-4 text-slate-300" />
              <p>{lang === "zh" ? "暂无异常数据" : "No anomaly data"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
