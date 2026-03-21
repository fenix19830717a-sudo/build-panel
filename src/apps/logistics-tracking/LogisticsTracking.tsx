import { useState } from "react";
import { Truck, Search, Package, MapPin, CheckCircle2, Clock, Globe, Coins } from "lucide-react";

export function LogisticsTracking({ lang }: { lang: "zh" | "en" }) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  const handleSearch = () => {
    if (!trackingNumber) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setHasResult(true);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="logistics-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" id="logistics-title">
            {lang === "zh" ? "全球物流查询" : "Global Logistics Tracking"}
          </h1>
          <p className="text-sm text-slate-500 mt-1" id="logistics-desc">
            {lang === "zh" ? "输入运单号，一键查询全球国际物流轨迹与实时状态。" : "Enter tracking number to query global logistics trajectory and real-time status."}
          </p>
          <div className="mt-3 flex items-center">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200 flex items-center">
              <Coins className="w-3 h-3 mr-1" />
              {lang === "zh" ? "免费使用 (有频率限制)" : "Free to use (Rate limited)"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder={lang === "zh" ? "输入运单号 (例如: YT1234567890)" : "Enter tracking number (e.g. YT1234567890)"}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center shadow-sm disabled:opacity-70"
          >
            {isSearching ? (
              <Clock className="w-5 h-5 animate-spin" />
            ) : (
              lang === "zh" ? "查询轨迹" : "Track"
            )}
          </button>
        </div>
      </div>

      {hasResult && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{trackingNumber}</h3>
                <p className="text-sm text-slate-500 flex items-center mt-0.5">
                  <Globe className="w-4 h-4 mr-1" /> DHL Express
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                {lang === "zh" ? "运输中" : "In Transit"}
              </div>
              <p className="text-xs text-slate-500">
                {lang === "zh" ? "预计送达: 3天后" : "Estimated Delivery: In 3 days"}
              </p>
            </div>
          </div>

          <div className="p-8">
            <div className="relative border-l-2 border-indigo-100 ml-3 space-y-8">
              <div className="relative pl-8">
                <div className="absolute -left-[9px] top-1 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white shadow-sm"></div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{lang === "zh" ? "到达处理中心" : "Arrived at Sort Facility"}</h4>
                    <p className="text-sm text-slate-500 mt-1 flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-slate-400" /> Los Angeles, CA, US
                    </p>
                  </div>
                  <div className="text-sm font-medium text-slate-400">
                    2026-02-27 08:30
                  </div>
                </div>
              </div>

              <div className="relative pl-8">
                <div className="absolute -left-[9px] top-1 w-4 h-4 bg-slate-300 rounded-full border-4 border-white shadow-sm"></div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-700 text-sm">{lang === "zh" ? "离开国际分拣中心" : "Departed International Sort Center"}</h4>
                    <p className="text-sm text-slate-500 mt-1 flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-slate-400" /> Shenzhen, China
                    </p>
                  </div>
                  <div className="text-sm font-medium text-slate-400">
                    2026-02-25 14:20
                  </div>
                </div>
              </div>

              <div className="relative pl-8">
                <div className="absolute -left-[9px] top-1 w-4 h-4 bg-slate-300 rounded-full border-4 border-white shadow-sm"></div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-700 text-sm">{lang === "zh" ? "包裹已揽收" : "Package Received"}</h4>
                    <p className="text-sm text-slate-500 mt-1 flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-slate-400" /> Shenzhen, China
                    </p>
                  </div>
                  <div className="text-sm font-medium text-slate-400">
                    2026-02-24 09:15
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
