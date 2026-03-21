import { useState, useEffect } from "react";
import {
  Users,
  Settings,
  DatabaseBackup,
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Server,
  Terminal,
  MonitorPlay,
  ExternalLink,
  Bot,
  Play,
  Square,
  X,
  Send
} from "lucide-react";
import { cn } from "../components/Layout";

const tabs = [
  { id: "users", name: "用户管理", icon: Users },
  { id: "servers", name: "服务器管理", icon: Server },
  { id: "environments", name: "指纹环境管理", icon: MonitorPlay },
  { id: "system", name: "系统配置", icon: Settings },
  { id: "backup", name: "数据备份", icon: DatabaseBackup },
];

const users = [
  {
    id: "U-001",
    username: "admin",
    role: "超级管理员",
    status: "active",
    lastLogin: "2026-02-26 10:30",
    email: "admin@example.com",
  },
  {
    id: "U-002",
    username: "zhangsan",
    role: "普通用户",
    status: "active",
    lastLogin: "2026-02-25 09:15",
    email: "zhangsan@example.com",
  },
  {
    id: "U-003",
    username: "lisi",
    role: "普通用户",
    status: "disabled",
    lastLogin: "2026-02-20 18:00",
    email: "lisi@example.com",
  },
];

const mockServers = [
  {
    id: "S-001",
    name: "US-East-Proxy-1",
    ip: "192.168.1.100",
    port: 22,
    user: "root",
    provider: "AWS",
    providerUrl: "https://aws.amazon.com/console/",
    status: "running",
    type: "linux",
    dedicatedIps: 5,
    activeEnvironments: 12,
  },
  {
    id: "S-002",
    name: "EU-West-Scraper-1",
    ip: "10.0.0.55",
    port: 22,
    user: "ubuntu",
    provider: "DigitalOcean",
    providerUrl: "https://cloud.digitalocean.com/",
    status: "stopped",
    type: "linux",
    dedicatedIps: 0,
    activeEnvironments: 0,
  },
  {
    id: "S-003",
    name: "Win-Desktop-Bot",
    ip: "172.16.0.10",
    port: 3389,
    user: "Administrator",
    provider: "Azure",
    providerUrl: "https://portal.azure.com/",
    status: "running",
    type: "windows",
    dedicatedIps: 2,
    activeEnvironments: 4,
  }
];

const mockEnvironments = [
  {
    id: "E-001",
    userId: "U-002",
    username: "zhangsan",
    serverId: "S-001",
    ipType: "dedicated",
    ip: "45.77.12.34",
    status: "active",
    platform: "TikTok/FB",
    lastActive: "2026-03-01 14:20",
  },
  {
    id: "E-002",
    userId: "U-002",
    username: "zhangsan",
    serverId: "S-001",
    ipType: "shared",
    ip: "192.168.1.100",
    status: "active",
    platform: "Google/X",
    lastActive: "2026-03-02 09:10",
  },
  {
    id: "E-003",
    userId: "U-003",
    username: "lisi",
    serverId: "S-003",
    ipType: "dedicated",
    ip: "104.21.5.88",
    status: "idle",
    platform: "Amazon/eBay",
    lastActive: "2026-02-28 22:45",
  }
];

