import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Activity, Globe2, TrendingUp, ShoppingCart, Target, Zap, Settings, Image as ImageIcon, CheckCircle2, AlertCircle, ExternalLink, Plus, X, FileText, Sparkles, DownloadCloud, Coins, Key, Lock, ShieldCheck, PenTool, Database } from "lucide-react";
import { cn } from "../../components/Layout";

const trafficData = [
  { time: "Mon", visitors: 1200, conversions: 40 },
  { time: "Tue", visitors: 1800, conversions: 60 },
  { time: "Wed", visitors: 1400, conversions: 45 },
  { time: "Thu", visitors: 2200, conversions: 80 },
  { time: "Fri", visitors: 2800, conversions: 110 },
  { time: "Sat", visitors: 3100, conversions: 130 },
  { time: "Sun", visitors: 2500, conversions: 95 },
];

export function AIOperations({ lang, projectId }: { lang: "zh" | "en", projectId?: number }) {
  const [activeTab, setActiveTab] = useState<"overview" | "optimization" | "ads" | "scrape" | "blog">("overview");
  const [showBindStore, setShowBindStore] = useState(false);
  const [showBindAd, setShowBindAd] = useState(false);
  const [bindMethod, setBindMethod] = useState<"oauth" | "token" | "account">("oauth");
  const [isWriting, setIsWriting] = useState(false);
  const [blogContent, setBlogContent] = useState("");
  const [aiProvider, setAiProvider] = useState("gemini");
  const [aiModel, setAiModel] = useState("gemini-1.5-flash");

  const handleStartWriting = async () => {
    setIsWriting(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: aiProvider,
          model: aiModel,
          projectId: projectId,
          prompt: `Based on the topic "${document.querySelector<HTMLInputElement>('input[placeholder*="2026"]')?.value || "Smart Home Trends"}", write a professional SEO blog post in ${document.querySelector<HTMLSelectElement>('select[class*="Target Language"]')?.value || "English"}.`,
          systemInstruction: "You are a professional B2B marketing expert. Write a detailed, SEO-optimized blog post based on the provided topic."
        })
      });
      const data = await response.json();
      if (data.text) {
        setBlogContent(data.text);
      } else {
        throw new Error(data.error || "Failed to generate");
      }
    } catch (error) {
      console.error(error);
      setBlogContent("Error: Failed to generate content. Please check your API keys and backend connection.");
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <div className="space-y-6 relative" id="ai-operations-container">
      {/* Bind Store Modal */}
      {showBindStore && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">{lang === "zh" ? "绑定新店铺" : "Connect New Store"}</h3>
              <button onClick={() => setShowBindStore(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col md:flex-row min-h-[400px]">
              {/* Sidebar: Methods */}
              <div className="w-full md:w-48 bg-slate-50 border-r border-slate-100 p-2 space-y-1">
                <button 
                  onClick={() => setBindMethod("oauth")}
                  className={cn(
                    "w-full flex items-center gap-2 p-2.5 rounded-lg text-xs font-bold transition-all",
                    bindMethod === "oauth" ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:bg-slate-100"
                  )}
                >
                  <ShieldCheck className="w-4 h-4" />
                  {lang === "zh" ? "平台授权 (OAuth)" : "OAuth Auth"}
                </button>
                <button 
                  onClick={() => setBindMethod("token")}
                  className={cn(
                    "w-full flex items-center gap-2 p-2.5 rounded-lg text-xs font-bold transition-all",
                    bindMethod === "token" ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:bg-slate-100"
                  )}
                >
                  <Key className="w-4 h-4" />
                  {lang === "zh" ? "API Token 绑定" : "API Token"}
                </button>
                <button 
                  onClick={() => setBindMethod("account")}
                  className={cn(
                    "w-full flex items-center gap-2 p-2.5 rounded-lg text-xs font-bold transition-all",
                    bindMethod === "account" ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:bg-slate-100"
                  )}
                >
                  <Lock className="w-4 h-4" />
                  {lang === "zh" ? "账号密码 (自建站)" : "Account/Pass"}
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-6">
                {bindMethod === "oauth" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-6">
                      <h4 className="font-bold text-indigo-900 text-sm mb-1">{lang === "zh" ? "官方授权模式" : "Official Authorization"}</h4>
                      <p className="text-xs text-indigo-700">{lang === "zh" ? "适用于 Shopify, Amazon, TikTok Shop 等主流平台。安全稳定，无需提供密码。" : "For Shopify, Amazon, TikTok Shop, etc. Secure and stable, no password needed."}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "选择平台" : "Select Platform"}</label>
                      <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500">
                        <option>Shopify</option>
                        <option>Amazon Seller Central</option>
                        <option>TikTok Shop</option>
                        <option>Alibaba International</option>
                      </select>
                    </div>
                    <div className="pt-4">
                      <button onClick={() => setShowBindStore(false)} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {lang === "zh" ? "前往平台授权" : "Go to Authorize"}
                      </button>
                    </div>
                  </div>
                )}

                {bindMethod === "token" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 mb-6">
                      <h4 className="font-bold text-amber-900 text-sm mb-1">{lang === "zh" ? "API 令牌模式" : "API Token Mode"}</h4>
                      <p className="text-xs text-amber-700">{lang === "zh" ? "适用于平台自建站或其他支持 API 的系统。请在店铺后台生成 Access Token。" : "For platform sites or systems with API support. Generate Access Token in store admin."}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "店铺域名" : "Store Domain"}</label>
                      <input type="text" placeholder="https://your-store.com" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1.5">Access Token / API Key</label>
                      <input type="password" placeholder="shpat_... or api_..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <div className="pt-4">
                      <button onClick={() => setShowBindStore(false)} className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm">
                        {lang === "zh" ? "验证并绑定" : "Verify & Connect"}
                      </button>
                    </div>
                  </div>
                )}

                {bindMethod === "account" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{lang === "zh" ? "直连模式" : "Direct Connection"}</h4>
                      <p className="text-xs text-slate-500">{lang === "zh" ? "适用于 WordPress/WooCommerce 或其他无官方 API 的自建站。我们将通过模拟登录进行操作。" : "For WordPress/WooCommerce or custom sites without official API. We use simulated login."}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "后台登录地址" : "Admin Login URL"}</label>
                      <input type="text" placeholder="https://your-site.com/wp-admin" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "用户名" : "Username"}</label>
                        <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "密码" : "Password"}</label>
                        <input type="password" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                      </div>
                    </div>
                    <div className="pt-4">
                      <button onClick={() => setShowBindStore(false)} className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm">
                        {lang === "zh" ? "测试连接并保存" : "Test & Save"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bind Ad Account Modal */}
      {showBindAd && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">{lang === "zh" ? "绑定广告账号" : "Connect Ad Account"}</h3>
              <button onClick={() => setShowBindAd(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "选择广告平台" : "Select Ad Platform"}</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500">
                  <option>TikTok Ads</option>
                  <option>Facebook Ads</option>
                  <option>Google Ads</option>
                </select>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <p className="text-sm text-slate-600 mb-4">{lang === "zh" ? "点击下方按钮跳转至广告平台进行 OAuth 授权认证。" : "Click the button below to redirect to the ad platform for OAuth authorization."}</p>
                <button onClick={() => setShowBindAd(false)} className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                  {lang === "zh" ? "前往授权" : "Go to Authorize"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" id="ai-ops-title">
            {lang === "zh" ? "AI 独立站运营" : "AI Site Operations"}
          </h1>
          <p className="text-sm text-slate-500 mt-1" id="ai-ops-desc">
            {lang === "zh" ? "对接平台独立站或 Shopify/WP，进行产品内容优化、图片优化及广告管理。" : "Connect to platform sites or Shopify/WP for product optimization, image enhancement, and ad management."}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowBindStore(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            {lang === "zh" ? "绑定新店铺" : "Connect New Store"}
          </button>
        </div>
      </div>

      {/* Connected Stores */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <div className="flex-shrink-0 w-64 p-4 bg-indigo-600 text-white rounded-2xl shadow-sm relative overflow-hidden cursor-pointer ring-2 ring-indigo-600 ring-offset-2">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Globe2 className="w-16 h-16" /></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">Platform Site</span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
            </div>
            <h3 className="font-bold text-lg mb-1">TechVision Global</h3>
            <p className="text-indigo-100 text-xs font-mono">techvision-demo.b2b-sites.com</p>
          </div>
        </div>
        <div className="flex-shrink-0 w-64 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden cursor-pointer hover:border-slate-300 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5"><ShoppingCart className="w-16 h-16" /></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">Shopify</span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">TechVision US Store</h3>
            <p className="text-slate-500 text-xs font-mono">techvision-us.myshopify.com</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab("overview")} className={cn("flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === "overview" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}>
          <Activity className="w-4 h-4 mr-2" />
          {lang === "zh" ? "运营总览" : "Overview"}
        </button>
        <button onClick={() => setActiveTab("optimization")} className={cn("flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === "optimization" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}>
          <Zap className="w-4 h-4 mr-2" />
          {lang === "zh" ? "AI 优化建议" : "AI Optimization"}
        </button>
        <button onClick={() => setActiveTab("ads")} className={cn("flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === "ads" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}>
          <Target className="w-4 h-4 mr-2" />
          {lang === "zh" ? "广告管理" : "Ad Management"}
        </button>
        <button onClick={() => setActiveTab("scrape")} className={cn("flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === "scrape" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}>
          <DownloadCloud className="w-4 h-4 mr-2" />
          {lang === "zh" ? "产品智能爬取" : "Product Scrape"}
        </button>
        <button onClick={() => setActiveTab("blog")} className={cn("flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === "blog" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}>
          <PenTool className="w-4 h-4 mr-2" />
          {lang === "zh" ? "博客文章编写" : "Blog Writer"}
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{lang === "zh" ? "本周访客" : "Weekly Visitors"}</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">15,000</p>
              <div className="flex items-center text-emerald-500 text-sm mt-2 font-medium">
                <TrendingUp className="w-4 h-4 mr-1" /> +12.5%
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{lang === "zh" ? "转化率" : "Conversion Rate"}</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">3.4%</p>
              <div className="flex items-center text-emerald-500 text-sm mt-2 font-medium">
                <TrendingUp className="w-4 h-4 mr-1" /> +0.8%
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{lang === "zh" ? "AI 客服拦截率" : "AI Bot Resolution Rate"}</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">78%</p>
              <div className="flex items-center text-slate-500 text-sm mt-2 font-medium">
                {lang === "zh" ? "节省 45 小时人工" : "Saved 45h manual work"}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">{lang === "zh" ? "流量与转化趋势" : "Traffic & Conversion Trend"}</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dx={-10} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dx={10} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
                  <Line yAxisId="left" type="monotone" dataKey="visitors" name={lang === "zh" ? "访客数" : "Visitors"} stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Line yAxisId="right" type="monotone" dataKey="conversions" name={lang === "zh" ? "转化数 (询盘/订单)" : "Conversions (Inquiries/Orders)"} stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === "optimization" && (
        <div className="space-y-6">
          {/* Whole Store Optimization */}
          <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
            <h3 className="font-bold text-indigo-900 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
              {lang === "zh" ? "全店 AI 优化建议" : "Whole Store AI Optimization Suggestions"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3"><AlertCircle className="w-4 h-4" /></div>
                  <h4 className="font-semibold text-slate-900 text-sm">{lang === "zh" ? "跳出率过高" : "High Bounce Rate"}</h4>
                </div>
                <p className="text-xs text-slate-600 mb-3">{lang === "zh" ? "首页加载速度慢，且首屏缺乏明确的行动号召 (CTA)。" : "Homepage loads slowly and lacks a clear CTA above the fold."}</p>
                <button className="text-indigo-600 text-xs font-medium hover:underline">{lang === "zh" ? "查看优化方案" : "View Solution"}</button>
              </div>
              <div className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-3"><TrendingUp className="w-4 h-4" /></div>
                  <h4 className="font-semibold text-slate-900 text-sm">{lang === "zh" ? "客单价提升空间" : "AOV Improvement"}</h4>
                </div>
                <p className="text-xs text-slate-600 mb-3">{lang === "zh" ? "建议在结账页面增加相关配件的交叉销售 (Cross-sell) 模块。" : "Suggest adding cross-sell modules for accessories on the checkout page."}</p>
                <button className="text-indigo-600 text-xs font-medium hover:underline">{lang === "zh" ? "一键生成模块" : "Generate Module"}</button>
              </div>
              <div className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3"><CheckCircle2 className="w-4 h-4" /></div>
                  <h4 className="font-semibold text-slate-900 text-sm">{lang === "zh" ? "移动端适配良好" : "Mobile UX Good"}</h4>
                </div>
                <p className="text-xs text-slate-600 mb-3">{lang === "zh" ? "移动端转化率高于行业平均水平 15%。继续保持。" : "Mobile conversion rate is 15% higher than industry average. Keep it up."}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Optimization */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-500" />
              {lang === "zh" ? "产品内容优化 (SEO)" : "Product Content Optimization (SEO)"}
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-amber-900 text-sm">Smart Home Hub V2</div>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-bold">SEO Score: 65/100</span>
                </div>
                <p className="text-xs text-amber-700 mb-3">{lang === "zh" ? "当前标题缺乏核心搜索词，描述过短。" : "Current title lacks core search terms, description is too short."}</p>
                <div className="bg-white p-3 rounded-lg border border-amber-200 mb-3">
                  <div className="text-xs font-semibold text-slate-500 mb-1">{lang === "zh" ? "AI 建议标题" : "AI Suggested Title"}</div>
                  <div className="text-sm font-medium text-slate-900">Smart Home Hub V2 - WiFi/Zigbee Compatible, Voice Control, B2B Wholesale</div>
                </div>
                <button className="w-full py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
                  {lang === "zh" ? "一键应用优化 (API)" : "Apply Optimization (API)"}
                </button>
              </div>
            </div>
          </div>

          {/* Image Optimization */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-slate-900 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-indigo-500" />
                {lang === "zh" ? "产品图片优化" : "Product Image Optimization"}
              </h3>
              <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium border border-amber-200 flex items-center">
                <Coins className="w-3 h-3 mr-1" />
                {lang === "zh" ? "消耗: 3 点数/张" : "Cost: 3 Credits/img"}
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="font-medium text-slate-900 text-sm">Wireless Earbuds Pro</div>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs font-bold">{lang === "zh" ? "背景杂乱" : "Cluttered Background"}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                    <img src="https://picsum.photos/seed/earbuds1/200/200" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-1">Original</div>
                  </div>
                  <div className="relative aspect-square rounded-lg overflow-hidden border border-indigo-200 ring-2 ring-indigo-500">
                    <img src="https://picsum.photos/seed/earbuds2/200/200" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute bottom-0 left-0 right-0 bg-indigo-600 text-white text-[10px] text-center py-1">AI Enhanced (White BG)</div>
                  </div>
                </div>
                <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                  {lang === "zh" ? "替换店铺主图" : "Replace Store Main Image"}
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {activeTab === "scrape" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center">
                <DownloadCloud className="w-5 h-5 mr-2 text-indigo-500" />
                {lang === "zh" ? "产品智能爬取与上架" : "AI Product Scrape & Upload"}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {lang === "zh" ? "输入货源网站链接，AI 自动抓取产品信息、图片并翻译，一键上架到您的独立站。" : "Input source website URL, AI auto-scrapes product info, images, translates, and uploads to your site."}
              </p>
            </div>
            <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium border border-amber-200 flex items-center">
              <Coins className="w-3 h-3 mr-1" />
              {lang === "zh" ? "消耗: 5 点数/个" : "Cost: 5 Credits/item"}
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder={lang === "zh" ? "输入货源网站商品链接 (如 1688, 淘宝, Amazon)..." : "Enter source product URL (e.g., 1688, Amazon)..."} 
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center shadow-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                {lang === "zh" ? "智能抓取" : "Smart Scrape"}
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 p-3 border-b border-slate-200 text-sm font-medium text-slate-700">
                {lang === "zh" ? "抓取结果预览" : "Scrape Result Preview"}
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <div className="aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-slate-300" />
                  </div>
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-12 h-12 rounded border border-slate-200 bg-slate-100 flex-shrink-0"></div>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">{lang === "zh" ? "AI 翻译优化标题 (English)" : "AI Translated & Optimized Title"}</label>
                    <input type="text" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none" placeholder={lang === "zh" ? "等待抓取..." : "Waiting for scrape..."} disabled />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">{lang === "zh" ? "抓取价格" : "Scraped Price"}</label>
                      <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" placeholder="¥0.00" disabled />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">{lang === "zh" ? "建议售价 (USD)" : "Suggested Retail Price (USD)"}</label>
                      <input type="text" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none" placeholder="$0.00" disabled />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">{lang === "zh" ? "AI 生成描述" : "AI Generated Description"}</label>
                    <textarea className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none h-24 resize-none" placeholder={lang === "zh" ? "等待抓取..." : "Waiting for scrape..."} disabled></textarea>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button className="px-6 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors opacity-50 cursor-not-allowed">
                      {lang === "zh" ? "一键上架到独立站" : "Upload to Site"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === "blog" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center">
                <PenTool className="w-5 h-5 mr-2 text-indigo-500" />
                {lang === "zh" ? "AI 博客文章创作" : "AI Blog Article Creation"}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {lang === "zh" ? "基于全局知识库内容，为您创作高质量的 SEO 营销博文。" : "Create high-quality SEO marketing blog posts based on your Global Knowledge Base."}
              </p>
            </div>
            <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium border border-amber-200 flex items-center">
              <Coins className="w-3 h-3 mr-1" />
              {lang === "zh" ? "消耗: 10 点数/篇" : "Cost: 10 Credits/article"}
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "选择 AI 模型" : "Select AI Model"}</label>
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="gemini">Gemini</option>
                    <option value="openai">OpenAI</option>
                    <option value="kimi">Kimi</option>
                    <option value="volcengine">火山引擎</option>
                    <option value="minimax">MiniMax</option>
                  </select>
                  <input 
                    type="text"
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    placeholder="Model Name"
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "文章话题/关键词" : "Topic / Keywords"}</label>
                <input 
                  type="text" 
                  placeholder={lang === "zh" ? "例如: 2026 智能家居趋势" : "e.g., 2026 Smart Home Trends"} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "文章类型" : "Article Type"}</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500">
                  <option value="seo">{lang === "zh" ? "SEO 优化 (关键词驱动)" : "SEO Optimized"}</option>
                  <option value="promo">{lang === "zh" ? "产品宣传 (营销驱动)" : "Product Promotion"}</option>
                  <option value="news">{lang === "zh" ? "行业热点 (趋势驱动)" : "Industry News"}</option>
                  <option value="tutorial">{lang === "zh" ? "使用教程 (服务驱动)" : "Tutorial"}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "目标语言" : "Target Language"}</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Chinese</option>
                </select>
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 mb-2 text-indigo-900 font-bold text-xs">
                  <Database className="w-3.5 h-3.5" />
                  {lang === "zh" ? "已关联全局知识库" : "Knowledge Base Linked"}
                </div>
                <p className="text-[10px] text-indigo-700 leading-relaxed">
                  {lang === "zh" 
                    ? "AI 将深度参考您在“独立站与知识库”模块上传的文档，确保文章内容的专业性与品牌一致性。" 
                    : "AI will deeply reference the documents uploaded in the 'Site & KB' module to ensure professionalism and brand consistency."}
                </p>
              </div>
              <button 
                onClick={handleStartWriting}
                disabled={isWriting}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center disabled:opacity-50"
              >
                {isWriting ? (
                  <><Sparkles className="w-4 h-4 mr-2 animate-spin" /> {lang === "zh" ? "AI 创作中..." : "AI Writing..."}</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> {lang === "zh" ? "开始创作" : "Start Writing"}</>
                )}
              </button>
            </div>
            <div className="lg:col-span-2">
              <div className="h-full min-h-[400px] bg-slate-50 rounded-xl border border-slate-200 flex flex-col overflow-hidden">
                <div className="p-3 border-b border-slate-200 bg-white flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "文章预览" : "Article Preview"}</span>
                  {blogContent && (
                    <button className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {lang === "zh" ? "发布到独立站" : "Publish to Site"}
                    </button>
                  )}
                </div>
                <div className="flex-1 p-6 overflow-y-auto prose prose-slate prose-sm max-w-none">
                  {blogContent ? (
                    <div className="whitespace-pre-wrap text-slate-700 font-serif leading-relaxed">
                      {blogContent}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <FileText className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-sm">{lang === "zh" ? "配置左侧参数并点击“开始创作”" : "Configure parameters and click 'Start Writing'"}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === "ads" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-900 flex items-center">
              <Target className="w-5 h-5 mr-2 text-indigo-500" />
              {lang === "zh" ? "跨平台广告管理" : "Cross-Platform Ad Management"}
            </h3>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowBindAd(true)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-4 h-4 inline-block mr-1" />
                {lang === "zh" ? "绑定广告账号" : "Bind Ad Account"}
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                {lang === "zh" ? "创建 AI 广告计划" : "Create AI Ad Campaign"}
              </button>
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                <th className="p-4 text-sm font-semibold text-slate-600">{lang === "zh" ? "广告计划" : "Campaign"}</th>
                <th className="p-4 text-sm font-semibold text-slate-600">{lang === "zh" ? "平台" : "Platform"}</th>
                <th className="p-4 text-sm font-semibold text-slate-600">{lang === "zh" ? "状态" : "Status"}</th>
                <th className="p-4 text-sm font-semibold text-slate-600">ROAS</th>
                <th className="p-4 text-sm font-semibold text-slate-600">{lang === "zh" ? "AI 建议" : "AI Suggestion"}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-900 text-sm">Q3 Smart Home B2B</td>
                <td className="p-4 text-sm text-slate-500">Google Ads</td>
                <td className="p-4"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">Active</span></td>
                <td className="p-4 font-mono text-sm">3.2x</td>
                <td className="p-4 text-sm text-slate-500">
                  <div className="flex items-center text-amber-600 text-xs font-medium">
                    <AlertCircle className="w-3 h-3 mr-1" /> {lang === "zh" ? "建议增加 20% 预算" : "Suggest +20% budget"}
                  </div>
                </td>
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-900 text-sm">TikTok Video Remix Promo</td>
                <td className="p-4 text-sm text-slate-500">TikTok Ads</td>
                <td className="p-4"><span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold">Paused</span></td>
                <td className="p-4 font-mono text-sm">1.1x</td>
                <td className="p-4 text-sm text-slate-500">
                  <div className="flex items-center text-indigo-600 text-xs font-medium">
                    <Zap className="w-3 h-3 mr-1" /> {lang === "zh" ? "建议更换视频素材" : "Suggest changing video assets"}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
