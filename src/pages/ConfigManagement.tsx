import { useState } from "react";
import {
  Server,
  Code2,
  KeyRound,
  BellRing,
  Plus,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Edit,
  Trash2,
  Globe2,
  Languages,
  ShieldCheck,
} from "lucide-react";
import { cn } from "../components/Layout";

const tabs = [
  { id: "proxy", name: { zh: "代理池配置", en: "Proxy Pool" }, icon: Server },
  { id: "parser", name: { zh: "解析规则", en: "Parser Rules" }, icon: Code2 },
  { id: "account", name: { zh: "账号管理", en: "Account Mgmt" }, icon: KeyRound },
  { id: "translation", name: { zh: "翻译API", en: "Translation API" }, icon: Languages },
  { id: "compliance", name: { zh: "合规设置", en: "Compliance" }, icon: ShieldCheck },
  { id: "notify", name: { zh: "通知配置", en: "Notifications" }, icon: BellRing },
];

const proxies = [
  {
    id: 1,
    name: "阿布云动态代理",
    type: "HTTP/HTTPS",
    status: "active",
    latency: "45ms",
    successRate: "98.5%",
    lastCheck: "1分钟前",
    region: "domestic",
  },
  {
    id: 2,
    name: "Bright Data 住宅IP",
    type: "SOCKS5",
    status: "active",
    latency: "210ms",
    successRate: "99.1%",
    lastCheck: "2分钟前",
    region: "overseas",
  },
  {
    id: 3,
    name: "自建代理池节点A",
    type: "HTTP",
    status: "error",
    latency: "-",
    successRate: "0%",
    lastCheck: "10分钟前",
    region: "domestic",
  },
  {
    id: 4,
    name: "Oxylabs 专属节点 (US)",
    type: "HTTPS",
    status: "active",
    latency: "180ms",
    successRate: "97.8%",
    lastCheck: "5分钟前",
    region: "overseas",
  },
];

