import { useState } from "react";
import { FileText, Search, Download, Sparkles, Map, Briefcase, Users, CheckCircle2, Globe, RefreshCw } from "lucide-react";
import { cn } from "../../components/Layout";
import Markdown from "react-markdown";

export function MarketResearch({ lang, projectId, onLoginRequired, user }: { lang: "zh" | "en", projectId?: number, onLoginRequired?: () => void, user?: any }) {
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isGeneratingDetail, setIsGeneratingDetail] = useState(false);
  const [reportType, setReportType] = useState<"outline" | "detail" | null>(null);

  const [reportContent, setReportContent] = useState<string>("");
  const [region, setRegion] = useState("North America");
  const [country, setCountry] = useState("United States");
  const [industry, setIndustry] = useState("Consumer Electronics");
  const [businessModel, setBusinessModel] = useState("B2B (Business to Business)");

  const handleGenerateOutline = async () => {
    if (!user) {
      onLoginRequired?.();
      return;
    }
    setIsGeneratingOutline(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate a market research report OUTLINE for the ${industry} industry in ${country} (${region}) with a ${businessModel} model. Return a structured markdown outline.`,
          systemInstruction: "You are a professional market research analyst.",
          featureKey: "market_research",
          projectId
        })
      });
      const data = await res.json();
      setReportContent(data.text);
      setReportType("outline");
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const handleGenerateDetail = async () => {
    if (!user) {
      onLoginRequired?.();
      return;
    }
    setIsGeneratingDetail(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate a DETAILED market research report for the ${industry} industry in ${country} (${region}) with a ${businessModel} model. Include market size, top competitors, customer personas, and potential partners. Return in professional markdown format.`,
          systemInstruction: "You are a professional market research analyst.",
          featureKey: "market_research",
          projectId
        })
      });
      const data = await res.json();
      setReportContent(data.text);
      setReportType("detail");
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingDetail(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {lang === "zh" ? "市场调查报告生成" : "Market Research Report"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === "zh" ? "基于底层数据源，一键生成包含竞争对手、客户画像、潜在合作方的模式化报告。" : "Generate templated reports including competitors, customer personas, and potential partners based on underlying data."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center">
              <Search className="w-5 h-5 mr-2 text-indigo-500" />
              {lang === "zh" ? "报告配置" : "Report Configuration"}
            </h2>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">{lang === "zh" ? "目标市场区域" : "Target Region"}</label>
              <div className="relative">
                <Map className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                >
                  <option>North America</option>
                  <option>Europe</option>
                  <option>Asia Pacific</option>
                  <option>Latin America</option>
                  <option>Middle East & Africa</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">{lang === "zh" ? "具体国家/地区" : "Specific Country/Region"}</label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                >
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                  <option>Germany</option>
                  <option>France</option>
                  <option>Japan</option>
                  <option>Australia</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">{lang === "zh" ? "所属行业" : "Industry"}</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">{lang === "zh" ? "业务模式" : "Business Model"}</label>
              <select 
                value={businessModel}
                onChange={(e) => setBusinessModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
              >
                <option>B2B (Business to Business)</option>
                <option>B2C (Business to Consumer)</option>
                <option>B2B2C</option>
              </select>
            </div>

            <div className="pt-4 space-y-3">
              <button 
                onClick={handleGenerateOutline}
                disabled={isGeneratingOutline || isGeneratingDetail}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-white border border-indigo-600 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50"
              >
                {isGeneratingOutline ? (
                  <span className="flex items-center"><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> {lang === "zh" ? "生成大纲中..." : "Generating Outline..."}</span>
                ) : (
                  <span className="flex items-center"><FileText className="w-4 h-4 mr-2" /> {lang === "zh" ? "生成报告大纲 (免费)" : "Generate Outline (Free)"}</span>
                )}
              </button>

              <div className="flex items-center justify-between px-3 py-2 bg-amber-50 rounded-lg border border-amber-100">
                <span className="text-xs font-medium text-amber-800">{lang === "zh" ? "深度分析" : "Deep Analysis"}</span>
                <span className="text-xs font-bold text-amber-600">{lang === "zh" ? "50 点数/次" : "50 Credits/time"}</span>
              </div>
              <button 
                onClick={handleGenerateDetail}
                disabled={isGeneratingOutline || isGeneratingDetail}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isGeneratingDetail ? (
                  <span className="flex items-center"><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> {lang === "zh" ? "生成详细报告中 (-50 点数)..." : "Generating Detail (-50 Credits)..."}</span>
                ) : (
                  <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2" /> {lang === "zh" ? "生成详细报告 (消耗 50 点数)" : "Generate Detailed Report (50 Credits)"}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-2">
          {reportType ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-900">
                  {industry} in {country} - 2026 
                  {reportType === "outline" && <span className="ml-2 text-xs font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded">{lang === "zh" ? "大纲预览" : "Outline Preview"}</span>}
                </h3>
                <button className="flex items-center px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
                  <Download className="w-4 h-4 mr-2" />
                  {lang === "zh" ? "导出 PDF" : "Export PDF"}
                </button>
              </div>
              <div className="p-8 overflow-y-auto prose prose-sm max-w-none prose-slate flex-1 markdown-body">
                <Markdown>{reportContent}</Markdown>
                
                {reportType === "outline" && (
                  <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center not-prose">
                    <p className="text-indigo-800 font-medium mb-3">{lang === "zh" ? "解锁包含详细数据、图表 and 完整名单的深度报告" : "Unlock the deep report with detailed data, charts, and full directories."}</p>
                    <button onClick={handleGenerateDetail} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700">
                      {lang === "zh" ? "生成详细报告 (50 点数)" : "Generate Detailed Report (50 Credits)"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed h-[600px] flex flex-col items-center justify-center text-slate-400">
              <FileText className="w-16 h-16 mb-4 text-slate-300" />
              <p>{lang === "zh" ? "配置参数并点击生成报告" : "Configure parameters and click generate"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
