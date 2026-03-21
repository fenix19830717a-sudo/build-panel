import { useState, useEffect } from "react";
import { Users, Mail, Phone, Download, Filter, Search, MapPin, Building, Plus, Globe, Briefcase, Map, Star, ExternalLink, CheckCircle2, RefreshCw, Upload, Sparkles, Database, FileText, Coins, AlertTriangle, Settings, Shield, Info, Send } from "lucide-react";
import { cn } from "../../components/Layout";
import { ActionButton } from "../../components/ActionButton";

export function B2BLeads({ lang, projectId, onLaunch, onLoginRequired, user }: { lang: "zh" | "en", projectId?: number, onLaunch?: (tab: string) => void, onLoginRequired?: () => void, user?: any }) {
  const [activeTab, setActiveTab] = useState<"crm" | "mining" | "email">("crm");
  const [miningType, setMiningType] = useState<"google" | "maps" | "linkedin" | "customs">("maps");
  
  // Sender Config State
  const [senderEmail, setSenderEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [appPassword, setAppPassword] = useState("");
  const [showAuthConfig, setShowAuthConfig] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Maps Search State
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [importedIds, setImportedIds] = useState<number[]>([]);

  const [emailPrompt, setEmailPrompt] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState<{subject: string, body: string} | null>(null);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

  const [saasResults, setSaasResults] = useState<any[]>([]);
  const [isSaasSearching, setIsSaasSearching] = useState(false);

  const handleLinkedInSearch = async () => {
    if (!user) {
      onLoginRequired?.();
      return;
    }
    if (!searchKeyword) return;
    setIsSaasSearching(true);
    try {
      const res = await fetch("/api/saas/linkedin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchKeyword })
      });
      const data = await res.json();
      setSaasResults(data);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaasSearching(false);
    }
  };

  const handleCustomsSearch = async () => {
    if (!user) {
      onLoginRequired?.();
      return;
    }
    if (!hsCode && !searchKeyword) return;
    setIsSaasSearching(true);
    try {
      const res = await fetch("/api/saas/customs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hsCode, country: searchLocation })
      });
      const data = await res.json();
      setSaasResults(data);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaasSearching(false);
    }
  };

  const handleSyncToCRM = async () => {
    if (!user) {
      onLoginRequired?.();
      return;
    }
    if (importedIds.length === 0) return;
    try {
      const res = await fetch("/api/saas/crm/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: importedIds })
      });
      const data = await res.json();
      if (data.success) {
        alert(lang === "zh" ? `成功同步 ${data.syncedCount} 条线索到 CRM` : `Successfully synced ${data.syncedCount} leads to CRM`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateEmail = async () => {
    if (!user) {
      onLoginRequired?.();
      return;
    }
    if (!emailPrompt) return;
    setIsGeneratingEmail(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate a professional cold email based on these selling points: ${emailPrompt}. The email should be persuasive and target B2B leads. Return the subject and body.`,
          systemInstruction: "You are an expert B2B sales copywriter.",
          featureKey: "lead_mining",
          projectId
        })
      });
      const data = await res.json();
      // Simple parsing of AI response
      const lines = data.text.split('\n');
      const subject = lines.find((l: string) => l.toLowerCase().startsWith('subject:'))?.replace(/subject:/i, '').trim() || "Partnership Opportunity";
      const body = lines.filter((l: string) => !l.toLowerCase().startsWith('subject:')).join('\n').trim();
      setGeneratedEmail({ subject, body });
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleMapsSearch = () => {
    if (!user) {
      onLoginRequired?.();
      return;
    }
    if (onLaunch) {
      window.history.pushState({}, '', '?app=b2b_leads');
      onLaunch("tasks");
      return;
    }
    if (!searchKeyword || !searchLocation) return;
    setIsSearching(true);
    setHasSearched(false);
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 1500);
  };

  const handleImport = (id: number) => {
    setImportedIds(prev => [...prev, id]);
  };

  return (
    <div className="space-y-6" id="b2b-leads-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" id="b2b-leads-title">
            {lang === "zh" ? "B2B 客户挖掘 (CRM)" : "B2B Leads CRM"}
          </h1>
          <p className="text-sm text-slate-500 mt-1" id="b2b-leads-desc">
            {lang === "zh" ? "管理从 Google Maps、LinkedIn 等渠道挖掘的潜在客户。" : "Manage leads generated from Google Maps, LinkedIn, and other sources."}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab("mining")}
            className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Search className="w-4 h-4 mr-2" />
            {lang === "zh" ? "新建挖掘任务" : "New Mining Task"}
          </button>
          <button 
            onClick={() => setActiveTab("email")}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            id="btn-create-email-campaign"
          >
            <Mail className="w-4 h-4 mr-2" />
            {lang === "zh" ? "创建邮件营销" : "Create Email Campaign"}
          </button>
        </div>
      </div>

      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("crm")}
          className={cn(
            "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "crm" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Users className="w-4 h-4 mr-2" />
          {lang === "zh" ? "CRM 客户库" : "CRM Database"}
        </button>
        <button
          onClick={() => setActiveTab("mining")}
          className={cn(
            "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "mining" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Search className="w-4 h-4 mr-2" />
          {lang === "zh" ? "挖掘任务" : "Mining Tasks"}
        </button>
        <button
          onClick={() => setActiveTab("email")}
          className={cn(
            "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "email" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Mail className="w-4 h-4 mr-2" />
          {lang === "zh" ? "邮件营销" : "Email Marketing"}
        </button>
      </div>

      {activeTab === "crm" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm" id="b2b-leads-toolbar">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={lang === "zh" ? "按特征搜索客户..." : "Search customers by feature..."}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </div>
            <button className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 flex items-center transition-colors">
              <Sparkles className="w-4 h-4 mr-2" />
              {lang === "zh" ? "AI 特征分析" : "AI Feature Analysis"}
            </button>
            <button 
              onClick={handleSyncToCRM}
              className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 flex items-center transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {lang === "zh" ? "同步到外部 CRM" : "Sync to External CRM"}
            </button>
            <button className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 flex items-center transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              {lang === "zh" ? "筛选" : "Filter"}
            </button>
          </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="b2b-leads-table-container">
        <table className="w-full text-left border-collapse" id="b2b-leads-table">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-4 text-sm font-semibold text-slate-600">{lang === "zh" ? "潜在客户" : "Lead"}</th>
              <th className="p-4 text-sm font-semibold text-slate-600">{lang === "zh" ? "联系方式" : "Contact Info"}</th>
              <th className="p-4 text-sm font-semibold text-slate-600">{lang === "zh" ? "来源" : "Source"}</th>
              <th className="p-4 text-sm font-semibold text-slate-600">{lang === "zh" ? "状态" : "Status"}</th>
              <th className="p-4 text-sm font-semibold text-slate-600 text-right">{lang === "zh" ? "操作" : "Action"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50/50">
              <td className="p-4">
                <div className="font-medium text-slate-900 flex items-center">
                  <Building className="w-4 h-4 mr-2 text-slate-400" />
                  TechVision Innovators Inc.
                </div>
                <div className="text-sm text-slate-500 mt-1 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" /> New York, US
                </div>
              </td>
              <td className="p-4">
                <div className="text-sm text-slate-900 font-medium">Sarah Connor (CEO)</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                  <span className="flex items-center"><Mail className="w-3 h-3 mr-1" /> s.connor@techvision.com</span>
                  <span className="flex items-center"><Phone className="w-3 h-3 mr-1" /> +1 650-***-555</span>
                </div>
              </td>
              <td className="p-4 text-sm">
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">Google Maps</span>
              </td>
                        <td className="p-4 text-right space-x-2">
                          <button 
                            onClick={() => setActiveTab("email")}
                            className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 mr-1.5" />
                            {lang === "zh" ? "一键发信" : "Send Email"}
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-4">
                          <div className="font-medium text-slate-900 flex items-center">
                            <Building className="w-4 h-4 mr-2 text-slate-400" />
                            London Finance Group Ltd
                          </div>
                          <div className="text-sm text-slate-500 mt-1 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" /> London, UK
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-slate-900 font-medium">Arthur Pendragon (Director)</div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                            <span className="flex items-center"><Mail className="w-3 h-3 mr-1" /> arthur@londonfinance.co.uk</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">LinkedIn</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                            {lang === "zh" ? "已发送邮件" : "Email Sent"}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button 
                            onClick={() => setActiveTab("email")}
                            className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 mr-1.5" />
                            {lang === "zh" ? "一键发信" : "Send Email"}
                          </button>
                        </td>
                      </tr>
          </tbody>
        </table>
      </div>
        </div>
      )}

      {activeTab === "mining" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { id: "google", icon: Globe, title: lang === "zh" ? "Google 搜索" : "Google Search", desc: lang === "zh" ? "通用网页爬虫" : "Web crawler" },
              { id: "maps", icon: Map, title: lang === "zh" ? "Google Maps" : "Google Maps", desc: lang === "zh" ? "指定城市商家" : "City businesses" },
              { id: "linkedin", icon: Users, title: lang === "zh" ? "LinkedIn" : "LinkedIn", desc: lang === "zh" ? "企业与决策人" : "B2B & Decision makers" },
              { id: "customs", icon: Database, title: lang === "zh" ? "海关数据" : "Customs Data", desc: lang === "zh" ? "按次收费" : "Pay-per-use", badge: true }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setMiningType(type.id as any)}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all relative overflow-hidden",
                  miningType === type.id ? "border-indigo-500 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500" : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                {type.badge && (
                  <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                    {lang === "zh" ? "按次收费" : "Pay-per-use"}
                  </div>
                )}
                <type.icon className={cn("w-6 h-6 mb-3", miningType === type.id ? "text-indigo-600" : "text-slate-400")} />
                <h3 className="font-bold text-slate-900 text-sm mb-1">{type.title}</h3>
                <p className="text-xs text-slate-500">{type.desc}</p>
              </button>
            ))}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <Search className="w-5 h-5 mr-2 text-indigo-500" />
                {lang === "zh" ? "配置挖掘任务" : "Configure Mining Task"}
              </div>
              <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium border border-amber-200 flex items-center">
                <Coins className="w-3 h-3 mr-1" />
                {lang === "zh" ? "消耗: 5 点数/条线索" : "Cost: 5 Credits/lead"}
              </div>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "关键词 / 行业" : "Keywords / Industry"}</label>
                <div className="relative">
                  <Briefcase className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder={lang === "zh" ? "例如: 电子产品批发商" : "e.g., Electronics Wholesaler"} 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" 
                  />
                </div>
              </div>
              {miningType === "maps" && (
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "目标城市 / 区域" : "Target City / Region"}</label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      placeholder={lang === "zh" ? "例如: 洛杉矶, 纽约" : "e.g., Los Angeles, NY"} 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" 
                    />
                  </div>
                </div>
              )}
              {miningType === "customs" && (
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "HS 编码 / 报关单号" : "HS Code / Declaration No."}</label>
                  <div className="relative">
                    <FileText className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      value={hsCode}
                      onChange={(e) => setHsCode(e.target.value)}
                      placeholder={lang === "zh" ? "例如: 85171200" : "e.g., 85171200"} 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" 
                    />
                  </div>
                </div>
              )}
              {miningType === "linkedin" && (
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "公司规模" : "Company Size"}</label>
                  <div className="relative">
                    <Users className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all appearance-none"
                    >
                      <option value="">{lang === "zh" ? "不限规模" : "Any Size"}</option>
                      <option value="1-10">1-10 {lang === "zh" ? "人" : "employees"}</option>
                      <option value="11-50">11-50 {lang === "zh" ? "人" : "employees"}</option>
                      <option value="51-200">51-200 {lang === "zh" ? "人" : "employees"}</option>
                      <option value="201-500">201-500 {lang === "zh" ? "人" : "employees"}</option>
                      <option value="501+">501+ {lang === "zh" ? "人" : "employees"}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => {
                  if (miningType === "linkedin") handleLinkedInSearch();
                  else if (miningType === "customs") handleCustomsSearch();
                  else handleMapsSearch();
                }}
                disabled={isSearching || isSaasSearching || (miningType === "customs" ? (!searchKeyword && !hsCode) : (!searchKeyword || (miningType === "maps" && !searchLocation)))}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 flex items-center"
              >
                {(isSearching || isSaasSearching) ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Search className="w-5 h-5 mr-2" />
                )}
                {lang === "zh" ? "开始搜索" : "Start Search"}
              </button>
            </div>
          </div>

          {hasSearched && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">
                  {lang === "zh" ? `搜索结果: "${searchKeyword}"` : `Results for: "${searchKeyword}"`}
                </h3>
                <span className="text-sm text-slate-500">
                  {lang === "zh" ? "找到 3 个结果" : "Found 3 results"}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="p-4 text-sm font-semibold text-slate-600">
                        {miningType === "customs" ? (lang === "zh" ? "报关单信息" : "Declaration Info") : (lang === "zh" ? "商家/决策人信息" : "Business/Decision Maker")}
                      </th>
                      <th className="p-4 text-sm font-semibold text-slate-600">{lang === "zh" ? "联系方式/详情" : "Contact/Details"}</th>
                      <th className="p-4 text-sm font-semibold text-slate-600">
                        {miningType === "customs" ? (lang === "zh" ? "重量/日期" : "Rating/Company") : (lang === "zh" ? "评分" : "Rating")}
                      </th>
                      <th className="p-4 text-sm font-semibold text-slate-600 text-right">{lang === "zh" ? "操作" : "Action"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {miningType === "maps" ? (
                      [
                        { id: 1, name: "Global Electronics Hub", address: "123 Tech Blvd, " + searchLocation, phone: "+1 (555) 123-4567", website: "globalelec.com", rating: 4.8, reviews: 124 },
                        { id: 2, name: "Prime Wholesale Distributors", address: "45 Industrial Pkwy, " + searchLocation, phone: "+1 (555) 987-6543", website: "primewholesale.net", rating: 4.5, reviews: 89 },
                        { id: 3, name: "Apex Supply Co.", address: "789 Commerce St, " + searchLocation, phone: "+1 (555) 456-7890", website: "apexsupply.co", rating: 4.2, reviews: 45 }
                      ].map((business) => (
                        <tr key={business.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <div className="font-medium text-slate-900">{business.name}</div>
                            <div className="text-sm text-slate-500 mt-1 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" /> {business.address}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-slate-700 flex items-center mb-1">
                              <Phone className="w-3 h-3 mr-2 text-slate-400" /> {business.phone}
                            </div>
                            <a href={`https://${business.website}`} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                              <Globe className="w-3 h-3 mr-2 text-indigo-400" /> {business.website}
                            </a>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400 mr-1" />
                              <span className="font-medium text-slate-900 text-sm">{business.rating}</span>
                              <span className="text-xs text-slate-500 ml-1">({business.reviews})</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            {importedIds.includes(business.id) ? (
                              <button disabled className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                {lang === "zh" ? "已导入" : "Imported"}
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleImport(business.id)}
                                className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-medium transition-colors"
                              >
                                <Download className="w-3.5 h-3.5 mr-1.5" />
                                {lang === "zh" ? "导入 CRM" : "Import to CRM"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : saasResults.map((res, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-slate-900">{res.name || res.importer}</div>
                          <div className="text-sm text-slate-500 mt-1 flex items-center">
                            {miningType === "linkedin" ? <Briefcase className="w-3 h-3 mr-1" /> : <Building className="w-3 h-3 mr-1" />}
                            {res.title || res.exporter}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-slate-700">{res.company || "N/A"}</div>
                          <div className="text-xs text-slate-500 mt-1">{res.location || res.date}</div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-slate-600">{res.weight || "N/A"}</span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleImport(idx + 100)}
                            className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" />
                            {lang === "zh" ? "导入 CRM" : "Import to CRM"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "email" && (
        <div className="space-y-6">
          {/* Sender Configuration Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-indigo-500" />
                {lang === "zh" ? "发件人配置 (SMTP / API)" : "Sender Configuration (SMTP / API)"}
              </h2>
              <button 
                onClick={() => setShowAuthConfig(!showAuthConfig)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                <Info className="w-4 h-4 mr-1" />
                {lang === "zh" ? "如何获取授权？" : "How to get authorized?"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">{lang === "zh" ? "发件人名称" : "Sender Name"}</label>
                <input 
                  type="text" 
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">{lang === "zh" ? "发件人邮箱" : "Sender Email"}</label>
                <input 
                  type="email" 
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="e.g., john@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">{lang === "zh" ? "应用专用密码 / API Key" : "App Password / API Key"}</label>
                <input 
                  type="password" 
                  value={appPassword}
                  onChange={(e) => setAppPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {showAuthConfig && (
              <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-sm animate-in fade-in slide-in-from-top-2">
                <h4 className="font-bold text-indigo-900 mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  {lang === "zh" ? "授权指南" : "Authorization Guide"}
                </h4>
                <div className="space-y-2 text-indigo-800 text-xs leading-relaxed">
                  <p><strong>Gmail:</strong> {lang === "zh" ? "开启 2FA，在 Google 账号设置中生成 'App Password'。" : "Enable 2FA, then generate an 'App Password' in Google Account settings."}</p>
                  <p><strong>Outlook/Office 365:</strong> {lang === "zh" ? "使用应用专用密码或通过 Azure 门户配置 OAuth2。" : "Use App Passwords or configure OAuth2 via Azure Portal."}</p>
                  <p><strong>SendGrid / Resend (推荐):</strong> {lang === "zh" ? "推荐使用第三方 API 接入以获得更高的送达率和稳定性。" : "Recommended: Use third-party APIs for higher delivery rates and stability."}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-indigo-500" />
                  {lang === "zh" ? "AI 邮件营销生成" : "AI Email Campaign Generation"}
                </h2>
                <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium border border-amber-200 flex items-center">
                  <Coins className="w-3 h-3 mr-1" />
                  {lang === "zh" ? "消耗: 1 点数/封" : "Cost: 1 Credit/email"}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "选择目标客户群" : "Select Target Audience"}</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500">
                  <option>All Imported Leads (Google Maps)</option>
                  <option>Tech Wholesalers (LinkedIn)</option>
                  <option>Custom Segment A</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "产品素材 (来自全局知识库)" : "Product Assets (From Global Knowledge Base)"}</label>
                <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-red-500" />
                      <span className="text-sm font-medium text-slate-700">Product_Catalog_2026.pdf</span>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="text-sm font-medium text-slate-700">Company_FAQ.docx</span>
                    </div>
                    <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === "zh" ? "AI 将自动提取选中文件的核心卖点生成邮件。" : "AI will automatically extract core selling points from selected files."}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "邮件大意 / 核心卖点" : "Main Idea / Core Selling Points"}</label>
                <textarea 
                  value={emailPrompt}
                  onChange={(e) => setEmailPrompt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 h-24 resize-none"
                  placeholder={lang === "zh" ? "例如：我们是源头工厂，新款智能手表支持心率监测，批发价低至 $15，寻北美代理商。" : "e.g., We are the source factory. New smartwatch supports heart rate monitoring, wholesale price as low as $15. Looking for NA agents."}
                ></textarea>
              </div>

              <ActionButton 
                onClick={handleGenerateEmail}
                loading={isGeneratingEmail}
                disabled={!emailPrompt}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                {!isGeneratingEmail && <Sparkles className="w-4 h-4 mr-2" />}
                {lang === "zh" ? "AI 自动生成开发信" : "AI Generate Cold Email"}
              </ActionButton>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="font-bold text-slate-900 mb-4">{lang === "zh" ? "生成的邮件预览" : "Generated Email Preview"}</h3>
              <div className="flex-1 bg-white rounded-xl border border-slate-200 p-5 overflow-y-auto min-h-[300px]">
                {generatedEmail ? (
                  <>
                    <div className="text-sm text-slate-500 mb-4 border-b border-slate-100 pb-4">
                      <div className="mb-2"><span className="font-medium text-slate-700">Subject:</span> {generatedEmail.subject}</div>
                      <div><span className="font-medium text-slate-700">To:</span> [Lead Name]</div>
                    </div>
                    <div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap">
                      {generatedEmail.body}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm italic">
                    <Mail className="w-8 h-8 mb-2 opacity-20" />
                    {lang === "zh" ? "等待 AI 生成..." : "Waiting for AI generation..."}
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-4">
                <div className="flex gap-3">
                  <button className="flex-1 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    {lang === "zh" ? "重新生成" : "Regenerate"}
                  </button>
                  <ActionButton 
                    onClick={async () => {
                      if (!senderEmail || !appPassword) {
                        alert(lang === "zh" ? "请先配置发件人信息！" : "Please configure sender info first!");
                        return;
                      }
                      setIsSending(true);
                      await new Promise(r => setTimeout(r, 2000));
                      setIsSending(false);
                      alert(lang === "zh" ? "批量发送任务已启动！" : "Bulk sending task started!");
                    }}
                    loading={isSending}
                    className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    {!isSending && <Send className="w-4 h-4 mr-2" />}
                    {lang === "zh" ? "一键批量发送" : "One-click Bulk Send"}
                  </ActionButton>
                </div>
                
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                    <Shield className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                    {lang === "zh" ? "批量发送建议 (防封号)" : "Bulk Send Suggestions (Anti-Spam)"}
                  </h4>
                  <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>{lang === "zh" ? "使用第三方专业 API (如 Resend/SendGrid) 代替个人邮箱 SMTP。" : "Use professional APIs (Resend/SendGrid) instead of personal SMTP."}</li>
                    <li>{lang === "zh" ? "设置随机发送间隔 (建议 30-120 秒/封)。" : "Set random intervals (30-120s per email)."}</li>
                    <li>{lang === "zh" ? "启用 AI 变量替换，确保每封邮件内容不完全一致。" : "Use AI variables to ensure unique content for each email."}</li>
                    <li>{lang === "zh" ? "每日发送上限建议：新号 < 50 封，老号 < 200 封。" : "Daily limit: <50 for new accounts, <200 for aged accounts."}</li>
                    <li>{lang === "zh" ? "确保包含退订链接，遵守 GDPR/CAN-SPAM 法规。" : "Include unsubscribe links to comply with GDPR/CAN-SPAM."}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
