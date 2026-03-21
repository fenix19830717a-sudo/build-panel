import React, { useState } from "react";
import { 
  Search, 
  Lightbulb, 
  Download, 
  Layout, 
  Users, 
  Image as ImageIcon, 
  Share2, 
  ChevronRight, 
  ExternalLink,
  CheckCircle2,
  Smartphone,
  Mail,
  ArrowRight,
  Info
} from "lucide-react";
import { cn } from "./Layout";

interface Step {
  id: string;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  icon: any;
  details: {
    zh: string[];
    en: string[];
  };
  links?: { label: string; url: string }[];
  action?: { label: { zh: string; en: string }; path: string };
}

const steps: Step[] = [
  {
    id: "research",
    title: { zh: "1. 市场调研", en: "1. Market Research" },
    description: { zh: "分析全球市场需求与竞争对手", en: "Analyze global demand and competitors" },
    icon: Search,
    details: {
      zh: ["使用 Google Trends 分析关键词热度", "调研亚马逊/独立站竞品价格与评价", "确定目标国家与受众画像"],
      en: ["Analyze keyword trends via Google Trends", "Research competitor pricing on Amazon", "Define target countries and personas"]
    },
    action: { label: { zh: "开始调研", en: "Start Research" }, path: "/market-intelligence" }
  },
  {
    id: "brand",
    title: { zh: "2. 产品与品牌", en: "2. Product & Branding" },
    description: { zh: "定义核心竞争力与品牌形象", en: "Define USP and brand identity" },
    icon: Lightbulb,
    details: {
      zh: ["提炼产品卖点 (USP)", "AI 生成品牌名称与 Slogan", "设计品牌 Logo 与视觉规范"],
      en: ["Extract product USPs", "AI generate brand name & slogan", "Design logo and visual guidelines"]
    }
  },
  {
    id: "tools",
    title: { zh: "3. 工具下载与账号", en: "3. Tools & Accounts" },
    description: { zh: "准备出海必备的通讯与办公工具", en: "Prepare essential communication tools" },
    icon: Download,
    details: {
      zh: ["注册 Gmail 或 Outlook 商业邮箱", "下载 WhatsApp / Telegram 手机端", "注册 LinkedIn / Facebook 基础账号"],
      en: ["Register Gmail or Outlook business mail", "Download WhatsApp / Telegram mobile", "Register LinkedIn / Facebook accounts"]
    },
    links: [
      { label: "Gmail", url: "https://mail.google.com" },
      { label: "WhatsApp", url: "https://www.whatsapp.com/download" },
      { label: "LinkedIn", url: "https://www.linkedin.com" }
    ]
  },
  {
    id: "site",
    title: { zh: "4. 独立站生成", en: "4. Site Generation" },
    description: { zh: "快速搭建 SEO 友好的品牌官网", en: "Build SEO-friendly brand site" },
    icon: Layout,
    details: {
      zh: ["一键生成多语言独立站", "配置域名与 SSL 证书", "设置 AI 实时客服插件"],
      en: ["One-click multi-lang site generation", "Configure domain and SSL", "Setup AI live chat plugin"]
    },
    action: { label: { zh: "去建站", en: "Go to Builder" }, path: "/site-builder" }
  },
  {
    id: "leads",
    title: { zh: "5. 客户开发", en: "5. Customer Dev" },
    description: { zh: "多渠道挖掘潜在 B2B 客户", en: "Multi-channel B2B lead mining" },
    icon: Users,
    details: {
      zh: ["Google Maps 挖掘线下批发商", "LinkedIn 自动化开发决策者", "海关数据精准定位进口商"],
      en: ["Mine wholesalers via Google Maps", "Automate LinkedIn outreach", "Target importers via customs data"]
    },
    action: { label: { zh: "开始获客", en: "Start Mining" }, path: "/b2b-leads" }
  },
  {
    id: "content",
    title: { zh: "6. 素材生成", en: "6. Content Creation" },
    description: { zh: "AI 批量产出高质量营销素材", en: "AI batch marketing content" },
    icon: ImageIcon,
    details: {
      zh: ["AI 生成产品白底图与场景图", "自动编写多语言营销文案", "生成 TikTok/Shorts 短视频素材"],
      en: ["AI generate product & lifestyle photos", "Auto-write multi-lang copy", "Generate TikTok/Shorts video assets"]
    }
  },
  {
    id: "publish",
    title: { zh: "7. 素材发布", en: "7. Publishing" },
    description: { zh: "全网矩阵发布，获取免费流量", en: "Multi-platform publishing" },
    icon: Share2,
    details: {
      zh: ["配置防关联浏览器环境", "定时发布内容至社媒矩阵", "监控评论并自动回复"],
      en: ["Setup anti-detect browser env", "Schedule posts to social matrix", "Monitor and auto-reply comments"]
    }
  }
];

export function GlobalOnboarding({ lang }: { lang: "zh" | "en" }) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {lang === "zh" ? "出海全流程导航" : "Global Business Roadmap"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {lang === "zh" ? "专为外贸新手打造的从 0 到 1 全链路指引" : "Step-by-step guide for foreign trade beginners"}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
            <Info className="w-3.5 h-3.5" />
            {Math.round(((activeStep + 1) / steps.length) * 100)}% {lang === "zh" ? "已完成" : "Completed"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[400px]">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-4 border-r border-slate-100 p-2 space-y-1">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            const isCompleted = activeStep > index;

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(index)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                  isActive ? "bg-white/20" : "bg-slate-100 group-hover:bg-slate-200"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-500")} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{step.title[lang]}</div>
                  <div className={cn(
                    "text-[10px] truncate",
                    isActive ? "text-indigo-100" : "text-slate-400"
                  )}>
                    {step.description[lang]}
                  </div>
                </div>
                <ChevronRight className={cn("w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", isActive && "opacity-100")} />
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8 p-8 flex flex-col">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {steps[activeStep].title[lang]}
                </h3>
                <p className="text-slate-500">
                  {steps[activeStep].description[lang]}
                </p>
              </div>
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                {React.createElement(steps[activeStep].icon, { className: "w-8 h-8" })}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  {lang === "zh" ? "关键任务" : "Key Tasks"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {steps[activeStep].details[lang].map((detail, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      </div>
                      <span className="text-sm text-slate-700">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {steps[activeStep].links && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    {lang === "zh" ? "常用链接" : "Quick Links"}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {steps[activeStep].links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-all"
                      >
                        {link.label}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
            <button 
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="text-sm font-bold text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-all"
            >
              {lang === "zh" ? "上一步" : "Previous"}
            </button>
            
            <div className="flex gap-3">
              {steps[activeStep].action && (
                <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
                  {steps[activeStep].action.label[lang]}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {activeStep < steps.length - 1 && (
                <button 
                  onClick={() => setActiveStep(activeStep + 1)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
                >
                  {lang === "zh" ? "下一步" : "Next Step"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
