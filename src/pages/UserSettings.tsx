import { useState, useEffect } from "react";
import { Key, Plus, Trash2, Globe, Shield, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "../components/Layout";
import { ActionButton } from "../components/ActionButton";

export function UserSettings({ lang }: { lang: "zh" | "en" }) {
  const [userKeys, setUserKeys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newKey, setNewKey] = useState({ provider: "openai", api_key: "" });

  useEffect(() => {
    fetchUserKeys();
  }, []);

  const fetchUserKeys = async () => {
    try {
      const res = await fetch("/api/user/api-keys");
      const data = await res.json();
      setUserKeys(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newKey)
      });
      setNewKey({ provider: "openai", api_key: "" });
      fetchUserKeys();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {lang === "zh" ? "个人设置与 API 配置" : "User Settings & API Config"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {lang === "zh" 
            ? "管理您的个人信息和自定义 API Key，以便在应用中使用您自己的资源。" 
            : "Manage your profile and custom API keys to use your own resources in apps."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Custom API Keys */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <Key className="w-5 h-5 mr-2 text-indigo-500" />
                {lang === "zh" ? "我的自定义 API Keys" : "My Custom API Keys"}
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {userKeys.length > 0 ? userKeys.map((k) => (
                  <div key={k.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 uppercase">{k.provider}</div>
                        <div className="text-xs text-slate-500 font-mono">
                          {k.api_key.substring(0, 8)}...{k.api_key.substring(k.api_key.length - 4)}
                        </div>
                      </div>
                    </div>
                    <ActionButton 
                      onClick={async () => {
                        if (!confirm(lang === "zh" ? "确定要删除此 API Key 吗？" : "Are you sure you want to delete this API Key?")) return;
                        await fetch(`/api/user/api-keys/${k.id}`, { method: "DELETE" });
                        fetchUserKeys();
                      }}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </ActionButton>
                  </div>
                )) : (
                  <div className="text-center py-8 text-slate-400 text-sm italic">
                    {lang === "zh" ? "暂无自定义 Key，将默认使用平台资源" : "No custom keys, using platform resources by default"}
                  </div>
                )}
              </div>

              <form onSubmit={handleAddKey} className="mt-8 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                <h3 className="text-sm font-bold text-indigo-900 flex items-center">
                  <Plus className="w-4 h-4 mr-1" />
                  {lang === "zh" ? "添加新 Key" : "Add New Key"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-indigo-700 uppercase mb-1 block">{lang === "zh" ? "供应商" : "Provider"}</label>
                    <select 
                      value={newKey.provider}
                      onChange={(e) => setNewKey({ ...newKey, provider: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="gemini">Gemini</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="deepseek">DeepSeek</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-indigo-700 uppercase mb-1 block">API Key</label>
                    <input 
                      type="password"
                      value={newKey.api_key}
                      onChange={(e) => setNewKey({ ...newKey, api_key: e.target.value })}
                      placeholder="sk-..."
                      className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
                <ActionButton 
                  type="submit"
                  loading={isLoading}
                  className="w-full py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {!isLoading && (lang === "zh" ? "保存并启用" : "Save & Enable")}
                </ActionButton>
              </form>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-emerald-500" />
              {lang === "zh" ? "安全提示" : "Security Tips"}
            </h2>
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p>{lang === "zh" ? "您的 API Key 仅用于为您提供服务，我们不会将其用于任何其他目的。" : "Your API keys are only used to provide services to you. We do not use them for any other purpose."}</p>
              </div>
              <p>{lang === "zh" ? "建议为本平台创建专用的限制额度的 API Key，以确保您的账户安全。" : "We recommend creating dedicated, limited-quota API keys for this platform to ensure your account security."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
