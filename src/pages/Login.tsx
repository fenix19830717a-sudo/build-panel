import { useState } from "react";
import { Lock, Mail, ArrowRight, ShieldCheck, Smartphone, QrCode, X, CheckCircle2 } from "lucide-react";
import { ActionButton } from "../components/ActionButton";
import { cn } from "../components/Layout";

export function Login({ onLogin, lang, isModal, onClose }: { onLogin: (user: any) => void, lang: "zh" | "en", isModal?: boolean, onClose?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: input contact, 2: input code & new pass
  const [forgotContact, setForgotContact] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || (lang === "zh" ? "登录失败，请检查账号和密码" : "Login failed, please check credentials"));
      }
    } catch (err) {
      setError(lang === "zh" ? "服务器错误" : "Server error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotLoading(true);
    setForgotMessage("");
    try {
      if (forgotStep === 1) {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact: forgotContact })
        });
        const data = await res.json();
        if (data.success) {
          setForgotStep(2);
          setForgotMessage(lang === "zh" ? "验证码已发送，请查收" : "Verification code sent.");
        } else {
          setForgotMessage(data.error || "Error");
        }
      } else {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact: forgotContact, code: forgotCode, newPassword })
        });
        const data = await res.json();
        if (data.success) {
          setForgotMessage(lang === "zh" ? "密码重置成功，请登录" : "Password reset successful.");
          setTimeout(() => {
            setShowForgot(false);
            setForgotStep(1);
          }, 2000);
        } else {
          setForgotMessage(data.error || "Error");
        }
      }
    } catch (err) {
      setForgotMessage("Error");
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className={cn(
      isModal ? "p-0" : "min-h-screen bg-slate-50 flex items-center justify-center p-4"
    )}>
      <div className={cn(
        "max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 relative",
        isModal && "shadow-none border-none"
      )}>
        {isModal && (
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {lang === "zh" ? "欢迎回来" : "Welcome Back"}
          </h1>
          <p className="text-slate-500 mt-2">
            {lang === "zh" ? "请登录您的账户以继续" : "Please login to your account to continue"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {lang === "zh" ? "账号 / 邮箱" : "Account / Email"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder={lang === "zh" ? "用户名或邮箱" : "Username or Email"}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-slate-700">
                {lang === "zh" ? "密码" : "Password"}
              </label>
              <button 
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-xs text-indigo-600 hover:underline"
              >
                {lang === "zh" ? "忘记密码？" : "Forgot Password?"}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <ActionButton
            type="submit"
            loading={isLoading}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {!isLoading && (lang === "zh" ? "立即登录" : "Login Now")}
            {isLoading && (lang === "zh" ? "登录中..." : "Logging in...")}
            <ArrowRight className="w-5 h-5" />
          </ActionButton>
        </form>

        <div className="mt-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">
                {lang === "zh" ? "第三方登录" : "Or continue with"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                <QrCode className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-600">{lang === "zh" ? "微信扫码" : "WeChat"}</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
              <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                <QrCode className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-600">{lang === "zh" ? "抖音扫码" : "Douyin"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">{lang === "zh" ? "重置密码" : "Reset Password"}</h3>
              <button onClick={() => setShowForgot(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleForgotSubmit} className="p-8 space-y-6">
              {forgotMessage && (
                <div className={cn(
                  "p-3 text-sm rounded-xl border",
                  forgotMessage.includes("成功") || forgotMessage.includes("sent") ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600"
                )}>
                  {forgotMessage}
                </div>
              )}

              {forgotStep === 1 ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {lang === "zh" ? "手机号 / 邮箱" : "Phone / Email"}
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={forgotContact}
                      onChange={(e) => setForgotContact(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder={lang === "zh" ? "输入绑定的手机或邮箱" : "Enter phone or email"}
                      required
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {lang === "zh" ? "验证码" : "Verification Code"}
                    </label>
                    <input
                      type="text"
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="123456"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {lang === "zh" ? "新密码" : "New Password"}
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </>
              )}

              <ActionButton
                type="submit"
                loading={isForgotLoading}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
              >
                {forgotStep === 1 ? (lang === "zh" ? "发送验证码" : "Send Code") : (lang === "zh" ? "重置密码" : "Reset Password")}
              </ActionButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
