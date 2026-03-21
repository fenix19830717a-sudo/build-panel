import { useState, useEffect } from "react";
import { Check, CreditCard, Smartphone, Globe, Coins, RefreshCw } from "lucide-react";
import { cn } from "../components/Layout";

export function Billing({ lang }: { lang: "zh" | "en" }) {
  const [currency, setCurrency] = useState<"USD" | "RMB">("USD");
  const [packages, setPackages] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuying, setIsBuying] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pkgsRes, pricingRes] = await Promise.all([
        fetch("/api/admin/packages"),
        fetch("/api/admin/pricing")
      ]);
      setPackages(await pkgsRes.json());
      setPricing(await pricingRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = async (pkg: any) => {
    setIsBuying(pkg.id);
    try {
      const res = await fetch("/api/admin/billing-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: 1, // Demo user
          amount: pkg.price,
          credits_added: pkg.credits,
          payment_method: "Stripe"
        })
      });
      if (res.ok) {
        alert(lang === 'zh' ? `充值成功！已添加 ${pkg.credits} 点数。` : `Purchase successful! Added ${pkg.credits} credits.`);
        // In a real app, we'd refresh user stats here
        window.location.reload(); 
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsBuying(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">
          {lang === "zh" ? "订阅与支付" : "Billing & Subscription"}
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          {lang === "zh" 
            ? "升级您的套餐以解锁更多高级应用、更高的 API 调用额度以及专属的海外代理节点。" 
            : "Upgrade your plan to unlock premium apps, higher API limits, and dedicated overseas proxy nodes."}
        </p>
        <div className="flex justify-center mt-4">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setCurrency("USD")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                currency === "USD" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              )}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency("RMB")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                currency === "RMB" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              )}
            >
              RMB (¥)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Plans (Keep existing static plans for now as they are structural) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900">{lang === "zh" ? "免费版" : "Free"}</h3>
          <div className="mt-4 flex items-baseline text-4xl font-extrabold text-slate-900">
            {currency === "USD" ? "$0" : "¥0"}
            <span className="ml-1 text-sm font-medium text-slate-500">/mo</span>
          </div>
          <p className="mt-4 text-xs text-slate-500 min-h-[40px]">
            {lang === "zh" ? "体验平台核心功能，不支持独立站生成。" : "Experience core features, no site generation."}
          </p>
          <ul className="mt-6 space-y-3 flex-1">
            {["3 次免费试用点数", "不支持独立站", "基础客服翻译", "基础知识库"].map((feature, i) => (
              <li key={i} className="flex items-start text-xs text-slate-700">
                <Check className="w-4 h-4 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                {feature}
              </li>
            ))}
          </ul>
          <button className="mt-6 w-full py-2.5 px-4 bg-slate-100 text-slate-900 rounded-xl font-medium hover:bg-slate-200 transition-colors text-sm">
            {lang === "zh" ? "当前套餐" : "Current Plan"}
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900">{lang === "zh" ? "基础版 (个人)" : "Basic (Personal)"}</h3>
          <div className="mt-4 flex items-baseline text-4xl font-extrabold text-slate-900">
            {currency === "USD" ? "$29" : "¥199"}
            <span className="ml-1 text-sm font-medium text-slate-500">/mo</span>
          </div>
          <p className="mt-4 text-xs text-slate-500 min-h-[40px]">
            {lang === "zh" ? "适合个人外贸 SOHO，按需购买点数。" : "Perfect for individual traders, buy credits as needed."}
          </p>
          <ul className="mt-6 space-y-3 flex-1">
            {["解锁所有爬虫工具", "解锁邮件营销", "解锁视频混剪", "不支持独立站生成"].map((feature, i) => (
              <li key={i} className="flex items-start text-xs text-slate-700">
                <Check className="w-4 h-4 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                {feature}
              </li>
            ))}
          </ul>
          <button className="mt-6 w-full py-2.5 px-4 bg-indigo-50 text-indigo-600 rounded-xl font-medium hover:bg-indigo-100 transition-colors text-sm">
            {lang === "zh" ? "升级基础版" : "Upgrade Basic"}
          </button>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-900 shadow-xl flex flex-col relative transform md:-translate-y-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase">
            {lang === "zh" ? "包含独立站" : "Includes Site"}
          </div>
          <h3 className="text-lg font-semibold text-white">{lang === "zh" ? "专业版 (独立站)" : "Pro (Site)"}</h3>
          <div className="mt-4 flex items-baseline text-4xl font-extrabold text-white">
            {currency === "USD" ? "$299" : "¥2000"}
            <span className="ml-1 text-sm font-medium text-slate-400">/yr</span>
          </div>
          <p className="mt-4 text-xs text-slate-400 min-h-[40px]">
            {lang === "zh" ? "包含1年独立站服务器费用及1次生成费用。" : "Includes 1-year site hosting and 1 generation fee."}
          </p>
          <ul className="mt-6 space-y-3 flex-1">
            {["包含 1 个独立站部署", "解锁 AI 独立站运营", "解锁社媒发布", "专属客服支持"].map((feature, i) => (
              <li key={i} className="flex items-start text-xs text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0 mt-0.5" />
                {feature}
              </li>
            ))}
          </ul>
          <button className="mt-6 w-full py-2.5 px-4 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-400 transition-colors text-sm">
            {lang === "zh" ? "升级专业版" : "Upgrade Pro"}
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900">{lang === "zh" ? "企业版" : "Enterprise"}</h3>
          <div className="mt-4 flex items-baseline text-4xl font-extrabold text-slate-900">
            {lang === "zh" ? "定制" : "Custom"}
          </div>
          <p className="mt-4 text-xs text-slate-500 min-h-[40px]">
            {lang === "zh" ? "多项目管理，自定义额度与私有化部署。" : "Multi-project management, custom quotas."}
          </p>
          <ul className="mt-6 space-y-3 flex-1">
            {["多独立站项目管理", "自定义点数额度", "Polymarket 交易机器人", "API 白名单与定制"].map((feature, i) => (
              <li key={i} className="flex items-start text-xs text-slate-700">
                <Check className="w-4 h-4 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                {feature}
              </li>
            ))}
          </ul>
          <button className="mt-6 w-full py-2.5 px-4 bg-white border-2 border-slate-200 text-slate-900 rounded-xl font-medium hover:border-slate-300 transition-colors text-sm">
            {lang === "zh" ? "联系销售" : "Contact Sales"}
          </button>
        </div>
      </div>

      {/* Credit Packs & Pricing Details */}
      <div className="mt-12 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{lang === "zh" ? "点数购买与消耗说明" : "Credit Packs & Usage"}</h2>
            <p className="text-sm text-slate-500 mt-1">{lang === "zh" ? "非 AI 功能大幅降价，AI 功能按实际 API 成本核算。" : "Non-AI features are discounted. AI features are billed based on actual API costs."}</p>
          </div>
          <button onClick={fetchData} className="p-2 text-slate-400 hover:text-indigo-600">
            <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Buy Credits */}
          <div className="p-6 lg:col-span-1 bg-indigo-50/30">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center">
              <Coins className="w-5 h-5 mr-2 text-indigo-500" />
              {lang === "zh" ? "购买点数包" : "Buy Credit Packs"}
            </h3>
            <div className="space-y-3">
              {packages.map((pkg) => (
                <button 
                  key={pkg.id}
                  onClick={() => handleBuy(pkg)}
                  disabled={isBuying === pkg.id}
                  className="w-full flex items-center justify-between p-3 bg-white border border-indigo-100 rounded-xl hover:border-indigo-500 hover:shadow-sm transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3 text-xs">
                      {pkg.credits >= 1000 ? `${pkg.credits/1000}k` : pkg.credits}
                    </div>
                    <span className="font-medium text-slate-700 group-hover:text-indigo-700">{pkg.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-slate-900">
                      {currency === "USD" ? `$${pkg.price}` : `¥${(pkg.price * 7.2).toFixed(0)}`}
                    </span>
                    {isBuying === pkg.id && <RefreshCw className="w-3 h-3 animate-spin text-indigo-500 mt-1" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Usage Details */}
          <div className="p-6 lg:col-span-2">
            <h3 className="font-bold text-slate-900 mb-4">{lang === "zh" ? "各项功能消耗明细" : "Feature Usage Details"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              {pricing.map((item) => (
                <div key={item.id} className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-600">{item.feature_name}</span>
                  <span className="font-bold text-slate-900">{item.credit_cost} {lang === "zh" ? "点" : "pts"}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-600">{lang === "zh" ? "Polymarket 机器人实盘交易" : "Polymarket Live Trading"}</span>
                <span className="font-bold text-emerald-600">{lang === "zh" ? "免费 (限流)" : "Free (Rate limited)"}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-600">{lang === "zh" ? "知识库 / 客服翻译 / 物流查询" : "KB / CS Translation / Logistics"}</span>
                <span className="font-bold text-emerald-600">{lang === "zh" ? "免费 (限流)" : "Free (Rate limited)"}</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-400 bg-slate-50 p-3 rounded-lg">
              * {lang === "zh" ? "所有涉及 AI 生成的功能，除了基础点数扣除外，还将根据实际 Token 消耗按官方 API 价格折算额外点数。" : "All AI generation features will incur additional credit deductions based on actual Token usage at official API rates."}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mt-16 pt-8 border-t border-slate-200">
        <h3 className="text-center text-sm font-medium text-slate-500 mb-6">
          {lang === "zh" ? "支持的支付方式" : "Supported Payment Methods"}
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center px-6 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
            <Smartphone className="w-5 h-5 text-[#09B83E] mr-2" />
            <span className="font-medium text-slate-700">WeChat Pay (微信支付)</span>
          </div>
          <div className="flex items-center px-6 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
            <Smartphone className="w-5 h-5 text-[#1677FF] mr-2" />
            <span className="font-medium text-slate-700">Alipay (支付宝)</span>
          </div>
          <div className="flex items-center px-6 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
            <CreditCard className="w-5 h-5 text-[#00457C] mr-2" />
            <span className="font-medium text-slate-700">PayPal</span>
          </div>
          <div className="flex items-center px-6 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
            <Globe className="w-5 h-5 text-slate-700 mr-2" />
            <span className="font-medium text-slate-700">Stripe / Credit Card</span>
          </div>
        </div>
      </div>
    </div>
  );
}
