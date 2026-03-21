import { useState } from "react";
import { 
  Users, 
  Plus, 
  Globe, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Shield, 
  LayoutGrid, 
  List, 
  Search,
  MoreVertical,
  Smartphone,
  Mail as MailIcon,
  Facebook,
  Chrome,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Settings,
  RefreshCw,
  AlertCircle,
  Lock,
  Monitor
} from "lucide-react";
import { cn } from "../../components/Layout";

interface PlatformAccount {
  id: string;
  name: string;
  icon: any;
  color: string;
  status: 'unregistered' | 'pending' | 'active' | 'banned';
  username?: string;
  apiAuthorized?: boolean;
}

interface AccountSet {
  id: string;
  name: string;
  country: string;
  phone: string;
  email: string;
  proxyIp: string;
  proxyType: 'platform' | 'dedicated' | 'residential';
  proxyExpiry?: string;
  platforms: PlatformAccount[];
  createdAt: string;
}

const INITIAL_PLATFORMS: PlatformAccount[] = [
  { id: 'google', name: 'Google/Gmail', icon: Chrome, color: 'text-blue-500', status: 'unregistered', apiAuthorized: false },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', status: 'unregistered', apiAuthorized: false },
  { id: 'tiktok', name: 'TikTok', icon: Smartphone, color: 'text-black', status: 'unregistered', apiAuthorized: false },
  { id: 'x', name: 'X (Twitter)', icon: Twitter, color: 'text-slate-900', status: 'unregistered', apiAuthorized: false },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600', status: 'unregistered', apiAuthorized: false },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', status: 'unregistered', apiAuthorized: false },
];

const mockProfiles = [
  { id: 'p1', name: 'LinkedIn Outreach - US', proxy: 'US-East (Residential)', os: 'Windows 11', browser: 'Chrome 120', status: 'running' },
  { id: 'p2', name: 'Google Ads - UK', proxy: 'UK-London (Static)', os: 'macOS 14', browser: 'Safari 17', status: 'stopped' },
  { id: 'p3', name: 'Polymarket Main', proxy: 'US-West (Dedicated)', os: 'Windows 10', browser: 'Firefox 121', status: 'stopped' },
];

