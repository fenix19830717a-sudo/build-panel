import { useState } from "react";
import { Video, Upload, PlayCircle, Wand2, Settings2, Image as ImageIcon, MonitorPlay, Cloud, Link, Search } from "lucide-react";
import { cn } from "../../components/Layout";

export function VideoMixer({ lang }: { lang: "zh" | "en" }) {
  const [mode, setMode] = useState<"ai" | "simple">("ai");

  return (
    <div className="space-y-6" id="video-mixer-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" id="video-mixer-title">
            {lang === "zh" ? "视频混剪生成器" : "Video Remix Generator"}
          </h1>
          <p className="text-sm text-slate-500 mt-1" id="video-mixer-desc">
            {lang === "zh" ? "利用爬虫获取的商品素材，自动生成 TikTok/Reels 营销视频。" : "Use scraped product assets to generate marketing videos for TikTok/Reels."}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            id="btn-generate-video"
            className="flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors shadow-sm"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {lang === "zh" ? "一键生成" : "Generate Now"}
          </button>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit" id="video-mode-toggle">
        <button
          onClick={() => setMode("ai")}
          className={cn(
            "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            mode === "ai" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Cloud className="w-4 h-4 mr-2" />
          {lang === "zh" ? "AI 云端模式" : "AI Cloud Mode"}
        </button>
        <button
          onClick={() => setMode("simple")}
          className={cn(
            "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            mode === "simple" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <MonitorPlay className="w-4 h-4 mr-2" />
          {lang === "zh" ? "本地轻量模式 (浏览器内处理)" : "Local Simple Mode (In-Browser)"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Assets */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm" id="assets-panel">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
              <ImageIcon className="w-4 h-4 mr-2 text-slate-400" />
              {lang === "zh" ? "素材来源" : "Asset Sources"}
            </h3>

            {/* Source Input */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder={lang === "zh" ? "输入商品链接 (1688/Alibaba/Amazon)" : "Enter product link..."} className="w-full pl-9 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                <button className="absolute right-1 top-1 bottom-1 px-3 bg-indigo-100 text-indigo-700 text-xs font-medium rounded hover:bg-indigo-200 transition-colors">
                  {lang === "zh" ? "抓取" : "Scrape"}
                </button>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder={lang === "zh" ? "或输入关键词搜索素材" : "Or enter keywords to search..."} className="w-full pl-9 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                <button className="absolute right-1 top-1 bottom-1 px-3 bg-indigo-100 text-indigo-700 text-xs font-medium rounded hover:bg-indigo-200 transition-colors">
                  {lang === "zh" ? "搜索" : "Search"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2" id="assets-grid">
              <div className="aspect-square bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center relative group cursor-pointer">
                <img src="https://picsum.photos/seed/prod1/200/200" alt="Product" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-medium">Select</span>
                </div>
              </div>
              <div className="aspect-square bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center relative group cursor-pointer">
                <img src="https://picsum.photos/seed/prod2/200/200" alt="Product" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
              </div>
              <div className="aspect-square bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center relative group cursor-pointer">
                <img src="https://picsum.photos/seed/prod3/200/200" alt="Product" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
              </div>
              <div className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-violet-500 hover:border-violet-300 transition-colors cursor-pointer">
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-xs">{lang === "zh" ? "上传本地" : "Upload"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm" id="settings-panel">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
              <Settings2 className="w-4 h-4 mr-2 text-slate-400" />
              {lang === "zh" ? "生成设置" : "Settings"}
            </h3>
            <div className="space-y-3">
              {mode === "simple" && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-100 mb-4">
                  {lang === "zh" 
                    ? "利用 WebAssembly (ffmpeg.wasm) 技术，直接在您的浏览器内存中完成视频混剪。无需配置任何本地环境，数据不上传，安全高效。" 
                    : "Uses WebAssembly (ffmpeg.wasm) to process videos directly in your browser memory. No local setup required, zero data upload, secure and efficient."}
                </div>
              )}
              
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">{lang === "zh" ? "视频比例" : "Aspect Ratio"}</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" id="select-aspect-ratio">
                  <option>9:16 (TikTok/Reels/Shorts)</option>
                  <option>16:9 (YouTube)</option>
                  <option>1:1 (Instagram Post)</option>
                </select>
              </div>

              {mode === "ai" ? (
                <>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">{lang === "zh" ? "AI 配音语言" : "AI Voiceover Language"}</label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" id="select-ai-voice">
                      <option>English (US) - Female</option>
                      <option>English (UK) - Male</option>
                      <option>Spanish - Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">{lang === "zh" ? "营销文案提示词" : "Copywriting Prompt"}</label>
                    <textarea 
                      id="input-copywriting-prompt"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none resize-none h-20"
                      placeholder={lang === "zh" ? "描述产品卖点..." : "Describe product selling points..."}
                      defaultValue={lang === "zh" ? "生成一段充满活力的TikTok带货文案，强调产品的性价比和实用性。" : "Generate an energetic TikTok sales pitch highlighting value and utility."}
                    ></textarea>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-amber-800">{lang === "zh" ? "计费方式" : "Billing Method"}</span>
                      <span className="text-xs font-bold text-amber-600">{lang === "zh" ? "按次收费 + API 费用" : "Pay-per-use + API Cost"}</span>
                    </div>
                    <p className="text-[10px] text-amber-700">{lang === "zh" ? "每次生成扣除 100 点数，外加实际产生的 AI 模型 API 调用费用。" : "Deducts 100 credits per generation, plus actual AI model API usage costs."}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4 border-t border-slate-100 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{lang === "zh" ? "五段式混剪内容" : "5-Segment Remix Content"}</h4>
                      <select className="text-[10px] font-bold uppercase tracking-wider bg-violet-50 text-violet-700 border border-violet-100 rounded px-2 py-1 outline-none">
                        <option>TikTok Viral Style</option>
                        <option>Cinematic Story</option>
                        <option>Fast Cut Action</option>
                        <option>Product Showcase</option>
                      </select>
                    </div>
                    
                    {[
                      { id: 1, label: lang === "zh" ? "黄金3秒 (Hook)" : "Golden 3s (Hook)" },
                      { id: 2, label: lang === "zh" ? "痛点展示" : "Pain Point" },
                      { id: 3, label: lang === "zh" ? "产品亮相" : "Product Reveal" },
                      { id: 4, label: lang === "zh" ? "功能演示" : "Feature Demo" },
                      { id: 5, label: lang === "zh" ? "行动呼吁 (CTA)" : "Call to Action" }
                    ].map((segment) => (
                      <div key={segment.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold text-slate-700 block">{segment.label}</label>
                          <span className="text-[10px] text-slate-400">Segment {segment.id}</span>
                        </div>
                        <div className="flex gap-2 mb-2">
                          <button className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-medium rounded hover:bg-slate-50 transition-colors flex items-center justify-center">
                            <ImageIcon className="w-3 h-3 mr-1" />
                            {lang === "zh" ? "图片/视频" : "Img/Video"}
                          </button>
                          <button className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-medium rounded hover:bg-slate-50 transition-colors flex items-center justify-center">
                            <Upload className="w-3 h-3 mr-1" />
                            {lang === "zh" ? "上传" : "Upload"}
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center text-[10px] text-slate-600 cursor-pointer">
                            <input type="radio" name={`seq-${segment.id}`} className="mr-1.5" defaultChecked />
                            {lang === "zh" ? "按顺序" : "Sequential"}
                          </label>
                          <label className="flex items-center text-[10px] text-slate-600 cursor-pointer">
                            <input type="radio" name={`seq-${segment.id}`} className="mr-1.5" />
                            {lang === "zh" ? "随机" : "Random"}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-4">
                    <label className="text-xs font-medium text-slate-700 block mb-2">{lang === "zh" ? "背景音乐 (BGM)" : "Background Music (BGM)"}</label>
                    <div className="flex gap-2 mb-2">
                      <button className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs rounded hover:bg-slate-50 transition-colors">
                        {lang === "zh" ? "选择文件" : "Select Files"}
                      </button>
                      <button className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs rounded hover:bg-slate-50 transition-colors">
                        {lang === "zh" ? "选择文件夹" : "Select Folder"}
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center text-xs text-slate-600 cursor-pointer">
                        <input type="radio" name="bgm-seq" className="mr-1.5" defaultChecked />
                        {lang === "zh" ? "按顺序" : "Sequential"}
                      </label>
                      <label className="flex items-center text-xs text-slate-600 cursor-pointer">
                        <input type="radio" name="bgm-seq" className="mr-1.5" />
                        {lang === "zh" ? "随机" : "Random"}
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-4">
                    <label className="text-xs font-medium text-slate-700 block mb-1">{lang === "zh" ? "批量生成数量" : "Batch Quantity"}</label>
                    <input type="number" min="1" defaultValue="1" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-emerald-800">{lang === "zh" ? "计费方式" : "Billing Method"}</span>
                      <span className="text-xs font-bold text-emerald-600">{lang === "zh" ? "完全免费" : "Completely Free"}</span>
                    </div>
                    <p className="text-[10px] text-emerald-700">{lang === "zh" ? "本地处理不消耗服务器资源，无限次免费生成。" : "Local processing consumes no server resources, unlimited free generations."}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Preview & Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden shadow-lg" id="video-preview">
            <img src="https://picsum.photos/seed/video/1280/720?blur=2" alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" referrerPolicy="no-referrer" />
            <button className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10">
              <PlayCircle className="w-10 h-10" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 text-center z-10">
              <p className="text-white font-bold text-2xl drop-shadow-md">
                "You won't believe how useful this is! 🤯"
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm" id="video-timeline">
            <div className="text-sm font-medium text-slate-700 mb-2">{lang === "zh" ? "时间轴" : "Timeline"}</div>
            <div className="h-24 bg-slate-50 rounded-lg border border-slate-200 relative overflow-hidden flex">
              {/* Mock Timeline Tracks */}
              <div className="w-1/4 h-full border-r border-slate-200 bg-violet-100/50 p-1">
                <div className="w-full h-1/2 bg-violet-400 rounded text-[10px] text-white px-1 overflow-hidden">Clip 1</div>
                <div className="w-full h-1/2 bg-blue-400 rounded text-[10px] text-white px-1 mt-0.5 overflow-hidden">Audio</div>
              </div>
              <div className="w-1/3 h-full border-r border-slate-200 bg-violet-100/50 p-1">
                <div className="w-full h-1/2 bg-violet-500 rounded text-[10px] text-white px-1 overflow-hidden">Clip 2</div>
                <div className="w-full h-1/2 bg-blue-400 rounded text-[10px] text-white px-1 mt-0.5 overflow-hidden">Audio</div>
              </div>
              <div className="w-5/12 h-full bg-violet-100/50 p-1">
                <div className="w-full h-1/2 bg-violet-400 rounded text-[10px] text-white px-1 overflow-hidden">Clip 3</div>
                <div className="w-full h-1/2 bg-blue-400 rounded text-[10px] text-white px-1 mt-0.5 overflow-hidden">Audio</div>
              </div>
              {/* Playhead */}
              <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-red-500 z-10">
                <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
