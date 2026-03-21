import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  RefreshCw,
  Play,
  Square,
  Package,
  Plus,
  X,
  Send,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
  Layers,
  Settings,
  Trash2
} from 'lucide-react';
import { cn } from '../components/Layout';

interface ServiceNode {
  id: number;
  node_id: string;
  name: string;
  region: string;
  type: string;
  port: number;
  status: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_apps: number;
  last_heartbeat: string;
  created_at: string;
}

interface NodeApp {
  id: number;
  node_id: string;
  app_id: string;
  app_name: string;
  version: string;
  status: string;
  memory_usage: number;
  request_count: number;
  error_count: number;
}

export const NodeManagement: React.FC<{ lang: 'zh' | 'en' }> = ({ lang }) => {
  const [nodes, setNodes] = useState<ServiceNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(null);
  const [nodeApps, setNodeApps] = useState<NodeApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deployData, setDeployData] = useState({
    appId: '',
    name: '',
    version: '1.0.0',
    entry: 'index.js'
  });
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    fetchNodes();
    const interval = setInterval(fetchNodes, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedNode) {
      fetchNodeApps(selectedNode.node_id);
    }
  }, [selectedNode]);

  const fetchNodes = async () => {
    try {
      const res = await fetch('/api/admin/nodes');
      const data = await res.json();
      setNodes(data);
    } catch (error) {
      console.error('Failed to fetch nodes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNodeApps = async (nodeId: string) => {
    try {
      const res = await fetch(`/api/admin/nodes/${nodeId}/apps`);
      const data = await res.json();
      setNodeApps(data);
    } catch (error) {
      console.error('Failed to fetch node apps:', error);
    }
  };

  const handleDeploy = async () => {
    if (!selectedNode || !deployData.appId) return;
    
    setIsDeploying(true);
    try {
      const res = await fetch(`/api/admin/nodes/${selectedNode.node_id}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: deployData.appId,
          manifest: {
            id: deployData.appId,
            name: deployData.name,
            version: deployData.version,
            entry: deployData.entry,
            routes: [],
            enabled: true
          }
        })
      });
      
      const data = await res.json();
      if (data.success) {
        alert(lang === 'zh' ? '部署命令已发送' : 'Deploy command sent');
        setShowDeployModal(false);
        fetchNodeApps(selectedNode.node_id);
      }
    } catch (error) {
      console.error('Deploy failed:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleUnload = async (appId: string) => {
    if (!selectedNode) return;
    
    if (!confirm(lang === 'zh' ? '确定要卸载此应用吗？' : 'Are you sure to unload this app?')) {
      return;
    }

    try {
      await fetch(`/api/admin/nodes/${selectedNode.node_id}/unload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId })
      });
      fetchNodeApps(selectedNode.node_id);
    } catch (error) {
      console.error('Unload failed:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return (
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            {lang === 'zh' ? '在线' : 'Online'}
          </span>
        );
      case 'offline':
        return (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full flex items-center gap-1">
            <WifiOff className="w-3 h-3" />
            {lang === 'zh' ? '离线' : 'Offline'}
          </span>
        );
      case 'busy':
        return (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {lang === 'zh' ? '繁忙' : 'Busy'}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {status}
          </span>
        );
    }
  };

  const getAppStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">{lang === 'zh' ? '运行中' : 'Running'}</span>;
      case 'loading':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full animate-pulse">{lang === 'zh' ? '加载中' : 'Loading'}</span>;
      case 'stopped':
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full">{lang === 'zh' ? '已停止' : 'Stopped'}</span>;
      case 'error':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">{lang === 'zh' ? '错误' : 'Error'}</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full">{status}</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'worker':
        return <Cpu className="w-4 h-4 text-blue-500" />;
      case 'proxy':
        return <Globe className="w-4 h-4 text-purple-500" />;
      case 'trading':
        return <Activity className="w-4 h-4 text-amber-500" />;
      case 'browser':
        return <Server className="w-4 h-4 text-emerald-500" />;
      default:
        return <Server className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return lang === 'zh' ? '刚刚' : 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} ${lang === 'zh' ? '分钟前' : 'min ago'}`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ${lang === 'zh' ? '小时前' : 'hrs ago'}`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Server className="w-8 h-8 text-indigo-600" />
            {lang === 'zh' ? '服务节点管理' : 'Service Node Management'}
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            {lang === 'zh'
              ? '管理分布式服务节点，支持应用热拔插、实时监控与远程部署。'
              : 'Manage distributed service nodes with hot-pluggable apps, real-time monitoring, and remote deployment.'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchNodes}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            {lang === 'zh' ? '刷新' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4" />
              {lang === 'zh' ? '节点列表' : 'Node List'}
            </h2>
            <span className="text-xs text-slate-400">
              {nodes.filter(n => n.status === 'online').length} / {nodes.length} {lang === 'zh' ? '在线' : 'online'}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {nodes.map(node => (
                <div
                  key={node.node_id}
                  onClick={() => setSelectedNode(node)}
                  className={cn(
                    'group relative bg-white p-5 rounded-2xl border transition-all cursor-pointer',
                    selectedNode?.node_id === node.node_id
                      ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/20'
                      : 'border-slate-100 hover:border-slate-300 hover:shadow-sm'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                        {getTypeIcon(node.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900">{node.name}</h3>
                          {getStatusBadge(node.status)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-mono">{node.node_id}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] text-slate-500">{node.region}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Package className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] text-slate-500">{node.active_apps} {lang === 'zh' ? '应用' : 'apps'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] text-slate-500">{formatTime(node.last_heartbeat)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={cn('w-5 h-5 text-slate-300 transition-transform', selectedNode?.node_id === node.node_id && 'rotate-90 text-indigo-500')} />
                  </div>

                  {node.status === 'online' && (
                    <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-900">{node.cpu_usage}%</div>
                        <div className="text-[10px] text-slate-400 uppercase">{lang === 'zh' ? 'CPU' : 'CPU'}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-900">{node.memory_usage}%</div>
                        <div className="text-[10px] text-slate-400 uppercase">{lang === 'zh' ? '内存' : 'Memory'}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-900">{node.disk_usage}%</div>
                        <div className="text-[10px] text-slate-400 uppercase">{lang === 'zh' ? '磁盘' : 'Disk'}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {selectedNode ? (
            <>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-indigo-500" />
                    {lang === 'zh' ? '节点详情' : 'Node Details'}
                  </h3>
                  {getStatusBadge(selectedNode.status)}
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{lang === 'zh' ? '节点ID' : 'Node ID'}</div>
                    <code className="text-xs font-mono text-slate-700 break-all">{selectedNode.node_id}</code>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{lang === 'zh' ? '类型' : 'Type'}</div>
                      <div className="text-sm font-medium text-slate-700 capitalize">{selectedNode.type}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{lang === 'zh' ? '端口' : 'Port'}</div>
                      <div className="text-sm font-medium text-slate-700">{selectedNode.port}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    {lang === 'zh' ? '已部署应用' : 'Deployed Apps'}
                  </h3>
                  <button
                    onClick={() => setShowDeployModal(true)}
                    disabled={selectedNode.status !== 'online'}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {lang === 'zh' ? '部署' : 'Deploy'}
                  </button>
                </div>

                <div className="space-y-3">
                  {nodeApps.length > 0 ? (
                    nodeApps.map(app => (
                      <div key={app.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900">{app.app_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">v{app.version}</span>
                          </div>
                          {getAppStatusBadge(app.status)}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <div className="flex items-center gap-3">
                            <span>{app.request_count} {lang === 'zh' ? '请求' : 'reqs'}</span>
                            {app.error_count > 0 && (
                              <span className="text-red-500">{app.error_count} {lang === 'zh' ? '错误' : 'errors'}</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleUnload(app.app_id)}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title={lang === 'zh' ? '卸载应用' : 'Unload app'}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">{lang === 'zh' ? '暂无已部署的应用' : 'No apps deployed'}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                <Server className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-900">{lang === 'zh' ? '选择一个节点' : 'Select a Node'}</h3>
              <p className="text-xs text-slate-500 mt-1">{lang === 'zh' ? '点击左侧节点查看详情与管理应用' : 'Click a node on the left to view details and manage apps'}</p>
            </div>
          )}
        </div>
      </div>

      {showDeployModal && selectedNode && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-indigo-500" />
                {lang === 'zh' ? '部署应用到节点' : 'Deploy App to Node'}
              </h3>
              <button onClick={() => setShowDeployModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === 'zh' ? '应用ID' : 'App ID'}</label>
                <input
                  type="text"
                  value={deployData.appId}
                  onChange={(e) => setDeployData({ ...deployData, appId: e.target.value })}
                  placeholder="e.g., trading-bot"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === 'zh' ? '应用名称' : 'App Name'}</label>
                <input
                  type="text"
                  value={deployData.name}
                  onChange={(e) => setDeployData({ ...deployData, name: e.target.value })}
                  placeholder="e.g., Trading Bot"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === 'zh' ? '版本' : 'Version'}</label>
                  <input
                    type="text"
                    value={deployData.version}
                    onChange={(e) => setDeployData({ ...deployData, version: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === 'zh' ? '入口文件' : 'Entry File'}</label>
                  <input
                    type="text"
                    value={deployData.entry}
                    onChange={(e) => setDeployData({ ...deployData, entry: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-700">
                {lang === 'zh'
                  ? `应用将被部署到 ${selectedNode.name} (${selectedNode.node_id})`
                  : `App will be deployed to ${selectedNode.name} (${selectedNode.node_id})`}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowDeployModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
              >
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={handleDeploy}
                disabled={isDeploying || !deployData.appId}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isDeploying && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                {lang === 'zh' ? '部署' : 'Deploy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeManagement;