const mockAccountSets: AccountSet[] = [
  {
    id: 'set-1',
    name: '北美营销 A 组',
    country: 'United States',
    phone: '+1 650 443 XXXX',
    email: 'us_mkt_a@gmail.com',
    proxyIp: '192.168.1.101',
    proxyType: 'dedicated',
    proxyExpiry: '2025-02-15',
    createdAt: '2024-02-15',
    platforms: [
      { id: 'google', name: 'Google/Gmail', icon: Chrome, color: 'text-blue-500', status: 'active', username: 'us_mkt_a', apiAuthorized: true },
      { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', status: 'active', username: 'FB_Mkt_US', apiAuthorized: true },
      { id: 'tiktok', name: 'TikTok', icon: Smartphone, color: 'text-black', status: 'pending', apiAuthorized: false },
      { id: 'x', name: 'X (Twitter)', icon: Twitter, color: 'text-slate-900', status: 'unregistered', apiAuthorized: false },
      { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600', status: 'unregistered', apiAuthorized: false },
      { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', status: 'unregistered', apiAuthorized: false },
    ]
  },
  {
    id: 'set-2',
    name: '英国运营 B 组',
    country: 'United Kingdom',
    phone: '+44 7700 900XXX',
    email: 'uk_ops_b@outlook.com',
    proxyIp: 'Hidden (Platform IP)',
    proxyType: 'platform',
    createdAt: '2024-02-20',
    platforms: [
      { id: 'google', name: 'Google/Gmail', icon: Chrome, color: 'text-blue-500', status: 'active', username: 'uk_ops_b', apiAuthorized: true },
      { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', status: 'unregistered', apiAuthorized: false },
      { id: 'tiktok', name: 'TikTok', icon: Smartphone, color: 'text-black', status: 'unregistered', apiAuthorized: false },
      { id: 'x', name: 'X (Twitter)', icon: Twitter, color: 'text-slate-900', status: 'unregistered', apiAuthorized: false },
      { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600', status: 'unregistered', apiAuthorized: false },
      { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', status: 'unregistered', apiAuthorized: false },
    ]
  }
];

export function SocialMedia({ lang }: { lang: "zh" | "en" }) {
  const [activeTab, setActiveTab] = useState<'sets' | 'profiles'>('sets');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingSet, setIsAddingSet] = useState(false);
  const [activeProfile, setActiveProfile] = useState(mockProfiles[0]);

  const filteredSets = mockAccountSets.filter(set => 
    set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    set.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {lang === "zh" ? "社媒发布与账号管理" : "Social Media & Account Management"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === "zh" 
              ? "以手机号为核心组织跨平台成套账号，内置云端浏览器环境防关联。" 
              : "Organize account sets around phone numbers with built-in cloud browser isolation."}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('sets')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'sets' ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            )}
          >
            {lang === "zh" ? "成套账号" : "Account Sets"}
          </button>
          <button 
            onClick={() => setActiveTab('profiles')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'profiles' ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            )}
          >
            {lang === "zh" ? "浏览器环境" : "Browser Profiles"}
          </button>
        </div>
      </div>

      {activeTab === 'sets' ? (
        <>
          {/* Stats & Search */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                {lang === "zh" ? "总账号集" : "Total Sets"}
              </div>
              <div className="text-2xl font-bold text-slate-900">{mockAccountSets.length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                {lang === "zh" ? "活跃平台账号" : "Active Accounts"}
              </div>
              <div className="text-2xl font-bold text-emerald-600">12</div>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder={lang === "zh" ? "搜索账号集、国家或手机号..." : "Search sets, country or phone..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 shadow-sm transition-all"
                />
              </div>
              <button 
                onClick={() => setIsAddingSet(true)}
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                {lang === "zh" ? "新建" : "New"}
              </button>
            </div>
          </div>

          {/* Account Sets View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSets.map(set => (
                <div key={set.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mr-3">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{set.name}</h3>
                          <div className="flex items-center text-xs text-slate-500">
                            <Globe className="w-3 h-3 mr-1" />
                            {set.country}
                          </div>
                        </div>
                      </div>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center">
                        <Phone className="w-3.5 h-3.5 text-slate-400 mr-2" />
                        <span className="text-xs font-medium text-slate-700 truncate">{set.phone}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center">
                        <Mail className="w-3.5 h-3.5 text-slate-400 mr-2" />
                        <span className="text-xs font-medium text-slate-700 truncate">{set.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 space-y-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <span>{lang === "zh" ? "平台注册状态" : "Platform Status"}</span>
                      <span>{set.platforms.filter(p => p.status === 'active').length}/{set.platforms.length}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      {set.platforms.map(platform => {
                        const Icon = platform.icon;
                        return (
                          <div key={platform.id} className="flex flex-col gap-1 group">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center min-w-0">
                                <Icon className={cn("w-4 h-4 mr-2 shrink-0", platform.color)} />
                                <span className="text-sm text-slate-600 truncate font-medium">{platform.name}</span>
                              </div>
                              {platform.status === 'active' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : platform.status === 'pending' ? (
                                <RefreshCw className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
                              ) : (
                                <button className="text-[10px] font-bold text-indigo-600 hover:underline">
                                  {lang === "zh" ? "登录" : "Login"}
                                </button>
                              )}
                            </div>
                            {platform.username && (
                              <div className="pl-6 text-[10px] text-slate-400 truncate">
                                @{platform.username}
                                {platform.apiAuthorized && (
                                  <span className="ml-2 text-emerald-500 font-bold">API ON</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center text-[10px] text-slate-400">
                      <Shield className="w-3 h-3 mr-1 text-indigo-400" />
                      {set.proxyIp}
                    </div>
                    <button 
                      onClick={() => setActiveTab('profiles')}
                      className="flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      {lang === "zh" ? "启动环境" : "Launch"}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "账号集名称" : "Set Name"}</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "国家/地区" : "Country"}</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "核心联系方式" : "Core Contact"}</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "平台进度" : "Progress"}</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{lang === "zh" ? "操作" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSets.map(set => (
                    <tr key={set.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{set.name}</div>
                        <div className="text-xs text-slate-400">Created: {set.createdAt}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-slate-600">
                          <Globe className="w-4 h-4 mr-2 text-slate-400" />
                          {set.country}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-slate-600">
                            <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                            {set.phone}
                          </div>
                          <div className="flex items-center text-xs text-slate-600">
                            <MailIcon className="w-3.5 h-3.5 mr-2 text-slate-400" />
                            {set.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {set.platforms.map(p => (
                            <div 
                              key={p.id} 
                              title={p.name}
                              className={cn(
                                "w-2 h-2 rounded-full",
                                p.status === 'active' ? "bg-emerald-500" : p.status === 'pending' ? "bg-amber-500" : "bg-slate-200"
                              )}
                            />
                          ))}
                          <span className="text-xs font-medium text-slate-500 ml-2">
                            {Math.round((set.platforms.filter(p => p.status === 'active').length / set.platforms.length) * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-600 hover:text-indigo-700 text-sm font-bold">
                          {lang === "zh" ? "管理" : "Manage"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="h-[600px] flex flex-col lg:flex-row gap-6">
          {/* Profiles Sidebar */}
          <div className="w-full lg:w-80 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0 h-64 lg:h-auto">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-bold text-slate-900">
                {lang === "zh" ? "环境列表" : "Profiles"}
              </h2>
              <button className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 space-y-2 overflow-y-auto flex-1">
              {mockProfiles.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => setActiveProfile(profile)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border transition-all",
                    activeProfile.id === profile.id
                      ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900 text-sm truncate pr-2">{profile.name}</span>
                    <span className={cn("w-2 h-2 rounded-full shrink-0", profile.status === 'running' ? "bg-emerald-500" : "bg-slate-300")} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center text-xs text-slate-500">
                      <Globe className="w-3 h-3 mr-1.5 shrink-0" />
                      <span className="truncate">{profile.proxy}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Browser Area */}
          <div className="flex-1 flex flex-col bg-slate-100 rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-w-0">
            <div className="bg-slate-200 px-4 py-2 flex items-center gap-4 border-b border-slate-300 shrink-0">
              <div className="flex gap-1.5 shrink-0">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="flex-1 flex items-center bg-white rounded-lg px-3 py-1.5 text-sm shadow-sm border border-slate-200">
                <Lock className="w-3 h-3 text-emerald-600 mr-2 shrink-0" />
                <input 
                  type="text" 
                  defaultValue={activeProfile.id === 'p1' ? "www.linkedin.com/feed/" : "www.google.com"} 
                  className="flex-1 outline-none text-slate-700 bg-transparent min-w-0"
                  key={activeProfile.id}
                />
              </div>
            </div>
            <div className="flex-1 bg-white relative flex flex-col overflow-hidden">
              <div className="absolute top-0 left-0 right-0 bg-amber-50 border-b border-amber-100 px-4 py-1.5 flex items-center justify-between z-10">
                <div className="flex items-center text-[10px] text-amber-700 font-medium">
                  <Shield className="w-3 h-3 mr-1.5" />
                  {lang === "zh" ? "指纹浏览器环境：已开启多账号隔离 (Cookies/UA/IP)" : "Fingerprint Isolation Active (Cookies/UA/IP)"}
                </div>
                <div className="text-[10px] text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                  {lang === "zh" ? "访问限制：仅限社媒/电商白名单" : "Whitelist Only: Social/E-commerce"}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <Monitor className="w-16 h-16 text-slate-200 mb-4" />
                <div className="text-center space-y-2">
                  <p className="text-slate-900 font-bold text-lg">
                    {activeProfile.name}
                  </p>
                  <p className="text-slate-400 text-sm max-w-md">
                    {lang === "zh" 
                      ? "正在模拟独立的指纹环境。您可以安全地登录多个账号，所有数据（Cookie、缓存、指纹）均已隔离。" 
                      : "Simulating isolated fingerprint environment. Securely login to multiple accounts with isolated cookies and fingerprints."}
                  </p>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-lg">
                  {INITIAL_PLATFORMS.map(p => {
                    const Icon = p.icon;
                    return (
                      <button key={p.id} className="flex flex-col items-center p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
                        <Icon className={cn("w-8 h-8 mb-2", p.color)} />
                        <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Set Modal */}
      {isAddingSet && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">
                {lang === "zh" ? "新建成套账号" : "Create New Account Set"}
              </h2>
              <button 
                onClick={() => setIsAddingSet(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45 text-slate-500" />
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">{lang === "zh" ? "账号集名称" : "Set Name"}</label>
                  <input 
                    type="text" 
                    placeholder={lang === "zh" ? "例如：北美营销 A 组" : "e.g. US Marketing Set A"}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">{lang === "zh" ? "目标国家" : "Target Country"}</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500">
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                    <option>Australia</option>
                    <option>Germany</option>
                  </select>
                </div>
                
                <div className="md:col-span-2 space-y-3">
                  <label className="text-sm font-semibold text-slate-700">{lang === "zh" ? "环境服务器与 IP" : "Environment Server & IP"}</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button className="p-4 rounded-2xl border-2 border-indigo-500 bg-indigo-50 text-left transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-indigo-900 text-sm">{lang === "zh" ? "平台推荐服务器" : "Platform Server"}</span>
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      </div>
                      <p className="text-[10px] text-indigo-600/70">{lang === "zh" ? "默认隐藏 IP，营销组环境保持不变" : "Hidden IP by default, stable environment"}</p>
                    </button>
                    <button className="p-4 rounded-2xl border border-slate-200 bg-white text-left hover:border-slate-300 transition-all group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 text-sm">{lang === "zh" ? "购买独享住宅 IP" : "Dedicated Residential IP"}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full">$40/yr</span>
                      </div>
                      <p className="text-[10px] text-slate-400 group-hover:text-slate-500">{lang === "zh" ? "自选国家区域，支持指纹隔离" : "Select country, full isolation"}</p>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">{lang === "zh" ? "核心手机号" : "Core Phone Number"}</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="+1 XXX XXX XXXX"
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">{lang === "zh" ? "核心邮箱" : "Core Email"}</label>
                  <div className="relative">
                    <MailIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="email" 
                      placeholder="example@gmail.com"
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 leading-relaxed">
                  <p className="font-bold mb-1">{lang === "zh" ? "平台建议" : "Platform Suggestion"}</p>
                  {lang === "zh" 
                    ? "为了避免逻辑混乱，建议使用同一手机号注册 Google 账号后，再使用该 Google 邮箱作为其他社媒平台（TikTok, X, LinkedIn）的注册入口。这有助于形成清晰的资产归属逻辑。" 
                    : "To avoid confusion, we suggest using the same phone number to register a Google account first, then use that Gmail as the entry point for other platforms (TikTok, X, LinkedIn)."}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setIsAddingSet(false)}
                  className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  {lang === "zh" ? "取消" : "Cancel"}
                </button>
                <button className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                  {lang === "zh" ? "确认创建" : "Create Set"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
