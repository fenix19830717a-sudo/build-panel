import React, { useState, useEffect } from "react";
import { Bot, Users, Video, Monitor, ArrowRight, Sparkles, FileText, LayoutTemplate, MessageSquare, Activity, Truck, Layers } from "lucide-react";
import { cn } from "../components/Layout";

interface ModularApp {
  id: number;
  name: string;
  app_key: string;
  description: string;
  icon: string;
  status: string;
  version_number: string;
}

export function AppStore({ lang, onLaunch, role }: { lang: "zh" | "en", onLaunch: (appId: string) => void, role: "admin" | "user" }) {
  const [modularApps, setModularApps] = useState<ModularApp[]>([]);

  useEffect(() => {
    const fetchModularApps = async () => {
      try {
        const res = await fetch("/api/modular-apps");
        const data = await res.json();
        setModularApps(data);
      } catch (err) {
        console.error("Failed to fetch modular apps", err);
      }
    };
    fetchModularApps();
  }, []);

  const staticApps = [
    {
      id: "app-research",
      name: { zh: "1. 市场调查报告", en: "1. Market Research Report" },
      description: { 
        zh: "根据选定的市场区域和行业，自动生成模式化的市场调查报告及潜在合作方名单。", 
        en: "Auto-generate templated market research reports and potential partner lists based on region and industry." 
      },
      icon: FileText,
      color: "bg-pink-500",
      bg: "bg-pink-50",
      tags: ["Research", "Data", "Report"],
      isNew: false
    },
    {
      id: "app-site-gen",
      name: { zh: "2. 独立站生成+知识库", en: "2. Site Generator & KB" },
      description: { 
        zh: "输入企业资料一键生成多语言独立站，并构建专属 AI 客服知识库，支持自动部署与域名绑定。", 
        en: "Generate multilingual sites and AI knowledge bases from company info, with auto-deployment." 
      },
      icon: LayoutTemplate,
      color: "bg-indigo-500",
      bg: "bg-indigo-50",
      tags: ["Website", "AI", "Deployment"],
      isNew: false
    },
    {
      id: "app-customer-service",
      name: { zh: "3. 客服翻译与 AI 回复", en: "3. CS Translation & AI Reply" },
      description: { 
        zh: "平台内实时多语言对话翻译，及独立站 AI 客服自动回复配置。", 
        en: "Real-time multilingual chat translation and AI auto-reply config for your site." 
      },
      icon: MessageSquare,
      color: "bg-teal-500",
      bg: "bg-teal-50",
      tags: ["Chat", "Translation", "AI"],
      isNew: false
    },
    {
      id: "app-ai-ops",
      name: { zh: "4. AI 独立站运营", en: "4. AI Site Operations" },
      description: { 
        zh: "对接平台独立站或 Shopify/WP，进行产品内容优化、图片优化及跨平台广告管理。", 
        en: "Connect to platform sites or Shopify/WP for product optimization, image enhancement, and ad management." 
      },
      icon: Activity,
      color: "bg-rose-500",
      bg: "bg-rose-50",
      tags: ["Operations", "SEO", "Ads"],
      isNew: true
    },
    {
      id: "app-b2b",
      name: { zh: "5. 客户挖掘和 CRM", en: "5. B2B Leads CRM" },
      description: { 
        zh: "整合 Google Maps、LinkedIn 与海关数据，一键生成潜在客户列表并支持邮件营销。", 
        en: "Integrate Google Maps, LinkedIn, and customs data to generate lead lists and support email marketing." 
      },
      icon: Users,
      color: "bg-emerald-500",
      bg: "bg-emerald-50",
      tags: ["CRM", "Marketing", "Data"],
      isNew: false
    },
    {
      id: "app-video",
      name: { zh: "6. 视频混剪生成器", en: "6. Video Remix Generator" },
      description: { 
        zh: "自动抓取商品素材，AI 智能混剪生成 TikTok/Reels 营销短视频，支持本地和云端模式。", 
        en: "Auto-scrape product assets and use AI or local FFMPEG to remix marketing videos for TikTok/Reels." 
      },
      icon: Video,
      color: "bg-violet-500",
      bg: "bg-violet-50",
      tags: ["AI", "Media", "TikTok"],
      isNew: false
    },
    {
      id: "app-browser",
      name: { zh: "7. 社媒发布 (多账号管理)", en: "7. Social Media Publishing" },
      description: { 
        zh: "内置服务器代理的云端浏览器，无缝访问 WhatsApp、Google 等海外资源，支持多账号防关联社媒发布。", 
        en: "Cloud browser with built-in server proxies for seamless access to WhatsApp, Google, etc. Supports multi-account social publishing." 
      },
      icon: Monitor,
      color: "bg-amber-500",
      bg: "bg-amber-50",
      tags: ["Social", "Proxy", "Marketing"],
      isNew: false
    },
    {
      id: "app-logistics",
      name: { zh: "8. 物流查询", en: "8. Logistics Tracking" },
      description: { 
        zh: "输入运单号，一键查询全球国际物流轨迹与实时状态。", 
        en: "Enter tracking number to query global logistics trajectory and real-time status." 
      },
      icon: Truck,
      color: "bg-sky-500",
      bg: "bg-sky-50",
      tags: ["Logistics", "Tracking", "Tool"],
      isNew: true
    },
    {
      id: "app-polybot",
      name: { zh: "9. Polymarket 交易机器人", en: "9. Polymarket Trading Bot" },
      description: { 
        zh: "基于爬虫获取的高胜率巨鲸账号数据，自动执行跟单交易与套利策略。需要管理员配置。", 
        en: "Automated copy-trading and arbitrage bot based on high win-rate whale data scraped from Polymarket." 
      },
      icon: Bot,
      color: "bg-blue-500",
      bg: "bg-blue-50",
      tags: ["Web3", "Trading", "Auto"],
      isNew: false,
      adminOnly: true
    }
  ];

  // Map modular apps to the store format
  const mappedModularApps = modularApps.map(app => ({
    id: `modular-${app.app_key}`,
    name: { zh: app.name, en: app.name },
    description: { zh: app.description, en: app.description },
    icon: Layers,
    color: "bg-slate-700",
    bg: "bg-slate-50",
    tags: ["Modular", `v${app.version_number}`, app.status],
    isNew: false,
    isModular: true
  }));

  const allApps = [...staticApps, ...mappedModularApps];
  const visibleApps = allApps.filter(app => role === "admin" || !(app as any).adminOnly);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {lang === "zh" ? "应用市场" : "App Store"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {lang === "zh" 
            ? "基于底层爬虫数据引擎构建的开箱即用 SaaS 应用，支持模块化独立升级。" 
            : "Ready-to-use SaaS applications built on top of the underlying crawler data engine, supporting modular independent upgrades."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {visibleApps.map((app) => {
          const Icon = app.icon;
          return (
            <div key={app.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm", app.color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex gap-2">
                  {(app as any).isModular && (
                    <span className="flex items-center px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                      Modular
                    </span>
                  )}
                  {app.isNew && (
                    <span className="flex items-center px-2.5 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                      <Sparkles className="w-3 h-3 mr-1" />
                      New
                    </span>
                  )}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {app.name[lang]}
              </h3>
              <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-2">
                {app.description[lang]}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                <div className="flex gap-2">
                  {app.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => onLaunch(app.id)}
                  className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
                >
                  {lang === "zh" ? "启动应用" : "Launch App"}
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
