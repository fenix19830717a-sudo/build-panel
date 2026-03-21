import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Square,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  MoreVertical,
  User,
  Flag,
  Zap,
  Globe,
  Database,
  Users,
  BrainCircuit,
} from "lucide-react";
import { cn } from "../components/Layout";
import { ActionButton } from "../components/ActionButton";

const statusMap: Record<string, { label: { zh: string, en: string }; color: string; bg: string }> =
  {
    running: {
      label: { zh: "运行中", en: "Running" },
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    paused: { label: { zh: "已暂停", en: "Paused" }, color: "text-amber-600", bg: "bg-amber-100" },
    completed: { label: { zh: "已完成", en: "Completed" }, color: "text-blue-600", bg: "bg-blue-100" },
    failed: { label: { zh: "异常中断", en: "Failed" }, color: "text-red-600", bg: "bg-red-100" },
  };

export function TaskManagement({ lang }: { lang: "zh" | "en" }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskCategory, setTaskCategory] = useState<"domestic" | "overseas_customs" | "overseas_leads" | "web3_markets">("domestic");
  const [dataSourceType, setDataSourceType] = useState("google_maps");
  
  const [newTask, setNewTask] = useState({
    name: "",
    platform: "1688",
    priority: "Medium",
    creator: "Admin",
    type: "domestic",
    crawler_mode: "standard"
  });

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/crawler/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    
    // Check for query params to pre-fill
    const params = new URLSearchParams(window.location.search);
    const app = params.get('app');
    if (app) {
      setShowCreateModal(true);
      if (app === 'polymarket') {
        setTaskCategory('web3_markets');
        setNewTask(prev => ({ ...prev, name: "Polymarket Market Scraper", platform: "Polymarket" }));
      } else if (app === 'b2b_leads') {
        setTaskCategory('overseas_leads');
        setNewTask(prev => ({ ...prev, name: "B2B Lead Mining Task", platform: "Google Maps" }));
      }
    }
  }, []);

  const handleCreateTask = async () => {
    const id = `T-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await fetch("/api/crawler/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...newTask, 
          id, 
          type: taskCategory === 'domestic' ? 'domestic' : 'overseas',
          crawler_mode: newTask.crawler_mode
        })
      });
      setShowCreateModal(false);
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/crawler/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm(lang === "zh" ? "确定要删除此任务吗？" : "Are you sure you want to delete this task?")) return;
    try {
      await fetch(`/api/crawler/tasks/${id}`, { method: "DELETE" });
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">
          {lang === "zh" ? "爬虫任务管理" : "Crawler Task Management"}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20 w-fit"
          >
            <Plus className="w-4 h-4 mr-2" />
            {lang === "zh" ? "新建任务" : "New Task"}
          </button>
        </div>
      </div>

      {/* Quick Launch Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 'polymarket', icon: BrainCircuit, title: lang === 'zh' ? 'Polymarket 抓取' : 'Polymarket Scrape', color: 'bg-violet-500', category: 'web3_markets' },
          { id: 'b2b_leads', icon: Users, title: lang === 'zh' ? 'B2B 客户挖掘' : 'B2B Lead Mining', color: 'bg-indigo-500', category: 'overseas_leads' },
          { id: 'customs', icon: Database, title: lang === 'zh' ? '海关数据采集' : 'Customs Data', color: 'bg-blue-500', category: 'overseas_customs' },
          { id: 'domestic', icon: Globe, title: lang === 'zh' ? '国内平台爬取' : 'Domestic Scrape', color: 'bg-emerald-500', category: 'domestic' },
        ].map(app => (
          <button
            key={app.id}
            onClick={() => {
              setTaskCategory(app.category as any);
              setNewTask(prev => ({ ...prev, name: `${app.title} Task`, platform: app.id === 'polymarket' ? 'Polymarket' : '1688' }));
              setShowCreateModal(true);
            }}
            className="flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group text-left"
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white mr-4 shadow-lg", app.color)}>
              <app.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{app.title}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">{lang === 'zh' ? '快速启动' : 'Quick Start'}</div>
            </div>
            <Zap className="w-4 h-4 ml-auto text-slate-200 group-hover:text-amber-400 transition-colors" />
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={lang === "zh" ? "搜索任务名称、ID..." : "Search task name, ID..."}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none">
            <option value="">{lang === "zh" ? "全部模式" : "All Modes"}</option>
            <option value="standard">{lang === "zh" ? "普通爬虫" : "Standard Crawler"}</option>
            <option value="quant">{lang === "zh" ? "量化交易爬虫" : "Quant Crawler"}</option>
          </select>
          <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none">
            <option value="">{lang === "zh" ? "全部类型" : "All Types"}</option>
            <option value="domestic">{lang === "zh" ? "国内数据" : "Domestic Data"}</option>
            <option value="overseas">{lang === "zh" ? "海外数据" : "Overseas Data"}</option>
          </select>
          <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none">
            <option value="">{lang === "zh" ? "全部状态" : "All Status"}</option>
            <option value="running">{lang === "zh" ? "运行中" : "Running"}</option>
            <option value="paused">{lang === "zh" ? "已暂停" : "Paused"}</option>
            <option value="completed">{lang === "zh" ? "已完成" : "Completed"}</option>
            <option value="failed">{lang === "zh" ? "异常" : "Failed"}</option>
          </select>
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 text-sm font-semibold text-slate-600">
                  {lang === "zh" ? "任务 ID" : "Task ID"}
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  {lang === "zh" ? "任务名称" : "Task Name"}
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  {lang === "zh" ? "模式" : "Mode"}
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  {lang === "zh" ? "创建者" : "Creator"}
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  {lang === "zh" ? "优先级" : "Priority"}
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  {lang === "zh" ? "状态" : "Status"}
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  {lang === "zh" ? "进度" : "Progress"}
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  {lang === "zh" ? "最后运行" : "Last Run"}
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">
                  {lang === "zh" ? "操作" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="p-4 text-sm font-mono text-slate-500">
                    {task.id}
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      {task.name}
                      {task.type === 'overseas' && (
                        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded text-[10px] font-bold uppercase tracking-wider">
                          Global
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                      task.crawler_mode === 'quant' ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-slate-100 text-slate-600"
                    )}>
                      {task.crawler_mode === 'quant' ? (lang === 'zh' ? '量化' : 'Quant') : (lang === 'zh' ? '普通' : 'Standard')}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {task.creator || 'Admin'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit",
                      task.priority === 'High' ? "bg-red-100 text-red-600" :
                      task.priority === 'Medium' ? "bg-amber-100 text-amber-600" :
                      "bg-slate-100 text-slate-600"
                    )}>
                      <Flag className="w-3 h-3" />
                      {task.priority || 'Medium'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium flex w-fit items-center",
                        statusMap[task.status]?.bg || "bg-slate-100",
                        statusMap[task.status]?.color || "text-slate-600",
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full mr-1.5",
                          task.status === "running"
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-current",
                        )}
                      />
                      {statusMap[task.status].label[lang]}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            task.status === "failed"
                              ? "bg-red-500"
                              : "bg-emerald-500",
                          )}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-500 w-8">
                        {task.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{task.lastRun}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {task.status === "running" ? (
                        <ActionButton
                          onClick={() => handleToggleStatus(task.id, "paused")}
                          className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-md"
                          title={lang === "zh" ? "暂停" : "Pause"}
                        >
                          <Pause className="w-4 h-4" />
                        </ActionButton>
                      ) : (
                        <ActionButton
                          onClick={() => handleToggleStatus(task.id, "running")}
                          className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md"
                          title={lang === "zh" ? "启动" : "Start"}
                        >
                          <Play className="w-4 h-4" />
                        </ActionButton>
                      )}
                      <ActionButton
                        onClick={() => handleToggleStatus(task.id, "paused")}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                        title={lang === "zh" ? "停止" : "Stop"}
                      >
                        <Square className="w-4 h-4" />
                      </ActionButton>
                      <button
                        className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md"
                        title={lang === "zh" ? "编辑" : "Edit"}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <ActionButton
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                        title={lang === "zh" ? "删除" : "Delete"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <div>{lang === "zh" ? "共 124 条记录" : "Total 124 records"}</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50">
              {lang === "zh" ? "上一页" : "Prev"}
            </button>
            <button className="px-3 py-1 bg-emerald-50 text-emerald-600 font-medium rounded-md">
              1
            </button>
            <button className="px-3 py-1 hover:bg-slate-50 rounded-md">
              2
            </button>
            <button className="px-3 py-1 hover:bg-slate-50 rounded-md">
              3
            </button>
            <span className="px-2 py-1">...</span>
            <button className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50">
              {lang === "zh" ? "下一页" : "Next"}
            </button>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-900">
                {lang === "zh" ? "新建爬虫任务" : "Create Crawler Task"}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <MoreVertical className="w-5 h-5 rotate-90" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Crawler Mode Selection */}
              <div className="flex gap-4 p-1 bg-slate-100 rounded-xl w-fit">
                <button 
                  onClick={() => setNewTask({ ...newTask, crawler_mode: "standard" })}
                  className={cn("px-6 py-2 rounded-lg text-sm font-bold transition-all", newTask.crawler_mode === "standard" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                >
                  {lang === "zh" ? "普通爬虫" : "Standard Crawler"}
                </button>
                <button 
                  onClick={() => setNewTask({ ...newTask, crawler_mode: "quant" })}
                  className={cn("px-6 py-2 rounded-lg text-sm font-bold transition-all", newTask.crawler_mode === "quant" ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                >
                  <Zap className="w-3.5 h-3.5 inline mr-1.5" />
                  {lang === "zh" ? "量化交易爬虫" : "Quant Crawler"}
                </button>
              </div>

              {/* Task Category Selection */}
              <div className="flex gap-4">
                <button 
                  onClick={() => setTaskCategory("domestic")}
                  className={cn("flex-1 p-4 rounded-xl border-2 text-left transition-all", taskCategory === "domestic" ? "border-emerald-500 bg-emerald-50" : "border-slate-100 hover:border-slate-200")}
                >
                  <div className="font-bold text-slate-900 mb-1">{lang === "zh" ? "国内数据爬取" : "Domestic Data"}</div>
                  <div className="text-xs text-slate-500">{lang === "zh" ? "1688、慧聪网等国内B2B平台" : "1688, HC360, etc."}</div>
                </button>
                <button 
                  onClick={() => setTaskCategory("overseas_customs")}
                  className={cn("flex-1 p-4 rounded-xl border-2 text-left transition-all", taskCategory === "overseas_customs" ? "border-indigo-500 bg-indigo-50" : "border-slate-100 hover:border-slate-200")}
                >
                  <div className="font-bold text-slate-900 mb-1">{lang === "zh" ? "海外海关数据" : "Overseas Customs"}</div>
                  <div className="text-xs text-slate-500">{lang === "zh" ? "各国进出口贸易单据" : "Import/Export trade data"}</div>
                </button>
                <button 
                  onClick={() => setTaskCategory("overseas_leads")}
                  className={cn("flex-1 p-4 rounded-xl border-2 text-left transition-all", taskCategory === "overseas_leads" ? "border-indigo-500 bg-indigo-50" : "border-slate-100 hover:border-slate-200")}
                >
                  <div className="font-bold text-slate-900 mb-1">{lang === "zh" ? "海外潜在客户" : "Overseas Leads"}</div>
                  <div className="text-xs text-slate-500">{lang === "zh" ? "LinkedIn、企业黄页等" : "LinkedIn, Yellow Pages, etc."}</div>
                </button>
                <button 
                  onClick={() => setTaskCategory("web3_markets")}
                  className={cn("flex-1 p-4 rounded-xl border-2 text-left transition-all", taskCategory === "web3_markets" ? "border-violet-500 bg-violet-50" : "border-slate-100 hover:border-slate-200")}
                >
                  <div className="font-bold text-slate-900 mb-1">{lang === "zh" ? "特定市场 (Web3)" : "Web3 Markets"}</div>
                  <div className="text-xs text-slate-500">{lang === "zh" ? "Polymarket、巨鲸追踪等" : "Polymarket, Whale Trackers"}</div>
                </button>
              </div>

              {/* Basic Config */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs mr-2">
                    1
                  </span>
                  {lang === "zh" ? "基础配置" : "Basic Configuration"}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      {lang === "zh" ? "任务名称" : "Task Name"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTask.name}
                      onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                      placeholder={lang === "zh" ? "例如：美国海关数据" : "e.g., US Customs Data"}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      {lang === "zh" ? "优先级" : "Priority"}
                    </label>
                    <select 
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    >
                      <option value="Low">{lang === "zh" ? "低" : "Low"}</option>
                      <option value="Medium">{lang === "zh" ? "中" : "Medium"}</option>
                      <option value="High">{lang === "zh" ? "高" : "High"}</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      {lang === "zh" ? "创建者" : "Creator"}
                    </label>
                    <input
                      type="text"
                      value={newTask.creator}
                      onChange={(e) => setNewTask({ ...newTask, creator: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    />
                  </div>
                  
                  {taskCategory === "domestic" && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        {lang === "zh" ? "目标平台" : "Target Platform"} <span className="text-red-500">*</span>
                      </label>
                      <select 
                        value={newTask.platform}
                        onChange={(e) => setNewTask({ ...newTask, platform: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                      >
                        <option>1688</option>
                        <option>慧聪网</option>
                        <option>中国制造网</option>
                      </select>
                    </div>
                  )}

                  {taskCategory === "overseas_customs" && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        {lang === "zh" ? "目标国家/地区" : "Target Country/Region"} <span className="text-red-500">*</span>
                      </label>
                      <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none">
                        <option>美国 (US CBP)</option>
                        <option>欧盟 (TARIC)</option>
                        <option>印度 (CBIC)</option>
                        <option>东南亚</option>
                      </select>
                    </div>
                  )}

                  {taskCategory === "overseas_leads" && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        {lang === "zh" ? "数据源类型" : "Data Source Type"} <span className="text-red-500">*</span>
                      </label>
                      <select 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                        value={dataSourceType}
                        onChange={(e) => setDataSourceType(e.target.value)}
                      >
                        <option value="google_maps">{lang === "zh" ? "Google Maps (地图搜索)" : "Google Maps Search"}</option>
                        <option value="google_search">{lang === "zh" ? "Google Search (网页搜索)" : "Google Web Search"}</option>
                        <option value="linkedin">{lang === "zh" ? "LinkedIn (领英)" : "LinkedIn"}</option>
                        <option value="yelp">Yelp</option>
                        <option value="alibaba">Alibaba.com (Int)</option>
                        <option value="yellow_pages">Yellow Pages</option>
                      </select>
                    </div>
                  )}

                  {taskCategory === "overseas_leads" && dataSourceType === "google_maps" && (
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-sm font-medium text-slate-700">
                        {lang === "zh" ? "目标区域/城市" : "Target Area/City"} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                        placeholder={lang === "zh" ? "例如：New York, London, Tokyo" : "e.g., New York, London, Tokyo"}
                      />
                    </div>
                  )}

                  {taskCategory === "web3_markets" && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        {lang === "zh" ? "数据源类型" : "Data Source Type"} <span className="text-red-500">*</span>
                      </label>
                      <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none">
                        <option value="polymarket_markets">{lang === "zh" ? "Polymarket 市场赔率/交易量" : "Polymarket Odds/Volume"}</option>
                        <option value="polymarket_whales">{lang === "zh" ? "Polymarket 巨鲸账号追踪" : "Polymarket Whale Tracker"}</option>
                        <option value="polymarket_accounts">{lang === "zh" ? "Polymarket 高胜率账号交易平台" : "Polymarket Account Trading"}</option>
                        <option value="third_party_data">{lang === "zh" ? "第三方预测数据平台" : "3rd-Party Prediction Data"}</option>
                      </select>
                    </div>
                  )}

                  {taskCategory === "web3_markets" && (
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-sm font-medium text-slate-700">
                        {lang === "zh" ? "目标市场ID / 钱包地址 / 关键词" : "Market ID / Wallet / Keywords"} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                        placeholder={lang === "zh" ? "例如：0x123... 或 Trump vs Biden" : "e.g., 0x123... or Trump vs Biden"}
                      />
                    </div>
                  )}

                  {taskCategory === "web3_markets" && (
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-sm font-medium text-slate-700">
                        {lang === "zh" ? "API Key (可选，用于特定第三方平台)" : "API Key (Optional, for 3rd-party)"}
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                        placeholder={lang === "zh" ? "输入相关平台的 API Key" : "Enter API Key"}
                      />
                    </div>
                  )}

                  {taskCategory !== "domestic" && taskCategory !== "web3_markets" && (
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-sm font-medium text-slate-700">
                        {lang === "zh" ? "语言偏好" : "Language Preference"}
                      </label>
                      <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none">
                        <option>{lang === "zh" ? "保留原始语言" : "Keep Original Language"}</option>
                        <option>{lang === "zh" ? "自动翻译为中文 (需配置API)" : "Auto Translate to Chinese"}</option>
                        <option>{lang === "zh" ? "自动翻译为英文 (需配置API)" : "Auto Translate to English"}</option>
                      </select>
                    </div>
                  )}

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-sm font-medium text-slate-700">
                      {lang === "zh" ? "搜索关键词 / HS编码" : "Search Keywords / HS Code"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                      placeholder={lang === "zh" ? "多个关键词用逗号分隔" : "Comma separated keywords"}
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Config */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs mr-2">
                    2
                  </span>
                  {lang === "zh" ? "高级配置 (反爬与调度)" : "Advanced Config (Anti-bot & Schedule)"}
                  {newTask.crawler_mode === 'quant' && (
                    <span className="ml-3 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase border border-amber-200 animate-pulse">
                      {lang === 'zh' ? '量化模式已开启: 高时效/强反爬' : 'Quant Mode: High Timeliness / Anti-Scrape'}
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      {lang === "zh" ? "请求间隔 (秒)" : "Request Interval (s)"}
                      {newTask.crawler_mode === 'quant' && <span className="ml-1 text-[10px] text-amber-600 font-bold">(HFT Optimized)</span>}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={newTask.crawler_mode === 'quant' ? 0.1 : 3}
                        step={0.1}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                      />
                      <span className="text-slate-500">-</span>
                      <input
                        type="number"
                        defaultValue={newTask.crawler_mode === 'quant' ? 0.5 : 8}
                        step={0.1}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      {lang === "zh" ? "并发数" : "Concurrency"}
                      {newTask.crawler_mode === 'quant' && <span className="ml-1 text-[10px] text-amber-600 font-bold">(Max Performance)</span>}
                    </label>
                    <input
                      type="number"
                      defaultValue={newTask.crawler_mode === 'quant' ? 50 : 5}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      {lang === "zh" ? "代理池策略" : "Proxy Strategy"}
                    </label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none">
                      {newTask.crawler_mode === 'quant' ? (
                        <>
                          <option>{lang === "zh" ? "极速专线代理 (毫秒级延迟)" : "Ultra-fast Dedicated Proxy (ms latency)"}</option>
                          <option>{lang === "zh" ? "高频动态住宅IP" : "High-freq Dynamic Residential IP"}</option>
                        </>
                      ) : taskCategory === "domestic" ? (
                        <>
                          <option>{lang === "zh" ? "国内高匿动态IP" : "Domestic Dynamic IP"}</option>
                          <option>{lang === "zh" ? "国内长效静态IP" : "Domestic Static IP"}</option>
                        </>
                      ) : (
                        <>
                          <option>{lang === "zh" ? "海外住宅IP (推荐)" : "Overseas Residential IP"}</option>
                          <option>{lang === "zh" ? "海外专属节点" : "Overseas Dedicated Node"}</option>
                        </>
                      )}
                      <option>{lang === "zh" ? "不使用代理" : "No Proxy"}</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      {lang === "zh" ? "定时执行 (Cron)" : "Schedule (Cron)"}
                    </label>
                    <input
                      type="text"
                      placeholder="0 0 * * *"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none font-mono"
                    />
                  </div>
                  
                  {taskCategory !== "domestic" && taskCategory !== "web3_markets" && (
                    <>
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-sm font-medium text-slate-700">
                          {lang === "zh" ? "浏览器指纹配置" : "Browser Fingerprint"}
                        </label>
                        <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none">
                          <option>{lang === "zh" ? "自动匹配目标国家环境 (语言/时区)" : "Auto match target country (Lang/Timezone)"}</option>
                          <option>{lang === "zh" ? "随机指纹" : "Random Fingerprint"}</option>
                        </select>
                      </div>
                      <div className="space-y-1.5 col-span-2 flex items-center gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
                        <input type="checkbox" id="compliance" className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" defaultChecked />
                        <label htmlFor="compliance" className="text-sm font-medium text-red-800">
                          {lang === "zh" ? "开启合规校验 (强制遵守 robots.txt，自动脱敏个人信息)" : "Enable Compliance Check (Strict robots.txt, auto-mask PII)"}
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                {lang === "zh" ? "取消" : "Cancel"}
              </button>
              <button
                onClick={handleCreateTask}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20"
              >
                {lang === "zh" ? "保存并启动" : "Save & Start"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
