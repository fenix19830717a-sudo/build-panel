import { useState, useEffect } from "react";
import { Users, Mail, Shield, Zap, History, Download, FileText, Search, RefreshCw, Edit2, X, Check, UserPlus, Ban, ShieldCheck, Filter } from "lucide-react";
import { cn } from "../components/Layout";
import { ActionButton } from "../components/ActionButton";

export function AdminUsers({ lang }: { lang: "zh" | "en" }) {
  const [users, setUsers] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"list" | "history">("list");
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    tier: "Basic",
    credits: 1000
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, historyRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/billing-history")
      ]);
      setUsers(await usersRes.json());
      setHistory(await historyRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSaving(true);
    try {
      await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingUser.name,
          tier: editingUser.tier,
          credits: editingUser.credits,
          is_banned: editingUser.is_banned
        })
      });
      setEditingUser(null);
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });
      setShowAddModal(false);
      setNewUser({ name: "", email: "", tier: "Basic", credits: 1000 });
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleBan = async (user: any) => {
    const action = user.is_banned ? "unban" : "ban";
    if (!confirm(lang === "zh" ? `确定要${user.is_banned ? '解封' : '封禁'}此用户吗？` : `Are you sure you want to ${user.is_banned ? 'unban' : 'ban'} this user?`)) return;
    
    try {
      await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_banned: !user.is_banned })
      });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportInvoice = (record: any) => {
    // Simulate invoice export
    const content = `
      INVOICE: ${record.invoice_no}
      Date: ${new Date(record.created_at).toLocaleDateString()}
      Customer: ${record.name} (${record.email})
      Amount: $${record.amount}
      Credits Added: ${record.credits_added}
      Payment Method: ${record.payment_method}
      Status: ${record.status}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${record.invoice_no}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{lang === "zh" ? "用户管理" : "User Management"}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === "zh" ? "新增、封号、修改及查询用户信息。" : "Add, ban, modify, and query user information."}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {lang === "zh" ? "新增用户" : "Add User"}
          </button>
          <button onClick={fetchData} className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            {lang === "zh" ? "刷新数据" : "Refresh Data"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab("list")} className={cn("flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}>
          <Users className="w-4 h-4 mr-2" />
          {lang === "zh" ? "用户列表" : "User List"}
        </button>
        <button onClick={() => setActiveTab("history")} className={cn("flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors", activeTab === "history" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}>
          <History className="w-4 h-4 mr-2" />
          {lang === "zh" ? "费用历史" : "Billing History"}
        </button>
      </div>

      {activeTab === "list" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder={lang === "zh" ? "搜索用户名或邮箱..." : "Search name or email..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500">
                <option value="">{lang === "zh" ? "所有等级" : "All Tiers"}</option>
                <option value="Basic">Basic</option>
                <option value="Professional">Professional</option>
                <option value="Enterprise">Enterprise</option>
              </select>
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "用户信息" : "User"}</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "状态" : "Status"}</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "付费等级" : "Tier"}</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "剩余点数" : "Credits"}</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "Token 消耗" : "Tokens Used"}</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "注册时间" : "Joined"}</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{lang === "zh" ? "操作" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                          user.is_banned ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
                        )}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{user.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {user.is_banned ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase tracking-wider flex items-center w-fit">
                          <Ban className="w-3 h-3 mr-1" />
                          {lang === "zh" ? "已封禁" : "Banned"}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-wider flex items-center w-fit">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          {lang === "zh" ? "正常" : "Active"}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                        user.tier === 'Enterprise' ? "bg-violet-100 text-violet-700" : 
                        user.tier === 'Professional' ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-700"
                      )}>
                        {user.tier}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-sm font-bold text-indigo-600">{user.credits.toLocaleString()}</td>
                    <td className="p-4 font-mono text-xs text-slate-500">{user.total_tokens_used.toLocaleString()}</td>
                    <td className="p-4 text-xs text-slate-400">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title={lang === "zh" ? "编辑" : "Edit"}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <ActionButton
                          onClick={() => handleToggleBan(user)}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            user.is_banned ? "text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50" : "text-red-400 hover:text-red-600 hover:bg-red-50"
                          )}
                          title={user.is_banned ? (lang === "zh" ? "解封" : "Unban") : (lang === "zh" ? "封禁" : "Ban")}
                        >
                          {user.is_banned ? <ShieldCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">{lang === "zh" ? "新增用户" : "Add New User"}</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "用户名" : "Name"}</label>
                <input 
                  type="text" 
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "邮箱" : "Email"}</label>
                <input 
                  type="email" 
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "付费等级" : "Tier"}</label>
                <select 
                  value={newUser.tier}
                  onChange={(e) => setNewUser({...newUser, tier: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                >
                  <option value="Basic">Basic</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "初始点数" : "Initial Credits"}</label>
                <input 
                  type="number" 
                  value={newUser.credits}
                  onChange={(e) => setNewUser({...newUser, credits: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  {lang === "zh" ? "取消" : "Cancel"}
                </button>
                <ActionButton 
                  type="submit" 
                  loading={isSaving}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                >
                  {lang === "zh" ? "创建用户" : "Create User"}
                </ActionButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">{lang === "zh" ? "编辑用户信息" : "Edit User Info"}</h3>
              <button onClick={() => setEditingUser(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "用户名" : "Name"}</label>
                <input 
                  type="text" 
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "付费等级" : "Tier"}</label>
                <select 
                  value={editingUser.tier}
                  onChange={(e) => setEditingUser({...editingUser, tier: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                >
                  <option value="Basic">Basic</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">{lang === "zh" ? "剩余点数" : "Credits"}</label>
                <input 
                  type="number" 
                  value={editingUser.credits}
                  onChange={(e) => setEditingUser({...editingUser, credits: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" 
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  {lang === "zh" ? "取消" : "Cancel"}
                </button>
                <ActionButton 
                  type="submit" 
                  loading={isSaving}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                >
                  {lang === "zh" ? "保存修改" : "Save Changes"}
                </ActionButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "发票单号" : "Invoice No"}</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "用户" : "User"}</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "金额" : "Amount"}</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "充值点数" : "Credits"}</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "支付方式" : "Method"}</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "时间" : "Date"}</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{lang === "zh" ? "操作" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length > 0 ? history.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-600">{record.invoice_no}</td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-slate-900">{record.name}</div>
                    <div className="text-[10px] text-slate-500">{record.email}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-900">${record.amount}</td>
                  <td className="p-4 text-sm text-indigo-600 font-bold">+{record.credits_added}</td>
                  <td className="p-4 text-xs text-slate-500 uppercase">{record.payment_method}</td>
                  <td className="p-4 text-xs text-slate-400">{new Date(record.created_at).toLocaleString()}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => exportInvoice(record)}
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs font-bold"
                    >
                      <Download className="w-3 h-3" />
                      {lang === "zh" ? "导出发票" : "Invoice"}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 text-sm italic">
                    {lang === "zh" ? "暂无费用记录" : "No billing history found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
