import React, { useState, useEffect } from "react";
import { 
  Layers, 
  RefreshCw, 
  Shield, 
  Code, 
  ExternalLink, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Package,
  History,
  Settings,
  Activity,
  Zap,
  ArrowUpCircle
} from "lucide-react";
import { cn } from "../components/Layout";

interface AppVersion {
  id: number;
  app_id: number;
  version_number: string;
  endpoint_url: string;
  changelog: string;
  is_stable: number;
  created_at: string;
}

interface AppConfig {
  id: number;
  app_id: number;
  config_key: string;
  config_value: string;
  description: string;
  is_public: number;
}

interface ModularApp {
  id: number;
  name: string;
  app_key: string;
  description: string;
  icon: string;
  status: 'active' | 'inactive' | 'upgrading';
  current_version_id: number;
  version_number: string;
  endpoint_url: string;
  changelog: string;
  public_configs?: Record<string, any>;
}

export const ModularAppCenter: React.FC<{ lang: "zh" | "en" }> = ({ lang }) => {
  const [apps, setApps] = useState<ModularApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<ModularApp | null>(null);
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [configs, setConfigs] = useState<AppConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState<number | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState<string | null>(null);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/modular-apps");
      const data = await res.json();
      setApps(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVersions = async (appId: number) => {
    try {
      const res = await fetch(`/api/modular-apps/${appId}/versions`);
      const data = await res.json();
      setVersions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchConfigs = async (appId: number) => {
    try {
      const res = await fetch(`/api/modular-apps/${appId}/configs`);
      const data = await res.json();
      setConfigs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateConfig = async (appId: number, config: Partial<AppConfig>) => {
    if (!config.config_key) return;
    setIsSavingConfig(config.config_key);
    try {
      await fetch(`/api/modular-apps/${appId}/configs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      await fetchConfigs(appId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingConfig(null);
    }
  };

  const handleUpgrade = async (appId: number, versionId: number) => {
    setIsUpgrading(appId);
    try {
      await fetch(`/api/modular-apps/${appId}/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version_id: versionId })
      });
      
      // Refresh apps after a delay to simulate upgrade
      setTimeout(fetchApps, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpgrading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {lang === 'zh' ? '运行中' : 'Active'}</span>;
      case 'upgrading':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full flex items-center gap-1 animate-pulse"><RefreshCw className="w-3 h-3 animate-spin" /> {lang === 'zh' ? '升级中' : 'Upgrading'}</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {lang === 'zh' ? '已停止' : 'Inactive'}</span>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Layers className="w-8 h-8 text-indigo-600" />
            {lang === "zh" ? "模块化应用管理中心" : "Modular App Center"}
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            {lang === "zh" 
              ? "基于微内核架构，支持应用独立开发、版本热更新与API解耦对接。确保B2B平台的高可用性与扩展性。" 
              : "Micro-kernel architecture supporting independent app development, hot updates, and API decoupling. Ensures high availability and scalability."}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-700">Platform v2.4.0 (Stable)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* App List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4" />
              {lang === "zh" ? "已安装模块" : "Installed Modules"}
            </h2>
            <button onClick={fetchApps} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <RefreshCw className={cn("w-4 h-4 text-slate-400", isLoading && "animate-spin")} />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {apps.map(app => (
                <div 
                  key={app.id}
                  onClick={() => {
                    setSelectedApp(app);
                    fetchVersions(app.id);
                    fetchConfigs(app.id);
                  }}
                  className={cn(
                    "group relative bg-white p-5 rounded-2xl border transition-all cursor-pointer",
                    selectedApp?.id === app.id 
                      ? "border-indigo-500 shadow-md ring-1 ring-indigo-500/20" 
                      : "border-slate-100 hover:border-slate-300 hover:shadow-sm"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-white transition-colors">
                        <Layers className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900">{app.name}</h3>
                          {getStatusBadge(app.status)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{app.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5">
                            <Zap className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] font-mono text-slate-400">Key: {app.app_key}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ArrowUpCircle className="w-3 h-3 text-indigo-500" />
                            <span className="text-[10px] font-bold text-indigo-600">v{app.version_number}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={cn("w-5 h-5 text-slate-300 transition-transform", selectedApp?.id === app.id && "rotate-90 text-indigo-500")} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details & Version Control */}
        <div className="space-y-6">
          {selectedApp ? (
            <>
              {/* App Meta */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{selectedApp.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">Module Config</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'zh' ? '当前端点' : 'Current Endpoint'}</span>
                      <ExternalLink className="w-3 h-3 text-slate-300" />
                    </div>
                    <code className="text-xs font-mono text-indigo-600 break-all">{selectedApp.endpoint_url}</code>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'zh' ? '对接接口' : 'Docking API'}</span>
                      <Code className="w-3 h-3 text-slate-300" />
                    </div>
                    <code className="text-xs font-mono text-slate-600 break-all">/api/app/{selectedApp.app_key}/*</code>
                  </div>
                </div>
              </div>

              {/* Backend Configuration (Platform Admin Only) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  {lang === "zh" ? "平台后端参数控制" : "Backend Configuration"}
                </h3>
                <p className="text-[10px] text-slate-500 mb-4">
                  {lang === 'zh' 
                    ? "此处参数仅由平台管理员控制，对终端用户不可见。用于控制并发、速率限制等核心逻辑。" 
                    : "These parameters are controlled by the platform admin and are hidden from end-users. Controls core logic like concurrency and rate limits."}
                </p>
                <div className="space-y-4">
                  {configs.map(config => (
                    <div key={config.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-900 font-mono">{config.config_key}</span>
                          {config.is_public === 1 ? (
                            <span className="px-1 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-bold rounded uppercase">Public</span>
                          ) : (
                            <span className="px-1 py-0.5 bg-slate-200 text-slate-600 text-[8px] font-bold rounded uppercase">Private</span>
                          )}
                        </div>
                        {isSavingConfig === config.config_key && <RefreshCw className="w-3 h-3 text-indigo-500 animate-spin" />}
                      </div>
                      <input 
                        type="text"
                        defaultValue={config.config_value}
                        onBlur={(e) => {
                          if (e.target.value !== config.config_value) {
                            handleUpdateConfig(selectedApp.id, { 
                              config_key: config.config_key, 
                              config_value: e.target.value,
                              description: config.description,
                              is_public: config.is_public
                            });
                          }
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none focus:border-indigo-500 transition-colors font-mono"
                      />
                      <p className="text-[9px] text-slate-400 mt-1.5">{config.description}</p>
                    </div>
                  ))}
                  
                  {configs.length === 0 && (
                    <div className="text-center py-4 text-slate-400 text-xs italic">
                      {lang === 'zh' ? '暂无配置项' : 'No configurations found'}
                    </div>
                  )}
                </div>
              </div>

              {/* Version History */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-500" />
                  {lang === "zh" ? "版本升级管理" : "Version Management"}
                </h3>
                <div className="space-y-3">
                  {versions.map(v => (
                    <div 
                      key={v.id}
                      className={cn(
                        "p-3 rounded-xl border transition-all",
                        selectedApp.current_version_id === v.id 
                          ? "bg-indigo-50 border-indigo-100" 
                          : "bg-white border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">v{v.version_number}</span>
                          {v.is_stable === 1 && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-bold rounded uppercase">Stable</span>}
                        </div>
                        <span className="text-[10px] text-slate-400">{new Date(v.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mb-3">{v.changelog}</p>
                      
                      {selectedApp.current_version_id === v.id ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600">
                          <CheckCircle2 className="w-3 h-3" />
                          {lang === 'zh' ? '当前版本' : 'Current Version'}
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleUpgrade(selectedApp.id, v.id)}
                          disabled={isUpgrading !== null}
                          className="w-full py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                          {isUpgrading === selectedApp.id ? (
                            <span className="flex items-center justify-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              {lang === 'zh' ? '升级中...' : 'Upgrading...'}
                            </span>
                          ) : (
                            lang === 'zh' ? '升级到此版本' : 'Upgrade to this version'
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                <Layers className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-900">{lang === 'zh' ? '选择一个应用' : 'Select an App'}</h3>
              <p className="text-xs text-slate-500 mt-1">{lang === 'zh' ? '点击左侧应用查看详情与版本管理' : 'Click an app on the left to view details and version control'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Architecture Info */}
      <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-indigo-300" />
            </div>
            <h4 className="font-bold">{lang === 'zh' ? '高可用保障' : 'High Availability'}</h4>
            <p className="text-xs text-indigo-200 leading-relaxed">
              {lang === 'zh' 
                ? "应用升级期间，平台核心功能不受影响。支持蓝绿部署与灰度发布，确保业务连续性。" 
                : "Core platform functions remain unaffected during app upgrades. Supports blue-green deployment and canary releases."}
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
              <RefreshCw className="w-5 h-5 text-indigo-300" />
            </div>
            <h4 className="font-bold">{lang === 'zh' ? '独立版本控制' : 'Independent Versioning'}</h4>
            <p className="text-xs text-indigo-200 leading-relaxed">
              {lang === 'zh' 
                ? "每个模块拥有独立的生命周期。可以针对特定客户或场景，单独升级某个应用版本。" 
                : "Each module has an independent lifecycle. Specific apps can be upgraded individually for certain customers or scenarios."}
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
              <Code className="w-5 h-5 text-indigo-300" />
            </div>
            <h4 className="font-bold">{lang === 'zh' ? 'API 接口对接' : 'API Docking'}</h4>
            <p className="text-xs text-indigo-200 leading-relaxed">
              {lang === 'zh' 
                ? "平台与应用通过标准 RESTful API 对接。应用可托管在任何环境，只需注册端点即可接入。" 
                : "Standard RESTful API docking between platform and apps. Apps can be hosted anywhere, just register the endpoint."}
            </p>
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />
      </div>
    </div>
  );
};