export function SystemManagement({ lang }: { lang: "zh" | "en" }) {
  const [activeTab, setActiveTab] = useState("servers");
  const [showAddServer, setShowAddServer] = useState(false);
  const [showAssignIp, setShowAssignIp] = useState(false);
  const [assignIpData, setAssignIpData] = useState({
    userId: "",
    ipAddress: "",
    serverId: "",
    expiresAt: ""
  });
  const [isAssigning, setIsAssigning] = useState(false);
  const [activeAiServer, setActiveAiServer] = useState<string | null>(null);
  const [aiCommand, setAiCommand] = useState("");
  const [servers, setServers] = useState<any[]>([]);
  const [environments, setEnvironments] = useState<any[]>([]);
  const [terminalLogs, setTerminalLogs] = useState([
    { type: "system", text: "Connected to server via secure AI proxy." },
    { type: "system", text: "AI Assistant is ready to execute commands." }
  ]);

  useEffect(() => {
    fetchServers();
    fetchEnvironments();
  }, []);

  const fetchServers = async () => {
    // For now, we'll still use mock servers but we could fetch them from an API
    // Since we don't have a dedicated servers table yet, we'll keep the mock ones
    // but update them with the new fields.
    setServers(mockServers);
  };

  const fetchEnvironments = async () => {
    try {
      const res = await fetch("/api/admin/environments");
      const data = await res.json();
      setEnvironments(data.length > 0 ? data : mockEnvironments);
    } catch (error) {
      console.error(error);
      setEnvironments(mockEnvironments);
    }
  };

  const handleAssignIp = async () => {
    if (!assignIpData.userId || !assignIpData.ipAddress || !assignIpData.serverId) {
      alert("请填写完整信息");
      return;
    }
    setIsAssigning(true);
    try {
      const res = await fetch("/api/admin/dedicated-ips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: assignIpData.userId,
          ip_address: assignIpData.ipAddress,
          server_id: assignIpData.serverId,
          expires_at: assignIpData.expiresAt
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("IP 分配成功");
        setShowAssignIp(false);
        fetchEnvironments();
      }
    } catch (error) {
      console.error(error);
      alert("分配失败");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAiSend = () => {
    if (!aiCommand.trim()) return;
    setTerminalLogs(prev => [...prev, { type: "user", text: aiCommand }]);
    const cmd = aiCommand;
    setAiCommand("");
    
    setTimeout(() => {
      setTerminalLogs(prev => [...prev, { type: "ai", text: `Executing: ${cmd}...` }]);
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, { type: "system", text: `[Success] Command executed successfully. Output logged.` }]);
      }, 1000);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">
          {lang === "zh" ? "系统管理" : "System Management"}
        </h1>
        {activeTab === "users" && (
          <button className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20 w-fit">
            <Plus className="w-4 h-4 mr-2" />
            {lang === "zh" ? "添加用户" : "Add User"}
          </button>
        )}
        {activeTab === "servers" && (
          <button 
            onClick={() => setShowAddServer(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm w-fit"
          >
            <Plus className="w-4 h-4 mr-2" />
            {lang === "zh" ? "添加服务器" : "Add Server"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200",
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 mr-2",
                  isActive ? "text-emerald-500" : "text-slate-400",
                )}
              />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        {activeTab === "users" && (
          <div>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-semibold text-slate-700">
                系统用户列表
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="p-4 text-sm font-semibold text-slate-600">
                      用户名
                    </th>
                    <th className="p-4 text-sm font-semibold text-slate-600">
                      邮箱
                    </th>
                    <th className="p-4 text-sm font-semibold text-slate-600">
                      角色权限
                    </th>
                    <th className="p-4 text-sm font-semibold text-slate-600">
                      状态
                    </th>
                    <th className="p-4 text-sm font-semibold text-slate-600">
                      最后登录
                    </th>
                    <th className="p-4 text-sm font-semibold text-slate-600 text-right">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="p-4 text-sm font-medium text-slate-900 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mr-3">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        {user.username}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {user.email}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-xs font-medium flex items-center w-fit",
                            user.role === "超级管理员"
                              ? "bg-violet-100 text-violet-600"
                              : "bg-slate-100 text-slate-600",
                          )}
                        >
                          {user.role === "超级管理员" && (
                            <ShieldCheck className="w-3 h-3 mr-1" />
                          )}
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            user.status === "active"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-slate-100 text-slate-500",
                          )}
                        >
                          {user.status === "active" ? "正常" : "禁用"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {user.lastLogin}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md"
                            title="编辑"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                            title="删除"
                            disabled={user.role === "超级管理员"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "servers" && (
          <div>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-semibold text-slate-700">
                服务器列表
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="p-4 text-sm font-semibold text-slate-600">名称 / IP</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">类型</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">独立IP / 环境</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">服务商</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">状态</th>
                    <th className="p-4 text-sm font-semibold text-slate-600 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {servers.map((server) => (
                    <tr key={server.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="font-medium text-slate-900 text-sm">{server.name}</div>
                        <div className="text-xs text-slate-500 flex items-center mt-0.5">
                          {server.ip}:{server.port} ({server.user})
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium flex items-center w-fit",
                          server.type === "linux" ? "bg-slate-100 text-slate-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {server.type === "linux" ? <Terminal className="w-3 h-3 mr-1" /> : <MonitorPlay className="w-3 h-3 mr-1" />}
                          {server.type === "linux" ? "SSH / Linux" : "RDP / Windows"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-900 font-medium">{server.dedicatedIps} IPs</div>
                        <div className="text-xs text-slate-500">{server.activeEnvironments} Environments</div>
                      </td>
                      <td className="p-4">
                        <a 
                          href={server.providerUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                        >
                          {server.provider}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit",
                          server.status === "running" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                        )}>
                          {server.status === "running" ? <Play className="w-3 h-3 mr-1" /> : <Square className="w-3 h-3 mr-1" />}
                          {server.status === "running" ? "运行中" : "已停止"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveAiServer(server.id)}
                            className="flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Bot className="w-3 h-3 mr-1.5" />
                            AI 连接配置
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md" title="编辑">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md" title="删除">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "environments" && (
          <div>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-semibold text-slate-700">
                指纹浏览器环境与独立IP管理
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowAssignIp(true)}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
                >
                  分配独立IP
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="p-4 text-sm font-semibold text-slate-600">所属用户</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">环境 ID / 平台</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">IP 类型 / 地址</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">宿主服务器</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">状态</th>
                    <th className="p-4 text-sm font-semibold text-slate-600 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {environments.map((env) => (
                    <tr key={env.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="font-medium text-slate-900 text-sm">{env.username}</div>
                        <div className="text-xs text-slate-500">ID: {env.userId}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900 text-sm">{env.id}</div>
                        <div className="text-xs text-slate-500">{env.platform}</div>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1 inline-block",
                          env.ipType === "dedicated" || env.ip_id ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {env.ipType === "dedicated" || env.ip_id ? "Dedicated IP" : "Shared IP"}
                        </span>
                        <div className="text-sm font-mono text-slate-700">{env.ip || env.ip_address}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-600">
                          {servers.find(s => s.id === env.serverId || s.id === env.server_id)?.name || "Unknown"}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          env.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                        )}>
                          {env.status === "active" ? "活跃" : "空闲"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md" title="迁移服务器">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md" title="释放IP">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {environments.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                <MonitorPlay className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>暂无活跃的用户指纹环境</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "system" && (
          <div className="p-6 max-w-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-6">
              全局参数配置
            </h3>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  默认重试次数
                </label>
                <input
                  type="number"
                  defaultValue={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  网络请求失败或解析异常时的默认重试次数。
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  数据存储方式
                </label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none">
                  <option>MySQL (结构化数据)</option>
                  <option>MongoDB (非结构化数据)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  日志保留天数
                </label>
                <input
                  type="number"
                  defaultValue={30}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20">
                  保存配置
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "backup" && (
          <div className="p-8 text-center text-slate-500">
            <DatabaseBackup className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              数据备份与恢复
            </h3>
            <p className="text-sm max-w-md mx-auto">
              备份任务配置、解析规则和已爬取的数据，支持一键恢复到指定备份点，防止数据丢失。
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                立即备份
              </button>
              <button className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                从备份恢复
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Assign IP Modal */}
      {showAssignIp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-amber-500" />
                分配独立住宅 IP
              </h3>
              <button onClick={() => setShowAssignIp(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">选择用户</label>
                <select 
                  value={assignIpData.userId}
                  onChange={(e) => setAssignIpData({ ...assignIpData, userId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                >
                  <option value="">请选择用户</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.username} ({u.role})</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">IP 地址</label>
                <input 
                  type="text" 
                  value={assignIpData.ipAddress}
                  onChange={(e) => setAssignIpData({ ...assignIpData, ipAddress: e.target.value })}
                  placeholder="例如: 103.21.x.x" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">宿主服务器</label>
                <select 
                  value={assignIpData.serverId}
                  onChange={(e) => setAssignIpData({ ...assignIpData, serverId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                >
                  <option value="">请选择服务器</option>
                  {servers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">过期时间</label>
                <input 
                  type="date" 
                  value={assignIpData.expiresAt}
                  onChange={(e) => setAssignIpData({ ...assignIpData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                />
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                独立住宅 IP 维护费为 $40/年，分配后将自动从用户余额或节点费中扣除。
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowAssignIp(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
                取消
              </button>
              <button 
                onClick={handleAssignIp}
                disabled={isAssigning}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isAssigning && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                确认分配
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddServer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center">
                <Server className="w-5 h-5 mr-2 text-indigo-500" />
                添加服务器
              </h3>
              <button onClick={() => setShowAddServer(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">服务器名称</label>
                <input type="text" placeholder="例如: US-East-Proxy-1" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">IP 地址</label>
                  <input type="text" placeholder="192.168.1.1" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">端口</label>
                  <input type="text" placeholder="22" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">用户名</label>
                  <input type="text" placeholder="root" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">密码 / 密钥</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">连接类型</label>
                  <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500">
                    <option value="linux">SSH (命令行)</option>
                    <option value="windows">RDP (远程桌面)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">服务商</label>
                  <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500">
                    <option value="aws">AWS</option>
                    <option value="azure">Azure</option>
                    <option value="do">DigitalOcean</option>
                    <option value="aliyun">阿里云</option>
                    <option value="other">其他</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowAddServer(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
                取消
              </button>
              <button onClick={() => setShowAddServer(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                保存服务器
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Terminal Modal */}
      {activeAiServer && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-800 flex flex-col h-[600px]">
            <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <div className="flex items-center">
                <Bot className="w-5 h-5 mr-2 text-indigo-400" />
                <span className="font-mono text-sm text-slate-300">
                  AI 连接会话: {mockServers.find(s => s.id === activeAiServer)?.name} ({mockServers.find(s => s.id === activeAiServer)?.ip})
                </span>
              </div>
              <button onClick={() => setActiveAiServer(null)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-3">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className={cn(
                  "flex items-start",
                  log.type === "user" ? "text-indigo-300" : log.type === "ai" ? "text-emerald-400" : "text-slate-400"
                )}>
                  <span className="mr-2 opacity-50 select-none">
                    {log.type === "user" ? ">" : log.type === "ai" ? "🤖" : "⚙️"}
                  </span>
                  <span className="break-all whitespace-pre-wrap">{log.text}</span>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-900">
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 focus-within:border-indigo-500 transition-colors">
                <span className="text-indigo-400 font-mono text-sm select-none">AI&gt;</span>
                <input 
                  type="text" 
                  value={aiCommand}
                  onChange={(e) => setAiCommand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                  placeholder="输入自然语言指令 (例如: 安装 Nginx 并配置反向代理...)"
                  className="flex-1 bg-transparent border-none outline-none text-slate-300 font-mono text-sm"
                />
                <button 
                  onClick={handleAiSend}
                  className="p-1 text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                <button onClick={() => setAiCommand("检查服务器运行状态和资源占用")} className="whitespace-nowrap px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition-colors">
                  检查状态
                </button>
                <button onClick={() => setAiCommand("安装 Docker 环境")} className="whitespace-nowrap px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition-colors">
                  安装 Docker
                </button>
                <button onClick={() => setAiCommand("部署 Polymarket 交易机器人环境")} className="whitespace-nowrap px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition-colors">
                  部署交易机器人
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
