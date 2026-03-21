import { useState, useEffect } from "react";
import { 
  Settings, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Shield, 
  Globe, 
  Linkedin, 
  Database, 
  Mail,
  CheckCircle2,
  AlertCircle,
  Search,
  X
} from "lucide-react";
import { ActionButton } from "../components/ActionButton";
import { cn } from "../components/Layout";

interface SaaSConfig {
  id: number;
  name: string;
  type: 'linkedin' | 'customs' | 'crm' | 'email_automation';
  api_key: string;
  api_secret: string;
  base_url: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export function ThirdPartyIntegrations({ lang }: { lang: "zh" | "en" }) {
  const [configs, setConfigs] = useState<SaaSConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [newConfig, setNewConfig] = useState({
    name: "",
    type: "linkedin" as const,
    api_key: "",
    api_secret: "",
    base_url: ""
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch("/api/admin/saas-configs");
      const data = await res.json();
      setConfigs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const res = await fetch("/api/admin/saas-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        fetchConfigs();
        setShowAddModal(false);
        setNewConfig({ name: "", type: "linkedin", api_key: "", api_secret: "", base_url: "" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(lang === "zh" ? "确定要删除此配置吗？" : "Are you sure you want to delete this config?")) return;
    try {
      await fetch(`/api/admin/saas-configs/${id}`, { method: "DELETE" });
      fetchConfigs();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredConfigs = configs.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      case 'customs': return <Globe className="w-5 h-5" />;
      case 'crm': return <Database className="w-5 h-5" />;
      case 'email_automation': return <Mail className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {lang === "zh" ? "第三方 SaaS 接入" : "Third-Party SaaS Integrations"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {lang === "zh" ? "管理 CRM、海关数据、领英开发等第三方 API 授权" : "Manage CRM, Customs Data, LinkedIn and other SaaS API authorizations"}
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
        >
          <Plus className="w-4 h-4" />
          {lang === "zh" ? "添加接入" : "Add Integration"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={lang === "zh" ? "搜索服务名称或类型..." : "Search service name or type..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{lang === "zh" ? "服务名称" : "Service Name"}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{lang === "zh" ? "类型" : "Type"}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{lang === "zh" ? "API Key" : "API Key"}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{lang === "zh" ? "状态" : "Status"}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{lang === "zh" ? "创建时间" : "Created At"}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">{lang === "zh" ? "操作" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">{lang === "zh" ? "加载中..." : "Loading..."}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredConfigs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 opacity-20" />
                      <span className="text-sm">{lang === "zh" ? "暂无配置" : "No configurations found"}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredConfigs.map((config) => (
                <tr key={config.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                        {getIcon(config.type)}
                      </div>
                      <span className="text-sm font-bold text-slate-900">{config.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase">
                      {config.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                      {config.api_key ? `${config.api_key.substring(0, 8)}...` : "N/A"}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        config.status === 'active' ? "bg-emerald-500" : "bg-slate-300"
                      )} />
                      <span className="text-xs text-slate-600 capitalize">{config.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(config.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(config.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">{lang === "zh" ? "添加 SaaS 接入" : "Add SaaS Integration"}</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "服务名称" : "Service Name"}</label>
                  <input 
                    type="text" 
                    value={newConfig.name}
                    onChange={(e) => setNewConfig({...newConfig, name: e.target.value})}
                    placeholder="e.g. ImportGenius API"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "服务类型" : "Service Type"}</label>
                  <select 
                    value={newConfig.type}
                    onChange={(e) => setNewConfig({...newConfig, type: e.target.value as any})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="linkedin">LinkedIn Lead Gen</option>
                    <option value="customs">Customs Data</option>
                    <option value="crm">CRM (HubSpot/Salesforce)</option>
                    <option value="email_automation">Email Automation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">API Key</label>
                <input 
                  type="password" 
                  value={newConfig.api_key}
                  onChange={(e) => setNewConfig({...newConfig, api_key: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 font-mono" 
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">API Secret / Token (Optional)</label>
                <input 
                  type="password" 
                  value={newConfig.api_secret}
                  onChange={(e) => setNewConfig({...newConfig, api_secret: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 font-mono" 
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Base URL / Endpoint</label>
                <input 
                  type="text" 
                  value={newConfig.base_url}
                  onChange={(e) => setNewConfig({...newConfig, base_url: e.target.value})}
                  placeholder="https://api.provider.com/v1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                />
              </div>

              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 flex gap-3">
                <Shield className="w-5 h-5 text-indigo-600 shrink-0" />
                <p className="text-[11px] text-indigo-700 leading-relaxed">
                  {lang === "zh" ? "接入后，系统将通过 API 自动执行任务。请确保 API 权限包含读取和写入权限。" : "After integration, the system will execute tasks via API. Ensure the API key has both read and write permissions."}
                </p>
              </div>

              <ActionButton 
                onClick={handleAdd}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
              >
                {lang === "zh" ? "确认添加" : "Confirm Addition"}
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