export function ConfigManagement({ lang }: { lang: "zh" | "en" }) {
  const [activeTab, setActiveTab] = useState("proxy");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">
          {lang === "zh" ? "配置管理" : "Configuration"}
        </h1>
        <button className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20 w-fit">
          <Plus className="w-4 h-4 mr-2" />
          {lang === "zh" ? "添加配置" : "Add Config"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-200/50 p-1 rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200",
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 mr-2",
                  isActive ? "text-emerald-500" : "text-slate-400",
                )}
              />
              {tab.name[lang]}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        {activeTab === "proxy" && (
          <div>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-semibold text-slate-700">
                {lang === "zh" ? "代理节点列表" : "Proxy Nodes List"}
              </h2>
              <button className="flex items-center text-sm text-slate-500 hover:text-emerald-600 transition-colors">
                <RefreshCw className="w-4 h-4 mr-1.5" />
                {lang === "zh" ? "全部检测" : "Test All"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="p-4 text-sm font-semibold text-slate-600">
                      {lang === "zh" ? "节点名称" : "Node Name"}
                    </th>
                    <th className="p-4 text-sm font-semibold text-slate-600">
                      {lang === "zh" ? "区域" : "Region"}
                    </th>
                    <th className="p-4 text-sm font-semibold text-slate-600">
                      {lang === "zh" ? "协议类型" : "Protocol"}
                    </th>
                    <th className="p-4 text-sm font-semibold text-slate-600">
                      {lang === "zh" ? "状态" : "Status"}
                    </th>
                    <th className="p-4 text-sm font-semibold text-slate-600">
                      {lang === "zh" ? "延迟" : "Latency"}
                    </th>
                    <th className="p-4 text-sm font-semibold text-slate-600">
                      {lang === "zh" ? "成功率" : "Success Rate"}
                    </th>
                    <th className="p-4 text-sm font-semibold text-slate-600">
                      {lang === "zh" ? "最后检测" : "Last Checked"}
                    </th>
                    <th className="p-4 text-sm font-semibold text-slate-600 text-right">
                      {lang === "zh" ? "操作" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proxies.map((proxy) => (
                    <tr
                      key={proxy.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="p-4 text-sm font-medium text-slate-900">
                        {proxy.name}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {proxy.region === 'overseas' ? (
                          <span className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit text-xs font-medium">
                            <Globe2 className="w-3 h-3 mr-1" />
                            {lang === "zh" ? "海外" : "Overseas"}
                          </span>
                        ) : (
                          <span className="flex items-center text-slate-600 bg-slate-100 px-2 py-1 rounded w-fit text-xs font-medium">
                            {lang === "zh" ? "国内" : "Domestic"}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono">
                          {proxy.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          {proxy.status === "active" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500 mr-1.5" />
                          )}
                          <span
                            className={cn(
                              "text-sm font-medium",
                              proxy.status === "active"
                                ? "text-emerald-600"
                                : "text-red-600",
                            )}
                          >
                            {proxy.status === "active" ? (lang === "zh" ? "可用" : "Active") : (lang === "zh" ? "失效" : "Error")}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-mono text-slate-600">
                        {proxy.latency}
                      </td>
                      <td className="p-4 text-sm font-mono text-slate-600">
                        {proxy.successRate}
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {proxy.lastCheck}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md"
                            title={lang === "zh" ? "测试" : "Test"}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md"
                            title={lang === "zh" ? "编辑" : "Edit"}
                          >
                            <Edit className="w-4 h-4" />
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
            </div>
          </div>
        )}

        {activeTab === "translation" && (
          <div className="p-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Languages className="w-12 h-12 mx-auto text-indigo-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {lang === "zh" ? "翻译 API 配置" : "Translation API Config"}
              </h3>
              <p className="text-sm text-slate-500">
                {lang === "zh" ? "配置用于海外数据自动翻译的第三方 API 服务。" : "Configure third-party API services for automatic translation of overseas data."}
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-700">G</div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Google Cloud Translation</h4>
                      <p className="text-xs text-slate-500">{lang === "zh" ? "推荐用于多语种长文本" : "Recommended for multi-language long text"}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    {lang === "zh" ? "已启用" : "Enabled"}
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">API Key</label>
                    <input type="password" value="************************" readOnly className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                      {lang === "zh" ? "测试连接" : "Test Connection"}
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      {lang === "zh" ? "编辑" : "Edit"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-700">D</div>
                    <div>
                      <h4 className="font-semibold text-slate-900">DeepL API</h4>
                      <p className="text-xs text-slate-500">{lang === "zh" ? "高质量机器翻译引擎" : "High-quality MT engine"}</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors">
                    {lang === "zh" ? "配置" : "Configure"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "compliance" && (
          <div className="p-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <ShieldCheck className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {lang === "zh" ? "数据合规与隐私设置" : "Data Compliance & Privacy"}
              </h3>
              <p className="text-sm text-slate-500">
                {lang === "zh" ? "管理海外数据采集的合规策略，确保符合 GDPR、CCPA 等隐私法规。" : "Manage compliance strategies for overseas data collection to ensure adherence to GDPR, CCPA, etc."}
              </p>
            </div>

            <div className="space-y-6">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">{lang === "zh" ? "Robots.txt 协议遵守" : "Robots.txt Adherence"}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{lang === "zh" ? "自动解析并遵守目标网站的爬虫协议" : "Automatically parse and respect target site's crawler protocol"}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <div className="p-4 bg-white">
                  <div className="text-sm text-slate-600 mb-3">
                    {lang === "zh" ? "当目标网站禁止抓取时：" : "When target site disallows crawling:"}
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="radio" name="robots_action" className="text-emerald-500 focus:ring-emerald-500" defaultChecked />
                      {lang === "zh" ? "严格遵守，跳过禁止抓取的路径" : "Strictly adhere, skip disallowed paths"}
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="radio" name="robots_action" className="text-emerald-500 focus:ring-emerald-500" />
                      {lang === "zh" ? "仅记录警告，继续抓取 (风险较高)" : "Log warning only, continue crawling (High Risk)"}
                    </label>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">{lang === "zh" ? "个人信息 (PII) 自动脱敏" : "PII Auto-Masking"}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{lang === "zh" ? "在存储前自动模糊处理敏感个人信息" : "Automatically obscure sensitive personal info before storage"}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" className="rounded text-emerald-500 focus:ring-emerald-500" defaultChecked />
                      {lang === "zh" ? "邮箱地址 (如: j***@example.com)" : "Email Addresses (e.g., j***@example.com)"}
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" className="rounded text-emerald-500 focus:ring-emerald-500" defaultChecked />
                      {lang === "zh" ? "电话号码 (如: +1 415****789)" : "Phone Numbers (e.g., +1 415****789)"}
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" className="rounded text-emerald-500 focus:ring-emerald-500" />
                      {lang === "zh" ? "精确地理位置" : "Precise Geolocation"}
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" className="rounded text-emerald-500 focus:ring-emerald-500" />
                      {lang === "zh" ? "社交媒体账号链接" : "Social Media Profile Links"}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "parser" && (
          <div className="p-8 text-center text-slate-500">
            <Code2 className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {lang === "zh" ? "解析规则配置" : "Parser Rules Configuration"}
            </h3>
            <p className="text-sm max-w-md mx-auto">
              {lang === "zh" ? "可视化配置 XPath、CSS 选择器或正则表达式，支持在线测试解析效果，将异构网页数据标准化。" : "Visually configure XPath, CSS selectors, or Regex. Support online testing to standardize heterogeneous web data."}
            </p>
            <button className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
              {lang === "zh" ? "新建解析规则" : "New Parser Rule"}
            </button>
          </div>
        )}

        {activeTab === "account" && (
          <div className="p-8 text-center text-slate-500">
            <KeyRound className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {lang === "zh" ? "账号与登录态管理" : "Account & Login State Management"}
            </h3>
            <p className="text-sm max-w-md mx-auto">
              {lang === "zh" ? "管理各 B2B 平台的登录账号，支持自动刷新 Cookie、扫码登录及验证码自动打码接入。" : "Manage login accounts for B2B platforms, supporting auto Cookie refresh, QR login, and captcha solving integration."}
            </p>
            <button className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
              {lang === "zh" ? "添加平台账号" : "Add Platform Account"}
            </button>
          </div>
        )}

        {activeTab === "notify" && (
          <div className="p-8 text-center text-slate-500">
            <BellRing className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {lang === "zh" ? "告警与通知配置" : "Alerts & Notifications Config"}
            </h3>
            <p className="text-sm max-w-md mx-auto">
              {lang === "zh" ? "配置邮件、钉钉机器人、企业微信等通知渠道，在任务异常、反爬触发或任务完成时及时接收通知。" : "Configure email, Slack, DingTalk, etc., to receive timely notifications on task errors, anti-bot triggers, or completion."}
            </p>
            <button className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
              {lang === "zh" ? "配置通知渠道" : "Configure Notification Channel"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
