import { useState } from "react";
import {
  Download,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckSquare,
  Square,
  Globe2,
  Activity,
} from "lucide-react";
import { cn } from "../components/Layout";

const dataList = [
  {
    id: "D-001",
    company: "深圳市华强北电子科技有限公司",
    contact: "张三",
    phone: "138****1234",
    platform: "1688",
    industry: "电子元器件",
    updateTime: "2026-02-26 10:30",
    type: "domestic",
    country: "CN",
  },
  {
    id: "D-002",
    company: "Global Tech Solutions LLC",
    contact: "John Doe",
    phone: "+1 415****789",
    platform: "US CBP",
    industry: "Consumer Electronics",
    updateTime: "2026-02-26 09:15",
    type: "overseas",
    country: "US",
  },
  {
    id: "D-003",
    company: "东莞市精工机械制造有限公司",
    contact: "王五",
    phone: "137****9012",
    platform: "中国制造网",
    industry: "机械设备",
    updateTime: "2026-02-25 18:00",
    type: "domestic",
    country: "CN",
  },
  {
    id: "D-004",
    company: "EuroMachinery GmbH",
    contact: "Hans Müller",
    phone: "+49 30****123",
    platform: "EU TARIC",
    industry: "Industrial Machinery",
    updateTime: "2026-02-26 11:45",
    type: "overseas",
    country: "DE",
  },
  {
    id: "D-005",
    company: "杭州西湖丝绸服饰有限公司",
    contact: "钱七",
    phone: "135****7890",
    platform: "1688",
    industry: "纺织服装",
    updateTime: "2026-02-26 12:10",
    type: "domestic",
    country: "CN",
  },
  {
    id: "D-006",
    company: "TechVision Innovators Inc.",
    contact: "Sarah Connor",
    phone: "+1 650****555",
    platform: "Google Maps",
    industry: "Software",
    updateTime: "2026-02-26 14:20",
    type: "overseas",
    country: "US",
  },
  {
    id: "D-007",
    company: "London Finance Group Ltd",
    contact: "Arthur Pendragon",
    phone: "+44 20****888",
    platform: "LinkedIn",
    industry: "Financial Services",
    updateTime: "2026-02-26 15:05",
    type: "overseas",
    country: "UK",
  },
  {
    id: "D-008",
    company: "巨鲸地址: 0x7a...3b9c",
    contact: "Win Rate: 78%",
    phone: "Vol: $2.4M",
    platform: "Polymarket",
    industry: "Crypto Predictions",
    updateTime: "2026-02-26 16:30",
    type: "web3",
    country: "Global",
  },
  {
    id: "D-009",
    company: "高胜率账号交易 (ID: 9921)",
    contact: "Price: 5 ETH",
    phone: "ROI: +450%",
    platform: "PolyAccounts",
    industry: "Account Trading",
    updateTime: "2026-02-26 17:15",
    type: "web3",
    country: "Global",
  },
];

