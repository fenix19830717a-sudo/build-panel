import { useState, useEffect } from "react";
import { Coins, Save, RefreshCw, AlertCircle, CheckCircle2, Plus, Trash2, Package } from "lucide-react";
import { cn } from "../components/Layout";

export function AdminBilling({ lang }: { lang: "zh" | "en" }) {
  const [pricing, setPricing] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [activeTab, setActiveTab] = useState<"pricing" | "packages">("pricing");

  // New package form
  const [newPkg, setNewPkg] = useState({ name: "", credits: 1000, price: 19.99 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [pricingRes, packagesRes] = await Promise.all([
      fetch("/api/admin/pricing"),
      fetch("/api/admin/packages")
    ]);
    setPricing(await pricingRes.json());
    setPackages(await packagesRes.json());
  };

  const handleUpdateCost = async (featureKey: string, newCost: number) => {
    setIsLoading(true);
    try {
      await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature_key: featureKey, credit_cost: newCost })
      });
      setMessage({ type: 'success', text: lang === 'zh' ? '更新成功' : 'Updated successfully' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Update failed' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleAddPackage = async () => {
    if (!newPkg.name) return;
    setIsLoading(true);
    try {
      await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPkg)
      });
      setMessage({ type: 'success', text: lang === 'zh' ? '添加成功' : 'Package added' });
      setNewPkg({ name: "", credits: 1000, price: 19.99 });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add package' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeletePackage = async (id: number) => {
    if (!confirm(lang === 'zh' ? '确定删除吗？' : 'Are you sure?')) return;
    try {
      await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{lang === "zh" ? "财务管理" : "Admin Billing"}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === "zh" ? "调整各项功能的点数消耗成本及充值套餐。" : "Adjust credit costs and manage recharge packages."}
          </p>
        </div>
        <button onClick={fetchData} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
          <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab("pricing")} 
          className={cn("flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === "pricing" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}
        >
          <Coins className="w-4 h-4 mr-2" />
          {lang === "zh" ? "功能定价" : "Feature Pricing"}
        </button>
        <button 
          onClick={() => setActiveTab("packages")} 
          className={cn("flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === "packages" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}
        >
          <Package className="w-4 h-4 mr-2" />
          {lang === "zh" ? "充值套餐" : "Credit Packages"}
        </button>
      </div>

      {message && (
        <div className={cn(
          "p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
          message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
        )}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {activeTab === "pricing" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "功能名称" : "Feature Name"}</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "功能标识" : "Feature Key"}</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "当前点数消耗" : "Credit Cost"}</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "最后更新" : "Last Updated"}</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "操作" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pricing.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Coins className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-slate-900">{item.feature_name}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-500">{item.feature_key}</td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      defaultValue={item.credit_cost}
                      onBlur={(e) => handleUpdateCost(item.feature_key, parseInt(e.target.value))}
                      className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm focus:border-indigo-500 outline-none"
                    />
                  </td>
                  <td className="p-4 text-xs text-slate-400">{new Date(item.updated_at).toLocaleString()}</td>
                  <td className="p-4">
                    <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
                      <Save className="w-4 h-4" />
                      {lang === "zh" ? "保存" : "Save"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "packages" && (
        <div className="space-y-6">
          {/* Add Package Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
              <Plus className="w-4 h-4 mr-2 text-indigo-500" />
              {lang === "zh" ? "添加新套餐" : "Add New Package"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">{lang === "zh" ? "套餐名称" : "Package Name"}</label>
                <input 
                  type="text" 
                  value={newPkg.name}
                  onChange={(e) => setNewPkg({...newPkg, name: e.target.value})}
                  placeholder="e.g. Starter Pack"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">{lang === "zh" ? "包含点数" : "Credits"}</label>
                <input 
                  type="number" 
                  value={newPkg.credits}
                  onChange={(e) => setNewPkg({...newPkg, credits: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">{lang === "zh" ? "价格 (USD)" : "Price (USD)"}</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={newPkg.price}
                  onChange={(e) => setNewPkg({...newPkg, price: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <button 
                onClick={handleAddPackage}
                className="h-10 px-4 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                {lang === "zh" ? "添加套餐" : "Add Package"}
              </button>
            </div>
          </div>

          {/* Packages List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "套餐名称" : "Package Name"}</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "点数" : "Credits"}</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "价格" : "Price"}</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{lang === "zh" ? "操作" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{pkg.name}</td>
                    <td className="p-4 font-mono text-sm text-indigo-600 font-bold">{pkg.credits.toLocaleString()}</td>
                    <td className="p-4 font-bold text-slate-900">${pkg.price}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
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
  );
}
