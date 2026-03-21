import { useState } from "react";
import { Monitor, Shield, Lock, Search, ArrowLeft, ArrowRight, RotateCw, Globe, Plus, Fingerprint, Cookie, Server, Play, Square, Coins } from "lucide-react";
import { cn } from "../../components/Layout";

const mockProfiles = [
  { id: 'p1', name: 'LinkedIn Outreach - US', proxy: 'US-East (Residential)', os: 'Windows 11', browser: 'Chrome 120', status: 'running' },
  { id: 'p2', name: 'Google Ads - UK', proxy: 'UK-London (Static)', os: 'macOS 14', browser: 'Safari 17', status: 'stopped' },
  { id: 'p3', name: 'Polymarket Main', proxy: 'US-West (Dedicated)', os: 'Windows 10', browser: 'Firefox 121', status: 'stopped' },
];

export function CloudBrowser({ lang }: { lang: "zh" | "en" }) {
  const [activeProfile, setActiveProfile] = useState(mockProfiles[0]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      {/* Profiles Sidebar */}
      <div className="w-full lg:w-80 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0 h-64 lg:h-auto">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="font-bold text-slate-900">
            {lang === "zh" ? "浏览器环境" : "Browser Profiles"}
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
                <div className="flex items-center text-xs text-slate-500">
                  <Fingerprint className="w-3 h-3 mr-1.5 shrink-0" />
                  <span className="truncate">{profile.os} • {profile.browser}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 shrink-0">
          <div className="flex items-center mb-1.5">
            <Cookie className="w-3.5 h-3.5 mr-2 text-emerald-500" />
            {lang === "zh" ? "Cookie 与 Session 独立持久化" : "Cookies & Sessions isolated and persisted"}
          </div>
          <div className="flex items-center mb-1.5">
            <Shield className="w-3.5 h-3.5 mr-2 text-indigo-500" />
            {lang === "zh" ? "用户环境完全隔离防封号" : "Full user isolation to prevent bans"}
          </div>
          <div className="flex items-center mb-1.5">
            <Coins className="w-3.5 h-3.5 mr-2 text-amber-500" />
            {lang === "zh" ? "基础环境免费 (含本地 IP)" : "Base profile free (Local IP)"}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
            <span className="font-medium text-slate-700">{lang === "zh" ? "场景化独享 IP 购买" : "Scenario-based IP"}</span>
            <button className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold hover:bg-indigo-200 transition-colors">
              {lang === "zh" ? "一键配置" : "Auto Setup"}
            </button>
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] bg-white border border-slate-200 p-1.5 rounded">
              <span className="text-slate-600 font-medium">TikTok 美区防封原生环境</span>
              <span className="text-indigo-600 font-bold">$5/mo</span>
            </div>
            <div className="flex items-center justify-between text-[10px] bg-white border border-slate-200 p-1.5 rounded">
              <span className="text-slate-600 font-medium">Facebook 稳定养号环境</span>
              <span className="text-indigo-600 font-bold">$3/mo</span>
            </div>
            <div className="flex items-center justify-between text-[10px] bg-white border border-slate-200 p-1.5 rounded">
              <span className="text-slate-600 font-medium">AWS 独享静态 IP (按区域)</span>
              <span className="text-indigo-600 font-bold">{lang === "zh" ? "按 AWS 实时定价" : "AWS Live Pricing"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Browser Area */}
      <div className="flex-1 flex flex-col bg-slate-100 rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-w-0">
        {/* Browser Chrome */}
        <div className="bg-slate-200 px-4 py-2 flex items-center gap-4 border-b border-slate-300 shrink-0 overflow-x-auto">
          <div className="flex gap-1.5 shrink-0 hidden sm:flex">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          </div>
          
          <div className="flex gap-1 sm:gap-2 text-slate-500 shrink-0">
            <button className="p-1 hover:bg-slate-300 rounded"><ArrowLeft className="w-4 h-4" /></button>
            <button className="p-1 hover:bg-slate-300 rounded"><ArrowRight className="w-4 h-4" /></button>
            <button className="p-1 hover:bg-slate-300 rounded"><RotateCw className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 flex items-center bg-white rounded-lg px-3 py-1.5 text-sm shadow-sm border border-slate-200 min-w-[200px]">
            <Lock className="w-3 h-3 text-emerald-600 mr-2 shrink-0" />
            <span className="text-slate-400 mr-1 shrink-0 hidden sm:inline">https://</span>
            <input 
              type="text" 
              defaultValue={activeProfile.id === 'p1' ? "www.linkedin.com/feed/" : "www.google.com"} 
              className="flex-1 outline-none text-slate-700 bg-transparent min-w-0"
              key={activeProfile.id}
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium border border-indigo-100 shrink-0">
            <Server className="w-3 h-3" />
            <span className="hidden sm:inline">{activeProfile.proxy.split(' ')[0]}</span>
          </div>
        </div>

        {/* Browser Content Area (Mock) */}
        <div className="flex-1 bg-white relative flex flex-col min-h-0">
          {activeProfile.status === 'running' ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 overflow-y-auto">
              <div className="text-center space-y-4 p-6">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Monitor className="w-10 h-10 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-700">
                  {lang === "zh" ? `环境 [${activeProfile.name}] 已连接` : `Profile [${activeProfile.name}] Connected`}
                </h2>
                <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
                  {lang === "zh" 
                    ? "此环境的 Cookie、LocalStorage 及浏览器指纹已完全隔离。您可以安全地登录账号，关闭后状态将自动云端保存，长期保持登录态。" 
                    : "Cookies, LocalStorage, and fingerprints for this profile are fully isolated. You can safely log in; state is auto-saved to the cloud upon closing for long-term persistence."}
                </p>
                <div className="pt-6 flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
                  <button className="px-4 py-2 bg-[#1877F2] text-white rounded-lg text-sm font-medium hover:bg-[#166fe5] transition-colors shadow-sm flex items-center">
                    <Globe className="w-4 h-4 mr-2" /> Facebook
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm flex items-center">
                    <Globe className="w-4 h-4 mr-2" /> Instagram
                  </button>
                  <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center">
                    <Globe className="w-4 h-4 mr-2" /> TikTok
                  </button>
                  <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center">
                    <Globe className="w-4 h-4 mr-2" /> X (Twitter)
                  </button>
                  <button className="px-4 py-2 bg-[#0A66C2] text-white rounded-lg text-sm font-medium hover:bg-[#084e96] transition-colors shadow-sm flex items-center">
                    <Globe className="w-4 h-4 mr-2" /> LinkedIn
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Square className="w-6 h-6 text-slate-400" />
                </div>
                <h2 className="text-lg font-medium text-slate-600">
                  {lang === "zh" ? "环境未启动" : "Profile Stopped"}
                </h2>
                <button className="mt-4 flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors mx-auto">
                  <Play className="w-4 h-4 mr-2" />
                  {lang === "zh" ? "启动环境" : "Start Profile"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
