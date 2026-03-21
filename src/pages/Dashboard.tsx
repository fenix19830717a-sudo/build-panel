import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Server,
  TrendingUp,
  Clock,
  Globe2,
  ShieldAlert,
  Database,
  Users,
  LayoutTemplate,
  Coins,
  MousePointerClick,
  ArrowRight,
  Check,
  FolderKanban,
  ChevronDown,
  Plus,
  X
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

import { useState, useEffect } from "react";
import { cn } from "../components/Layout";
import { ActionButton } from "../components/ActionButton";
import { GlobalOnboarding } from "../components/GlobalOnboarding";

const stats = {
  zh: [
    { name: "总任务数", value: "1,245", icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
    { name: "海外任务数", value: "432", icon: Globe2, color: "text-indigo-500", bg: "bg-indigo-50" },
    { name: "Web3任务数", value: "89", icon: Database, color: "text-violet-500", bg: "bg-violet-50" },
    { name: "今日抓取量", value: "24.5k", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
    { name: "合规拦截", value: "12", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50" },
  ],
  en: [
    { name: "Total Tasks", value: "1,245", icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
    { name: "Overseas Tasks", value: "432", icon: Globe2, color: "text-indigo-500", bg: "bg-indigo-50" },
    { name: "Web3 Tasks", value: "89", icon: Database, color: "text-violet-500", bg: "bg-violet-50" },
    { name: "Today's Volume", value: "24.5k", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
    { name: "Compliance Blocks", value: "12", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50" },
  ]
};

const trendData = [
  { time: "00:00", domestic: 1200, overseas: 400 },
  { time: "04:00", domestic: 800, overseas: 600 },
  { time: "08:00", domestic: 3400, overseas: 1200 },
  { time: "12:00", domestic: 5600, overseas: 2800 },
  { time: "16:00", domestic: 4800, overseas: 3100 },
  { time: "20:00", domestic: 6200, overseas: 4500 },
  { time: "24:00", domestic: 2500, overseas: 1800 },
];

const platformData = {
  zh: [
    { name: "美国海关", success: 4000, fail: 240 },
    { name: "Alibaba Int", success: 3000, fail: 139 },
    { name: "LinkedIn", success: 2000, fail: 980 },
    { name: "Google Maps", success: 3500, fail: 120 },
    { name: "Google Search", success: 2800, fail: 450 },
  ],
  en: [
    { name: "US CBP", success: 4000, fail: 240 },
    { name: "Alibaba Int", success: 3000, fail: 139 },
    { name: "LinkedIn", success: 2000, fail: 980 },
    { name: "Google Maps", success: 3500, fail: 120 },
    { name: "Google Search", success: 2800, fail: 450 },
  ]
};

export function Dashboard({ 
  lang, 
  role, 
  user,
  currentProject, 
  setCurrentProject 
}: { 
  lang: "zh" | "en", 
  role: "admin" | "user",
  user: any,
  currentProject: {id: number, name: string, icon: string} | null,
  setCurrentProject: (p: {id: number, name: string, icon: string}) => void
}) {
  const currentStats = stats[lang];
  const currentPlatformData = platformData[lang];

  const [showNewProject, setShowNewProject] = useState(false);
  const [projects, setProjects] = useState<{id: number, name: string, icon: string}[]>([]);
  const [realStats, setRealStats] = useState<{credits: number, leads_generated: number, site_visitors: number} | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        if (data.length > 0 && !currentProject) setCurrentProject(data[0]);
      });

    fetch("/api/user/stats")
      .then(res => res.json())
      .then(data => setRealStats(data));
  }, []);

  const handleAddProject = async (name: string) => {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon: "📁" })
    });
    const newProj = await response.json();
    setProjects([newProj, ...projects]);
    setCurrentProject(newProj);
    setShowNewProject(false);
  };

  if (!currentProject && role === "user") {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">{lang === "zh" ? "加载项目中..." : "Loading projects..."}</p>
        </div>
      </div>
    );
  }

  if (role === "user") {
    return (
      <div className="space-y-6" id="user-dashboard">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900" id="dashboard-title">
            {lang === "zh" ? `欢迎回来, ${user.name}` : `Welcome back, ${user.name}`}
          </h1>
          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
          
          <div className="relative group">
            <button className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 transition-all shadow-sm">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                {currentProject.icon}
              </div>
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{lang === "zh" ? "当前项目" : "Current Project"}</div>
                <div className="text-sm font-bold text-slate-900 flex items-center">
                  {currentProject.name}
                  <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />
                </div>
              </div>
            </button>
            
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40 p-2">
              {projects.map(proj => (
                <button 
                  key={proj.id}
                  onClick={() => setCurrentProject(proj)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors",
                    currentProject.id === proj.id ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded">{proj.icon}</span>
                  <span className="font-medium">{proj.name}</span>
                </button>
              ))}
              <div className="h-px bg-slate-100 my-2"></div>
              <button 
                onClick={() => setShowNewProject(true)}
                className="w-full flex items-center gap-3 p-2 rounded-lg text-sm text-indigo-600 font-bold hover:bg-indigo-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {lang === "zh" ? "新建项目" : "New Project"}
              </button>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            {lang === "zh" ? "充值点数" : "Buy Credits"}
          </button>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">{lang === "zh" ? "新建项目" : "New Project"}</h3>
              <button onClick={() => setShowNewProject(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddProject(formData.get("projectName") as string);
            }} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "项目名称" : "Project Name"}</label>
                <input 
                  name="projectName"
                  required
                  type="text" 
                  placeholder={lang === "zh" ? "例如: 户外运动器材" : "e.g., Outdoor Sports Gear"} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                />
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-[11px] text-indigo-700">
                {lang === "zh" ? "每个项目拥有独立的知识库、独立站、社媒账号及运营数据。" : "Each project has its own independent knowledge base, site, social accounts, and operational data."}
              </div>
              <ActionButton type="submit" className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                {lang === "zh" ? "确认创建" : "Create Project"}
              </ActionButton>
            </form>
          </div>
        </div>
      )}

        {/* Global Onboarding Roadmap */}
        <GlobalOnboarding lang={lang} />

        {/* User Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{lang === "zh" ? "剩余点数" : "Remaining Credits"}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{realStats?.credits?.toLocaleString() || "0"}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50"><Coins className="w-6 h-6 text-amber-500" /></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{lang === "zh" ? "挖掘到的客户" : "Leads Generated"}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{realStats?.leads_generated?.toLocaleString() || "0"}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50"><Users className="w-6 h-6 text-emerald-500" /></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{lang === "zh" ? "独立站访客 (本月)" : "Site Visitors (Month)"}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{realStats?.site_visitors?.toLocaleString() || "0"}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50"><Globe2 className="w-6 h-6 text-blue-500" /></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{lang === "zh" ? "AI 客服接待" : "AI Bot Chats"}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">856</p>
              </div>
              <div className="p-3 rounded-xl bg-violet-50"><Activity className="w-6 h-6 text-violet-500" /></div>
            </div>
          </div>
        </div>

        {/* User Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">{lang === "zh" ? "独立站流量趋势" : "Site Traffic Trend"}</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                  <Line type="monotone" dataKey="overseas" name={lang === "zh" ? "访客数" : "Visitors"} stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">{lang === "zh" ? "近期活动" : "Recent Activity"}</h2>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3"><Users className="w-4 h-4" /></div>
                <div className="flex-1"><p className="text-sm font-medium text-slate-900">{lang === "zh" ? "挖掘任务完成: 洛杉矶电子产品" : "Mining Task Completed: LA Electronics"}</p><p className="text-xs text-slate-500">2 hours ago</p></div>
                <div className="text-sm font-bold text-emerald-600">+45 Leads</div>
              </div>
              <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3"><LayoutTemplate className="w-4 h-4" /></div>
                <div className="flex-1"><p className="text-sm font-medium text-slate-900">{lang === "zh" ? "独立站自动部署成功" : "Site Auto-deployed Successfully"}</p><p className="text-xs text-slate-500">Yesterday</p></div>
              </div>
              <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-3"><Coins className="w-4 h-4" /></div>
                <div className="flex-1"><p className="text-sm font-medium text-slate-900">{lang === "zh" ? "生成市场调查报告" : "Generated Market Report"}</p><p className="text-xs text-slate-500">2 days ago</p></div>
                <div className="text-sm font-bold text-amber-600">-50 Credits</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="admin-dashboard">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900" id="dashboard-title">
          {lang === "zh" ? `平台总览 (Admin: ${user.name})` : `Platform Overview (Admin: ${user.name})`}
        </h1>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            {lang === "zh" ? "暂停所有爬虫" : "Pause Crawlers"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {currentStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">
            {lang === "zh" ? "抓取趋势 (国内 vs 海外)" : "Crawling Trend (Domestic vs Overseas)"}
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
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
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
                />
                <Line
                  type="monotone"
                  dataKey="domestic"
                  name={lang === "zh" ? "国内数据" : "Domestic"}
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="overseas"
                  name={lang === "zh" ? "海外数据" : "Overseas"}
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">
            {lang === "zh" ? "海外数据源状态" : "Overseas Data Source Status"}
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentPlatformData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
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
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
                />
                <Bar
                  dataKey="success"
                  name={lang === "zh" ? "成功" : "Success"}
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="fail"
                  name={lang === "zh" ? "失败/反爬" : "Fail/Block"}
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
