import { useState } from "react";
import { MessageSquare, Settings, Key, Bot, User, Send, Globe, Zap, Languages, Copy, CheckCircle2, History, Coins, Download } from "lucide-react";
import { cn } from "../../components/Layout";

export function CustomerService({ lang, projectId }: { lang: "zh" | "en", projectId?: number }) {
  const [activeTab, setActiveTab] = useState<"manual" | "logs" | "config" | "extension">("manual");
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col" id="customer-service-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" id="customer-service-title">
            {lang === "zh" ? "客服翻译与 AI 回复" : "Customer Service & AI Reply"}
          </h1>
          <p className="text-sm text-slate-500 mt-1" id="customer-service-desc">
            {lang === "zh" ? "平台内实时多语言对话翻译，及独立站 AI 客服自动回复配置。" : "Real-time multilingual chat translation and AI auto-reply config for your site."}
          </p>
          <div className="mt-3 flex items-center">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200 flex items-center">
              <Coins className="w-3 h-3 mr-1" />
              {lang === "zh" ? "免费使用 (有频率限制)" : "Free to use (Rate limited)"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit shrink-0">
        <button
          onClick={() => setActiveTab("manual")}
          className={cn(
            "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "manual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Languages className="w-4 h-4 mr-2" />
          {lang === "zh" ? "手动辅助翻译" : "Manual Assist"}
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={cn(
            "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "logs" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <History className="w-4 h-4 mr-2" />
          {lang === "zh" ? "独立站客服记录" : "Site Chat Logs"}
        </button>
        <button
          onClick={() => setActiveTab("config")}
          className={cn(
            "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "config" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Settings className="w-4 h-4 mr-2" />
          {lang === "zh" ? "AI 自动回复配置" : "AI Auto-Reply Config"}
        </button>
        <button
          onClick={() => setActiveTab("extension")}
          className={cn(
            "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === "extension" ? "bg-indigo-600 text-white shadow-sm" : "text-indigo-600 hover:bg-indigo-50"
          )}
        >
          <Download className="w-4 h-4 mr-2" />
          {lang === "zh" ? "Chrome 浏览器插件" : "Chrome Extension"}
        </button>
      </div>

      {activeTab === "manual" && (
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Customer Input Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-indigo-500" />
                {lang === "zh" ? "1. 顾客咨询内容 (粘贴至此)" : "1. Customer Inquiry (Paste here)"}
              </h2>
              <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                <textarea 
                  className="w-full h-32 p-4 bg-transparent outline-none text-sm resize-none" 
                  placeholder={lang === "zh" ? "将顾客发来的外语消息粘贴到这里..." : "Paste the foreign language message from the customer here..."}
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center shadow-sm">
                  <Languages className="w-4 h-4 mr-2" />
                  {lang === "zh" ? "AI 翻译并生成回复建议" : "Translate & Generate Reply"}
                </button>
              </div>
            </div>

            {/* AI Analysis & Suggestion Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
                <h3 className="font-bold text-indigo-900 text-sm mb-3 flex items-center">
                  <Languages className="w-4 h-4 mr-2 text-indigo-500" />
                  {lang === "zh" ? "中文翻译" : "Translation"}
                </h3>
                <div className="text-sm text-slate-700 bg-white p-4 rounded-lg border border-indigo-50 min-h-[100px]">
                  <span className="text-slate-400 italic">{lang === "zh" ? "点击上方按钮获取翻译..." : "Click the button above to translate..."}</span>
                </div>
              </div>
              <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 relative group">
                <h3 className="font-bold text-emerald-900 text-sm mb-3 flex items-center">
                  <Bot className="w-4 h-4 mr-2 text-emerald-500" />
                  {lang === "zh" ? "AI 知识库回复建议" : "AI Suggested Reply (from KB)"}
                </h3>
                <div className="text-sm text-slate-700 bg-white p-4 rounded-lg border border-emerald-50 min-h-[100px]">
                  <span className="text-slate-400 italic">{lang === "zh" ? "等待生成..." : "Waiting to generate..."}</span>
                </div>
                <button 
                  onClick={() => handleCopy("Suggested reply text...", "suggested")}
                  className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-emerald-600 bg-white rounded-md border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                  title="Copy"
                >
                  {copied === "suggested" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* User Reply Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-indigo-500" />
                {lang === "zh" ? "2. 我要回复的内容 (输入中文)" : "2. My Reply (Type in your language)"}
              </h2>
              <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                <textarea 
                  className="w-full h-32 p-4 bg-transparent outline-none text-sm resize-none" 
                  placeholder={lang === "zh" ? "输入你想对顾客说的话，AI 将自动翻译为目标语言..." : "Type what you want to say, AI will translate it to the target language..."}
                ></textarea>
              </div>
              <div className="flex justify-end items-center gap-3">
                <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                  <option value="ru">Russian</option>
                  <option value="ar">Arabic</option>
                </select>
                <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors flex items-center shadow-sm">
                  <Languages className="w-4 h-4 mr-2" />
                  {lang === "zh" ? "翻译为外语" : "Translate to Foreign Language"}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative group">
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center">
                <Globe className="w-4 h-4 mr-2 text-slate-500" />
                {lang === "zh" ? "最终回复内容 (复制发送给顾客)" : "Final Reply (Copy to send)"}
              </h3>
              <div className="text-sm text-slate-700 bg-white p-4 rounded-lg border border-slate-200 min-h-[100px]">
                <span className="text-slate-400 italic">{lang === "zh" ? "等待翻译..." : "Waiting for translation..."}</span>
              </div>
              <button 
                onClick={() => handleCopy("Final translated text...", "final")}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-indigo-600 bg-white rounded-md border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                title="Copy"
              >
                {copied === "final" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex overflow-hidden min-h-0">
          {/* Chat List */}
          <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
            <div className="p-4 border-b border-slate-200 bg-white">
              <h3 className="font-bold text-slate-900 mb-3">{lang === "zh" ? "独立站客服记录" : "Site Chat Logs"}</h3>
              <input type="text" placeholder={lang === "zh" ? "搜索客户或聊天内容..." : "Search customers or chat..."} className="w-full px-3 py-1.5 bg-slate-100 border-transparent rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border-b border-slate-100 bg-indigo-50/50 cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-slate-900 text-sm">John Smith (US)</span>
                  <span className="text-xs text-slate-400">10:42 AM</span>
                </div>
                <p className="text-xs text-slate-500 truncate">I'm interested in the bulk pricing...</p>
                <div className="mt-2 flex items-center">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">AI Handled</span>
                </div>
              </div>
              <div className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-slate-900 text-sm">Maria Garcia (ES)</span>
                  <span className="text-xs text-slate-400">Yesterday</span>
                </div>
                <p className="text-xs text-slate-500 truncate">¿Tienen envíos a Madrid?</p>
                <div className="mt-2 flex items-center">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">Needs Human</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Window (Read Only) */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm z-10">
              <div>
                <div className="font-bold text-slate-900">John Smith</div>
                <div className="text-xs text-slate-500">john.smith@example.com</div>
              </div>
              <div className="flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                <Globe className="w-3 h-3 mr-1.5" />
                {lang === "zh" ? "客户语言: 英语" : "Client Lang: English"}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {/* Client Message */}
              <div className="flex items-start max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mr-3 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm text-sm text-slate-700">
                    Hello, I'm interested in the bulk pricing for the new smart home hubs.
                  </div>
                  <div className="mt-1 text-xs text-indigo-600 font-medium">
                    [翻译] 你好，我对新款智能家居中枢的批发价格很感兴趣。
                  </div>
                </div>
              </div>

              {/* AI Auto Reply */}
              <div className="flex items-start max-w-[80%] ml-auto flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 ml-3 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-end">
                  <div className="bg-indigo-50 p-3 rounded-2xl rounded-tr-none border border-indigo-100 text-sm text-indigo-900">
                    Hi John! Thanks for reaching out. Our bulk pricing for the smart home hubs starts at 50 units with a 15% discount. Would you like me to send the full pricing tier PDF?
                  </div>
                  <div className="mt-1 text-xs text-slate-500 flex items-center">
                    <Zap className="w-3 h-3 mr-1 text-amber-500" />
                    {lang === "zh" ? "AI 知识库自动回复" : "AI Knowledge Base Auto-reply"}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
              <p className="text-sm text-slate-500">
                {lang === "zh" ? "此为独立站历史聊天记录 (只读)。如需继续跟进，请使用邮件或 WhatsApp 联系客户。" : "This is a historical chat log (read-only). To follow up, please contact the customer via email or WhatsApp."}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "config" && (
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-y-auto">
          <div className="max-w-2xl space-y-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <Key className="w-5 h-5 mr-2 text-indigo-500" />
                {lang === "zh" ? "AI 模型与 API Key 设置" : "AI Model & API Key Settings"}
              </h2>
              <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-4">
                  {lang === "zh" ? "平台生成的独立站默认使用您配置的 API Key 调用大模型，结合您上传的知识库进行自动回复。" : "The generated site uses your configured API Key to call LLMs, combined with your knowledge base for auto-replies."}
                </p>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "选择 AI 模型" : "Select AI Model"}</label>
                  <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500">
                    <option>Gemini 2.5 Flash (Recommended)</option>
                    <option>Gemini 2.5 Pro</option>
                    <option>OpenAI GPT-4o</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">API Key</label>
                  <input type="password" placeholder="sk-..." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                </div>
                <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                  {lang === "zh" ? "验证并保存" : "Verify & Save"}
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <Bot className="w-5 h-5 mr-2 text-indigo-500" />
                {lang === "zh" ? "客服机器人行为设定" : "Bot Behavior Settings"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "系统提示词 (System Prompt)" : "System Prompt"}</label>
                  <textarea 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 h-32 resize-none"
                    defaultValue={lang === "zh" ? "你是一个专业的 B2B 外贸客服。请基于知识库内容回答客户问题。态度要热情、专业。如果知识库中没有答案，请委婉地告诉客户稍后会有真人销售联系他们，并索要邮箱。" : "You are a professional B2B customer service agent. Answer questions based on the knowledge base. Be polite and professional. If the answer is not in the KB, politely ask for their email so a human sales rep can contact them."}
                  ></textarea>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{lang === "zh" ? "启用自动回复" : "Enable Auto-Reply"}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{lang === "zh" ? "开启后，AI 将自动接管独立站的初始对话。" : "When enabled, AI will automatically handle initial conversations on the site."}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === "extension" && (
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-y-auto flex items-center justify-center">
          <div className="max-w-2xl text-center space-y-6">
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100">
              <Globe className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {lang === "zh" ? "下载官方 Chrome 浏览器插件" : "Download Official Chrome Extension"}
            </h2>
            <p className="text-slate-500 leading-relaxed max-w-lg mx-auto">
              {lang === "zh" 
                ? "告别繁琐的复制粘贴！安装插件后，在网页版 WhatsApp、WeChat 或 Gmail 中，划词即可实时翻译。点击“AI 回复”按钮，直接调用您的【全局企业知识库】生成专业话术并一键填入输入框。" 
                : "Say goodbye to copy-pasting! Install the extension to translate in real-time on WhatsApp Web, WeChat, or Gmail. Click 'AI Reply' to generate professional responses using your Global Knowledge Base and auto-fill the input box."}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mt-8 mb-8">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">1</div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{lang === "zh" ? "划词翻译" : "Highlight to Translate"}</h4>
                <p className="text-xs text-slate-500">{lang === "zh" ? "在任何网页选中外语，即刻显示精准中文翻译。" : "Select foreign text on any page for instant translation."}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">2</div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{lang === "zh" ? "知识库联动" : "Knowledge Base Sync"}</h4>
                <p className="text-xs text-slate-500">{lang === "zh" ? "无缝连接您的产品目录和 FAQ，生成专业回复。" : "Seamlessly connects to your product catalog and FAQ."}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mb-3">3</div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{lang === "zh" ? "一键填入" : "One-Click Fill"}</h4>
                <p className="text-xs text-slate-500">{lang === "zh" ? "生成的回复直接填入聊天框，沟通效率提升 300%。" : "Generated replies auto-fill the chat box. Boost efficiency by 300%."}</p>
              </div>
            </div>

            <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center mx-auto">
              <Download className="w-5 h-5 mr-2" />
              {lang === "zh" ? "前往 Chrome 网上应用店下载" : "Download from Chrome Web Store"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
