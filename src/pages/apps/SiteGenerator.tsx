import { useState, useEffect } from "react";
import { Globe, Upload, Settings, CheckCircle2, LayoutTemplate, Database, Server, ExternalLink, FileText, Sparkles, Trash2, PenTool, BookOpen, Coins, AlertCircle, X } from "lucide-react";
import { cn } from "../../components/Layout";

export function SiteGenerator({ lang, projectId, onLaunch, onLoginRequired, user }: { lang: "zh" | "en", projectId?: number, onLaunch?: (tab: string) => void, onLoginRequired?: () => void, user?: any }) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
  const [kbFiles, setKbFiles] = useState<{id: number, filename: string, status: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showBindModal, setShowBindModal] = useState(false);
  const [bindType, setBindType] = useState<"shopify" | "wordpress" | "custom">("shopify");
  const [authMethod, setAuthMethod] = useState<"oauth" | "token" | "credentials">("oauth");
  const [isBinding, setIsBinding] = useState(false);
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    if (projectId) {
      fetch(`/api/kb/${projectId}`)
        .then(res => res.json())
        .then(data => setKbFiles(data));
      
      fetch(`/api/stores/${projectId}`)
        .then(res => res.json())
        .then(data => setStores(data));
    }
  }, [projectId]);

  const handleBindStore = async (e: any) => {
    e.preventDefault();
    if (!user) {
      onLoginRequired?.();
      return;
    }
    if (!projectId) return;
    setIsBinding(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`/api/stores/${projectId}/bind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: bindType,
          auth_method: authMethod,
          store_url: data.store_url,
          access_token: data.access_token,
          username: data.username,
          password: data.password
        })
      });
      const newStore = await response.json();
      setStores([...stores, newStore]);
      setShowBindModal(false);
    } catch (error) {
      console.error("Binding failed", error);
    } finally {
      setIsBinding(false);
    }
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!user) {
      onLoginRequired?.();
      return;
    }
    if (!file || !projectId) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/kb/${projectId}/upload`, {
        method: "POST",
        body: formData
      });
      const newFile = await response.json();
      setKbFiles([...kbFiles, newFile]);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateSite = () => {
    if (!user) {
      onLoginRequired?.();
      return;
    }
    setIsGenerating(true);
    // Simulate site generation + automatic 5 SEO articles generation
    setTimeout(() => {
      setIsGenerating(false);
      setStep(3);
    }, 3000);
  };

  const handleGenerateBlog = () => {
    if (!user) {
      onLoginRequired?.();
      return;
    }
    setIsGeneratingBlog(true);
    setTimeout(() => {
      setIsGeneratingBlog(false);
      setStep(4);
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="site-generator-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" id="site-generator-title">
            {lang === "zh" ? "独立站生成与知识库" : "Site Generator & Knowledge Base"}
          </h1>
          <p className="text-sm text-slate-500 mt-1" id="site-generator-desc">
            {lang === "zh" ? "输入企业资料，一键生成多语言独立站，并构建专属 AI 客服知识库。" : "Input company details to generate a multilingual independent site and build an exclusive AI customer service knowledge base."}
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10"></div>
        {[
          { num: 1, title: lang === "zh" ? "知识库" : "Knowledge Base", icon: Database },
          { num: 2, title: lang === "zh" ? "独立站" : "Site Gen", icon: LayoutTemplate },
          { num: 3, title: lang === "zh" ? "SEO 博客" : "SEO Blog", icon: PenTool },
          { num: 4, title: lang === "zh" ? "部署" : "Deploy", icon: Server }
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center bg-slate-50 px-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-slate-50 mb-2 transition-colors",
              step >= s.num ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
            )}>
              {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
            </div>
            <span className={cn("text-xs font-medium", step >= s.num ? "text-indigo-900" : "text-slate-500")}>{s.title}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {step === 1 && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-indigo-500" />
                  {lang === "zh" ? "全局企业知识库 (Global Asset Library)" : "Global Knowledge Base"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {lang === "zh" ? "第一步：上传产品手册、FAQ、公司介绍等文档。这些资料将作为生成独立站、SEO文章、AI客服和邮件营销的核心素材。" : "Step 1: Upload product manuals, FAQs, and company profiles. These will be the core assets for site generation, SEO blogs, AI CS, and email marketing."}
                </p>
              </div>
              <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium border border-emerald-100 flex items-center">
                <Coins className="w-3 h-3 mr-1" />
                {lang === "zh" ? "免费 (限流)" : "Free (Rate limited)"}
              </div>
            </div>
            
            {!projectId ? (
              <div className="p-10 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                <p className="text-amber-800 font-medium mb-4">{lang === "zh" ? "请先在仪表盘选择或创建一个项目" : "Please select or create a project in the dashboard first"}</p>
                <button 
                  onClick={() => onLaunch?.("dashboard")}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 transition-colors shadow-sm"
                >
                  {lang === "zh" ? "前往仪表盘" : "Go to Dashboard"}
                </button>
              </div>
            ) : (
              <>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-indigo-300 transition-colors cursor-pointer bg-slate-50/50">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <Sparkles className="w-10 h-10 mb-4 text-indigo-400 animate-spin" />
                  ) : (
                    <Upload className="w-10 h-10 mb-4 text-indigo-400" />
                  )}
                  <span className="text-base font-medium text-slate-700 mb-1">
                    {isUploading ? (lang === "zh" ? "正在上传并解析..." : "Uploading & Parsing...") : (lang === "zh" ? "拖拽文件到此处，或点击上传" : "Drag files here, or click to upload")}
                  </span>
                  <span className="text-xs text-slate-400">支持 PDF, DOCX, TXT, CSV (最大 50MB)</span>
                </div>

                <div className="space-y-2">
                  {kbFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-3 text-indigo-500" />
                        <span className="text-sm font-medium">{file.filename}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-emerald-500 font-medium bg-emerald-50 px-2 py-1 rounded">
                          {lang === "zh" ? "已解析" : "Parsed"}
                        </span>
                        <button className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  {kbFiles.length === 0 && !isUploading && (
                    <div className="text-center py-6 text-slate-400 text-sm italic">
                      {lang === "zh" ? "暂无文档，请上传企业资料" : "No documents yet, please upload company assets"}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button onClick={() => setStep(2)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                {lang === "zh" ? "下一步：生成独立站" : "Next: Generate Site"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{lang === "zh" ? "企业与产品信息" : "Company & Product Info"}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {lang === "zh" ? "基于知识库自动提取信息，您可在此补充或修改。" : "Information auto-extracted from KB. You can supplement or modify here."}
                </p>
              </div>
              <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium border border-amber-200 flex items-center">
                <Coins className="w-3 h-3 mr-1" />
                {lang === "zh" ? "单次消耗: 1000 点数" : "Cost: 1000 Credits"}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "企业名称" : "Company Name"}</label>
                  <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" defaultValue="TechVision Electronics" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "主营业务/产品" : "Main Business/Products"}</label>
                  <textarea className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 h-24 resize-none" defaultValue={lang === "zh" ? "专注于高品质智能穿戴设备和智能家居产品的研发与制造..." : "Focusing on R&D and manufacturing of high-quality smart wearables..."}></textarea>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "目标市场语言" : "Target Languages"}</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500">
                    <option>English (Primary) + Spanish + French</option>
                    <option>English (Primary) + German + Italian</option>
                    <option>English Only</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "联系邮箱" : "Contact Email"}</label>
                    <input type="email" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" defaultValue="contact@techvision.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "联系电话" : "Contact Phone"}</label>
                    <input type="tel" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" defaultValue="+1 (555) 123-4567" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "品牌 Logo" : "Brand Logo"}</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-indigo-300 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mb-2 text-slate-400" />
                    <span className="text-sm">{lang === "zh" ? "已上传: logo.png" : "Uploaded: logo.png"}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "主题风格" : "Theme Style"}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border-2 border-indigo-500 bg-indigo-50 rounded-lg p-3 cursor-pointer">
                      <div className="w-full h-12 bg-white rounded border border-indigo-100 mb-2"></div>
                      <div className="text-xs font-medium text-center text-indigo-900">Modern Tech</div>
                    </div>
                    <div className="border-2 border-slate-200 hover:border-slate-300 rounded-lg p-3 cursor-pointer">
                      <div className="w-full h-12 bg-slate-100 rounded border border-slate-200 mb-2"></div>
                      <div className="text-xs font-medium text-center text-slate-600">Classic B2B</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button onClick={() => setStep(1)} className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                {lang === "zh" ? "上一步" : "Previous"}
              </button>
              <button onClick={handleGenerateSite} disabled={isGenerating} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center">
                {isGenerating ? (
                  <><Sparkles className="w-4 h-4 mr-2 animate-spin" /> {lang === "zh" ? "正在生成独立站..." : "Generating Site..."}</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> {lang === "zh" ? "生成独立站" : "Generate Site"}</>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <PenTool className="w-5 h-5 mr-2 text-indigo-500" />
                  {lang === "zh" ? "生成 SEO 博客文章" : "Generate SEO Blog Articles"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {lang === "zh" ? "基于您的知识库，系统已自动为您规划并生成 5 篇高质量 SEO 文章，您可以点击下方按钮确认并发布。" : "Based on your KB, the system has automatically planned and generated 5 high-quality SEO articles for you. Click below to confirm and publish."}
                </p>
              </div>
              <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium border border-emerald-100 flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {lang === "zh" ? "已自动生成" : "Auto-generated"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">{lang === "zh" ? "已生成的文章列表" : "Generated Articles List"}</h3>
                <div className="space-y-2">
                  {[
                    { title: "Top 10 Smart Home Trends in 2026", type: "SEO" },
                    { title: "How to Choose the Right Smart Hub for Your Office", type: "Guide" },
                    { title: "TechVision vs. Competitors: Why Quality Matters", type: "Promo" },
                    { title: "The Ultimate Guide to Zigbee Interoperability", type: "Tutorial" },
                    { title: "Success Story: How Global Logistics Transformed with AI", type: "Case Study" }
                  ].map((article, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-medium text-slate-700">{article.title}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold uppercase">{article.type}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "生成语言" : "Generation Language"}</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" disabled>
                    <option>English</option>
                  </select>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <h4 className="text-sm font-medium text-indigo-900 mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {lang === "zh" ? "SEO 自动优化" : "SEO Auto-Optimization"}
                  </h4>
                  <p className="text-xs text-indigo-700">
                    {lang === "zh" ? "这些文章已根据您的产品关键词进行了深度 SEO 优化，发布后将自动提交至搜索引擎收录。" : "These articles have been deeply optimized for SEO based on your product keywords and will be automatically submitted for indexing after publishing."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button onClick={() => setStep(2)} className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                {lang === "zh" ? "上一步" : "Previous"}
              </button>
              <button onClick={handleGenerateBlog} disabled={isGeneratingBlog} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center">
                {isGeneratingBlog ? (
                  <><Sparkles className="w-4 h-4 mr-2 animate-spin" /> {lang === "zh" ? "正在发布文章..." : "Publishing Articles..."}</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> {lang === "zh" ? "确认并发布 5 篇文章" : "Confirm & Publish 5 Articles"}</>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-center p-6 bg-emerald-50 rounded-xl border border-emerald-100 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-emerald-800 mb-2">{lang === "zh" ? "独立站生成成功！" : "Site Generated Successfully!"}</h2>
                <p className="text-sm text-emerald-600">
                  {lang === "zh" ? "您的多语言独立站及 AI 客服已准备就绪。" : "Your multilingual site and AI bot are ready."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center">
                  <Server className="w-5 h-5 mr-2 text-indigo-500" />
                  {lang === "zh" ? "部署设置" : "Deployment Settings"}
                </h3>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "选择部署区域 (CDN)" : "Select Deployment Region (CDN)"}</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500">
                    <option>Global (Auto-routing) - Recommended</option>
                    <option>North America (US East)</option>
                    <option>Europe (Frankfurt)</option>
                    <option>Asia Pacific (Singapore)</option>
                  </select>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm font-medium text-slate-900 mb-2">{lang === "zh" ? "临时预览域名" : "Temporary Preview Domain"}</div>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded border border-slate-200">
                    <span className="text-sm font-mono text-indigo-600">techvision-demo.b2b-sites.com</span>
                    <ExternalLink className="w-4 h-4 text-slate-400 cursor-pointer hover:text-indigo-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-indigo-500" />
                  {lang === "zh" ? "店铺绑定与同步" : "Store Binding & Sync"}
                </h3>
                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                  {stores.length > 0 ? (
                    <div className="space-y-3">
                      {stores.map(store => (
                        <div key={store.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded border border-slate-200 flex items-center justify-center text-xs font-bold text-indigo-600">
                              {store.type.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{store.store_url}</div>
                              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{store.type} • {store.auth_method}</div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">Connected</span>
                        </div>
                      ))}
                      <button 
                        onClick={() => setShowBindModal(true)}
                        className="w-full py-2 border-2 border-dashed border-slate-200 text-slate-500 rounded-lg text-sm hover:border-indigo-300 hover:text-indigo-600 transition-all"
                      >
                        + {lang === "zh" ? "绑定新店铺" : "Bind Another Store"}
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-slate-600 mb-4">
                        {lang === "zh" ? "将生成的独立站内容同步到您的现有店铺平台。" : "Sync generated site content to your existing store platforms."}
                      </p>
                      <button 
                        onClick={() => setShowBindModal(true)}
                        className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                      >
                        {lang === "zh" ? "立即绑定店铺" : "Bind Store Now"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bind Store Modal */}
            {showBindModal && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900">{lang === "zh" ? "绑定店铺" : "Bind Store"}</h3>
                    <button onClick={() => setShowBindModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleBindStore} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "店铺类型" : "Store Type"}</label>
                        <select 
                          value={bindType}
                          onChange={(e) => setBindType(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                        >
                          <option value="shopify">Shopify (E-commerce)</option>
                          <option value="wordpress">WordPress (Self-built)</option>
                          <option value="custom">Custom Platform</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "认证方式" : "Auth Method"}</label>
                        <select 
                          value={authMethod}
                          onChange={(e) => setAuthMethod(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                        >
                          <option value="oauth">OAuth Authorization</option>
                          <option value="credentials">Username/Password</option>
                          <option value="token">API Token / Key</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "店铺 URL" : "Store URL"}</label>
                      <input 
                        name="store_url"
                        required
                        type="url" 
                        placeholder="https://your-store.com" 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                      />
                    </div>

                    {authMethod === "oauth" && (
                      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                        <p className="text-xs text-indigo-700 leading-relaxed">
                          {lang === "zh" 
                            ? "点击“开始授权”后，我们将引导您前往平台完成 OAuth 授权流程。" 
                            : "After clicking 'Start Auth', we will guide you to the platform to complete the OAuth authorization process."}
                        </p>
                      </div>
                    )}

                    {authMethod === "credentials" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "用户名" : "Username"}</label>
                          <input 
                            name="username"
                            required
                            type="text" 
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "密码" : "Password"}</label>
                          <input 
                            name="password"
                            required
                            type="password" 
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                          />
                        </div>
                      </div>
                    )}

                    {authMethod === "token" && (
                      <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "API Token / Access Key" : "API Token / Access Key"}</label>
                        <input 
                          name="access_token"
                          required
                          type="password" 
                          placeholder="shpat_xxxxxxxxxxxxxxxx"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                        />
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={isBinding}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isBinding ? (lang === "zh" ? "正在连接..." : "Connecting...") : (authMethod === "oauth" ? (lang === "zh" ? "开始授权" : "Start Authorization") : (lang === "zh" ? "确认绑定" : "Confirm Binding"))}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

