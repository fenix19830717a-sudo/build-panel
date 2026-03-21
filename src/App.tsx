/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { TaskManagement } from "./pages/TaskManagement";
import { DataManagement } from "./pages/DataManagement";
import { ConfigManagement } from "./pages/ConfigManagement";
import { LogsMonitoring } from "./pages/LogsMonitoring";
import { SystemManagement } from "./pages/SystemManagement";
import { ApiServices } from "./pages/ApiServices";
import { Billing } from "./pages/Billing";
import { AdminBilling } from "./pages/AdminBilling";
import { AdminUsers } from "./pages/AdminUsers";
import { UserSettings } from "./pages/UserSettings";
import { ThirdPartyIntegrations } from "./pages/ThirdPartyIntegrations";
import { AppStore } from "./pages/AppStore";
import { ModularAppCenter } from "./pages/ModularAppCenter";
import { PolymarketBot } from "./pages/apps/PolymarketBot";
import { B2BLeads } from "./pages/apps/B2BLeads";
import { VideoMixer } from "./pages/apps/VideoMixer";
import { SocialMedia } from "./apps/social-media/SocialMedia";
import { MarketResearch } from "./pages/apps/MarketResearch";
import { SiteGenerator } from "./pages/apps/SiteGenerator";
import { CustomerService } from "./pages/apps/CustomerService";
import { AIOperations } from "./pages/apps/AIOperations";
import { LogisticsTracking } from "./pages/apps/LogisticsTracking";
import { NodeManagement } from "./pages/NodeManagement";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState("appstore");
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const [currentProject, setCurrentProject] = useState<{id: number, name: string, icon: string} | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data && data.id) {
          setUser(data);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }
    };
    checkUser();
  }, []);

  const role = user?.role || "user";

  const handleLoginRequired = () => {
    setShowLoginModal(true);
  };

  return (
    <Layout 
      currentTab={currentTab} 
      setCurrentTab={setCurrentTab} 
      lang={lang} 
      setLang={setLang} 
      role={role} 
      user={user} 
      onLogout={() => setUser(null)}
      onLoginRequired={handleLoginRequired}
    >
      {currentTab === "dashboard" && <Dashboard lang={lang} role={role} user={user} currentProject={currentProject} setCurrentProject={setCurrentProject} />}
      {currentTab === "appstore" && <AppStore lang={lang} onLaunch={setCurrentTab} role={role} />}
      {currentTab === "billing" && <UserSettings lang={lang} />}
      
      {/* Apps */}
      {currentTab === "app-research" && <MarketResearch lang={lang} projectId={currentProject?.id} onLoginRequired={handleLoginRequired} user={user} />}
      {currentTab === "app-site-gen" && <SiteGenerator lang={lang} projectId={currentProject?.id} onLaunch={setCurrentTab} onLoginRequired={handleLoginRequired} user={user} />}
      {currentTab === "app-customer-service" && <CustomerService lang={lang} projectId={currentProject?.id} />}
      {currentTab === "app-ai-ops" && <AIOperations lang={lang} projectId={currentProject?.id} />}
      {currentTab === "app-b2b" && <B2BLeads lang={lang} projectId={currentProject?.id} onLaunch={setCurrentTab} onLoginRequired={handleLoginRequired} user={user} />}
      {currentTab === "app-video" && <VideoMixer lang={lang} />}
      {currentTab === "app-browser" && <SocialMedia lang={lang} />}
      {currentTab === "app-logistics" && <LogisticsTracking lang={lang} />}
      {currentTab === "app-polybot" && <PolymarketBot lang={lang} onLaunch={setCurrentTab} />}

      {/* Admin Engine */}
      {currentTab === "tasks" && <TaskManagement lang={lang} />}
      {currentTab === "data" && role === "admin" && <DataManagement lang={lang} />}
      {currentTab === "config" && role === "admin" && <ConfigManagement lang={lang} />}
      {currentTab === "admin-api" && role === "admin" && <ApiServices lang={lang} />}
      {currentTab === "logs" && role === "admin" && <LogsMonitoring lang={lang} />}
      {currentTab === "system" && role === "admin" && <SystemManagement lang={lang} />}
      {currentTab === "admin-users" && role === "admin" && <AdminUsers lang={lang} />}
      {currentTab === "admin-billing" && role === "admin" && <AdminBilling lang={lang} />}
      {currentTab === "admin-saas" && role === "admin" && <ThirdPartyIntegrations lang={lang} />}
      {currentTab === "apps-center" && role === "admin" && <ModularAppCenter lang={lang} />}
      {currentTab === "node-management" && role === "admin" && <NodeManagement lang={lang} />}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <Login 
              onLogin={(u) => {
                setUser(u);
                setShowLoginModal(false);
              }} 
              lang={lang} 
              isModal 
              onClose={() => setShowLoginModal(false)} 
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
