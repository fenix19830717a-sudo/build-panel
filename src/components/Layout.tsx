import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Layers,
  LayoutDashboard,
  ListTodo,
  Database,
  Settings,
  Activity,
  ShieldAlert,
  Menu,
  Bell,
  User,
  Search,
  Globe,
  Network,
  LayoutGrid,
  CreditCard,
  Bot,
  Users,
  Video,
  Monitor,
  FileText,
  Coins,
  LayoutTemplate,
  MessageSquare,
  UsersRound,
  KeyRound,
  Truck,
  LogOut,
  Server
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getNavigationGroups = (role: "admin" | "user") => {
  const userApps = [
    { name: { zh: "1. 独立站与知识库", en: "1. Site & Knowledge Base" }, id: "app-site-gen", icon: LayoutTemplate },
    { name: { zh: "2. AI 独立站运营", en: "2. AI Site Ops" }, id: "app-ai-ops", icon: Activity },
    { name: { zh: "3. 市场调查报告", en: "3. Market Research" }, id: "app-research", icon: FileText },
    { name: { zh: "4. 客户挖掘与营销", en: "4. B2B Leads & Email" }, id: "app-b2b", icon: Users },
    { name: { zh: "5. 视频混剪", en: "5. Video Mixer" }, id: "app-video", icon: Video },
    { name: { zh: "6. 社媒发布", en: "6. Social Pub" }, id: "app-browser", icon: Monitor },
    { name: { zh: "7. 客服翻译", en: "7. CS Translation" }, id: "app-customer-service", icon: MessageSquare },
    { name: { zh: "8. 物流查询", en: "8. Logistics Tracking" }, id: "app-logistics", icon: Truck },
    { name: { zh: "9. Poly 机器人", en: "9. Poly Bot" }, id: "app-polybot", icon: Bot },
  ];

  const groups = [
    {
      category: { zh: "平台与应用", en: "Platform & Apps" },
      items: [
        { name: { zh: "仪表盘", en: "Dashboard" }, id: "dashboard", icon: LayoutDashboard },
        { name: { zh: "应用市场", en: "App Store" }, id: "appstore", icon: LayoutGrid },
        { name: { zh: "订阅与设置", en: "Subscription & Settings" }, id: "billing", icon: CreditCard },
      ]
    },
    {
      category: { zh: "我的应用", en: "My Apps" },
      items: userApps
    }
  ];

  if (role === "admin") {
    groups.push({
      category: { zh: "后台管理", en: "Admin Dashboard" },
      items: [
        { name: { zh: "用户管理", en: "User Management" }, id: "admin-users", icon: UsersRound },
        { name: { zh: "AI API管理", en: "AI API Config" }, id: "admin-api", icon: KeyRound },
        { name: { zh: "服务器管理", en: "Server Management" }, id: "system", icon: ShieldAlert },
        { name: { zh: "服务节点管理", en: "Node Management" }, id: "node-management", icon: Server },
        { name: { zh: "爬虫任务", en: "Crawler Tasks" }, id: "tasks", icon: ListTodo },
        { name: { zh: "爬虫数据", en: "Crawler Data" }, id: "data", icon: Database },
        { name: { zh: "第三方 SaaS", en: "Third-Party SaaS" }, id: "admin-saas", icon: Network },
        { name: { zh: "财务管理", en: "Admin Billing" }, id: "admin-billing", icon: CreditCard },
        { name: { zh: "应用版本管理", en: "App Versioning" }, id: "apps-center", icon: Layers },
      ]
    });
  }

  return groups;
};

export function Layout({
  children,
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  role,
  user,
  onLogout,
  onLoginRequired
}: {
  children: ReactNode;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: "zh" | "en";
  setLang: (lang: "zh" | "en") => void;
  role: "admin" | "user";
  user: any;
  onLogout: () => void;
  onLoginRequired: () => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigationGroups = getNavigationGroups(user ? role : "user");

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out transform flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:translate-x-0",
        )}
      >
        <div className="flex items-center h-16 px-4 bg-slate-950 font-bold text-white tracking-wide text-sm shrink-0">
          <Database className="w-5 h-5 mr-2 text-emerald-500 shrink-0" />
          <span className="truncate" title="芙蓉出海企业服务中心外贸工具箱">芙蓉出海外贸工具箱</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6" id="sidebar-navigation">
          {navigationGroups.map((group, idx) => (
            <div key={idx} id={`nav-group-${idx}`}>
              <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {group.category[lang]}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-item-${item.id}`}
                      onClick={() => setCurrentTab(item.id)}
                      className={cn(
                        "w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-colors",
                        isActive
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "hover:bg-slate-800 hover:text-white",
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5 mr-3",
                          isActive ? "text-emerald-400" : "text-slate-400",
                        )}
                      />
                      {item.name[lang]}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* User Profile / Plan */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-colors",
                role === "admin" ? "bg-rose-500" : "bg-indigo-500"
              )}>
                {user.name?.[0] || (role === "admin" ? "A" : "U")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {user.name || (role === "admin" ? "Admin User" : "Demo User")}
                </div>
                <div className="text-xs text-emerald-400 font-medium">
                  {role === "admin" ? "Super Admin" : "Pro Plan"}
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title={lang === "zh" ? "退出登录" : "Logout"}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onLoginRequired}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/20"
            >
              <User className="w-4 h-4" />
              {lang === "zh" ? "登录 / 注册" : "Login / Sign Up"}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 mr-4 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={lang === "zh" ? "搜索应用、任务、数据..." : "Search apps, tasks, data..."}
                className="pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all w-64 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && (
              <div className="hidden sm:flex items-center px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-sm font-medium border border-amber-200 mr-2">
                <Coins className="w-4 h-4 mr-1.5" />
                {lang === "zh" ? `点数: ${user.credits?.toLocaleString() || 0}` : `Credits: ${user.credits?.toLocaleString() || 0}`}
              </div>
            )}
            <button 
              onClick={() => setLang(lang === "zh" ? "en" : "zh")}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <Globe className="w-4 h-4 mr-2 text-slate-400" />
              {lang === "zh" ? "English" : "中文"}
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-medium ml-2">
              <User className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative" id="main-content-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