export function DataManagement({ lang }: { lang: "zh" | "en" }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dataType, setDataType] = useState<"all" | "domestic" | "overseas" | "web3">("all");

  const toggleSelectAll = () => {
    if (selectedIds.length === dataList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(dataList.map((d) => d.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredData = dataList.filter(item => dataType === "all" || item.type === dataType);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">
          {lang === "zh" ? "数据管理" : "Data Management"}
        </h1>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <Trash2 className="w-4 h-4 mr-2" />
            {lang === "zh" ? "批量清洗" : "Batch Clean"}
          </button>
          <button className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20">
            <Download className="w-4 h-4 mr-2" />
            {lang === "zh" ? "导出选中 (CSV)" : "Export Selected (CSV)"}
          </button>
        </div>
      </div>

      {/* Data Type Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setDataType("all")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            dataType === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          {lang === "zh" ? "全部数据" : "All Data"}
        </button>
        <button
          onClick={() => setDataType("domestic")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            dataType === "domestic" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          {lang === "zh" ? "国内数据" : "Domestic"}
        </button>
        <button
          onClick={() => setDataType("overseas")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
            dataType === "overseas" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Globe2 className="w-4 h-4" />
          {lang === "zh" ? "海外数据" : "Overseas"}
        </button>
        <button
          onClick={() => setDataType("web3")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
            dataType === "web3" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Activity className="w-4 h-4" />
          {lang === "zh" ? "Web3/预测市场" : "Web3 Markets"}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={lang === "zh" ? "搜索企业名称、联系人、电话、HS编码..." : "Search company, contact, phone, HS code..."}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
          />
        </div>
        <div className="flex gap-2">
          {dataType !== "domestic" && (
            <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none">
              <option value="">{lang === "zh" ? "国家/地区" : "Country/Region"}</option>
              <option value="US">United States</option>
              <option value="DE">Germany</option>
              <option value="CN">China</option>
            </select>
          )}
          <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none">
            <option value="">{lang === "zh" ? "所属行业" : "Industry"}</option>
            <option value="电子">{lang === "zh" ? "电子元器件" : "Electronics"}</option>
            <option value="化工">{lang === "zh" ? "化工原料" : "Chemicals"}</option>
            <option value="机械">{lang === "zh" ? "机械设备" : "Machinery"}</option>
          </select>
          <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none">
            <option value="">{lang === "zh" ? "数据来源" : "Source"}</option>
            <option value="1688">1688</option>
            <option value="hc360">慧聪网</option>
            <option value="us_cbp">US CBP</option>
            <option value="eu_taric">EU TARIC</option>
            <option value="google_maps">Google Maps</option>
            <option value="google_search">Google Search</option>
            <option value="linkedin">LinkedIn</option>
            <option value="polymarket">Polymarket</option>
          </select>
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 w-12 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-emerald-500"
                  >
                    {selectedIds.length === dataList.length && dataList.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  {lang === "zh" ? "企业名称" : "Company Name"}
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  {lang === "zh" ? "联系人" : "Contact"}
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  {lang === "zh" ? "联系电话" : "Phone"}
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  {lang === "zh" ? "所属行业" : "Industry"}
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  {lang === "zh" ? "来源平台" : "Source"}
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  {lang === "zh" ? "更新时间" : "Updated At"}
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">
                  {lang === "zh" ? "操作" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    "hover:bg-slate-50/50 transition-colors group",
                    selectedIds.includes(item.id) && "bg-emerald-50/30",
                  )}
                >
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className="text-slate-400 hover:text-emerald-500"
                    >
                      {selectedIds.includes(item.id) ? (
                        <CheckSquare className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      {item.company}
                      {item.type === 'overseas' && (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                          {item.country}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{item.contact}</td>
                  <td className="p-4 text-sm font-mono text-slate-600">
                    {item.phone}
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {item.industry}
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                      {item.platform}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {item.updateTime}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md"
                        title={lang === "zh" ? "查看详情" : "View Details"}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                        title={lang === "zh" ? "删除" : "Delete"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              {lang === "zh" ? "暂无数据" : "No data available"}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <div>
            {lang === "zh" ? "已选择" : "Selected"}{" "}
            <span className="font-medium text-emerald-600">
              {selectedIds.length}
            </span>{" "}
            / {filteredData.length} {lang === "zh" ? "条记录" : "records"}
          </div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50">
              {lang === "zh" ? "上一页" : "Prev"}
            </button>
            <button className="px-3 py-1 bg-emerald-50 text-emerald-600 font-medium rounded-md">
              1
            </button>
            <button className="px-3 py-1 hover:bg-slate-50 rounded-md">
              2
            </button>
            <button className="px-3 py-1 hover:bg-slate-50 rounded-md">
              3
            </button>
            <span className="px-2 py-1">...</span>
            <button className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50">
              {lang === "zh" ? "下一页" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
