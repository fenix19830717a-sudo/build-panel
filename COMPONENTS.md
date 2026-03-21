# 前端组件文档

本文档详细描述了 B2B SaaS 平台前端所有组件的结构、属性和使用方法。

## 目录

- [一、核心组件 (Core Components)](#一核心组件-core-components)
  - [Layout](#layout)
  - [ActionButton](#actionbutton)
  - [GlobalOnboarding](#globalonboarding)
- [二、页面组件 (Page Components)](#二页面组件-page-components)
  - [Dashboard](#dashboard)
  - [Login](#login)
  - [Billing](#billing)
  - [UserSettings](#usersettings)
  - [NodeManagement](#nodemanagement)
  - [AppStore](#appstore)
  - [ApiServices](#apiservices)
  - [TaskManagement](#taskmanagement)
  - [DataManagement](#datamanagement)
  - [ConfigManagement](#configmanagement)
  - [SystemManagement](#systemmanagement)
  - [LogsMonitoring](#logsmonitoring)
  - [ThirdPartyIntegrations](#thirdpartyintegrations)
  - [AdminUsers](#adminusers)
  - [AdminBilling](#adminbilling)
  - [ModularAppCenter](#modularappcenter)
- [三、应用页面 (Application Pages)](#三应用页面-application-pages)
  - [AIOperations](#aioperations)
  - [B2BLeads](#b2bleads)
  - [SiteGenerator](#sitegenerator)
  - [VideoMixer](#videomixer)
  - [PolymarketBot](#polymarketbot)
  - [MarketResearch](#marketresearch)
  - [LogisticsTracking](#logisticstracking)
  - [CustomerService](#customerservice)
  - [CloudBrowser](#cloudbrowser)
- [四、应用模块 (Application Modules)](#四应用模块-application-modules)
- [五、状态管理说明](#五状态管理说明)
- [六、工具函数](#六工具函数)

---

## 一、核心组件 (Core Components)

核心组件位于 `src/components/` 目录，是应用的基础构建块。

### Layout

**文件路径**: `src/components/Layout.tsx`

**功能描述**: 
应用的主布局组件，包含侧边栏导航、顶部头部栏和主内容区域。支持响应式设计，根据用户角色（admin/user）动态显示不同的导航菜单。

**Props 接口**:

```typescript
interface LayoutProps {
  children: ReactNode;           // 子组件内容
  currentTab: string;            // 当前选中的标签页 ID
  setCurrentTab: (tab: string) => void;  // 设置当前标签页的回调函数
  lang: "zh" | "en";             // 当前语言
  setLang: (lang: "zh" | "en") => void;  // 设置语言的回调函数
  role: "admin" | "user";        // 用户角色
  user: any;                     // 用户信息对象
  onLogout: () => void;          // 登出回调函数
  onLoginRequired: () => void;   // 需要登录时的回调函数
}
```

**使用示例**:

```tsx
import { Layout } from "./components/Layout";

function App() {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const [user, setUser] = useState(null);

  return (
    <Layout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      lang={lang}
      setLang={setLang}
      role="user"
      user={user}
      onLogout={() => setUser(null)}
      onLoginRequired={() => setShowLogin(true)}
    >
      <Dashboard lang={lang} />
    </Layout>
  );
}
```

**依赖项**:
- `motion/react` - 动画效果
- `lucide-react` - 图标库
- `clsx` + `tailwind-merge` - 样式合并工具

**导出函数**:
- `cn(...inputs: ClassValue[])` - 样式合并工具函数，用于合并 Tailwind CSS 类名

---

### ActionButton

**文件路径**: `src/components/ActionButton.tsx`

**功能描述**:
可复用的操作按钮组件，支持加载状态、锁定时长和取消功能。适用于需要防止重复点击的异步操作场景。

**Props 接口**:

```typescript
interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void> | void;  // 点击回调
  loading?: boolean;            // 外部控制的加载状态
  onCancel?: () => void;        // 取消操作的回调
  lockDuration?: number;        // 操作完成后的锁定时长（毫秒），默认 1500ms
  showCancel?: boolean;         // 是否显示取消按钮
}
```

**使用示例**:

```tsx
import { ActionButton } from "./components/ActionButton";

function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleClick = async () => {
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    try {
      await fetchData(abortControllerRef.current.signal);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
  };

  return (
    <ActionButton
      onClick={handleClick}
      loading={isLoading}
      showCancel={true}
      onCancel={handleCancel}
      lockDuration={2000}
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
    >
      提交数据
    </ActionButton>
  );
}
```

**依赖项**:
- `lucide-react` - 图标库
- `./Layout` - `cn` 样式工具函数

---

### GlobalOnboarding

**文件路径**: `src/components/GlobalOnboarding.tsx`

**功能描述**:
面向外贸新手的步骤式入门引导组件，包含 7 个核心步骤：市场调研、产品与品牌、工具下载与账号、独立站生成、客户开发、素材生成、素材发布。

**Props 接口**:

```typescript
interface GlobalOnboardingProps {
  lang: "zh" | "en";  // 当前语言
}
```

**使用示例**:

```tsx
import { GlobalOnboarding } from "./components/GlobalOnboarding";

function Dashboard({ lang }: { lang: "zh" | "en" }) {
  return (
    <div className="space-y-6">
      <GlobalOnboarding lang={lang} />
    </div>
  );
}
```

**内部数据结构**:

```typescript
interface Step {
  id: string;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  icon: any;
  details: { zh: string[]; en: string[] };
  links?: { label: string; url: string }[];
  action?: { label: { zh: string; en: string }; path: string };
}
```

**依赖项**:
- `lucide-react` - 图标库
- `./Layout` - `cn` 样式工具函数

---

## 二、页面组件 (Page Components)

页面组件位于 `src/pages/` 目录，对应应用的主要功能页面。

### Dashboard

**文件路径**: `src/pages/Dashboard.tsx`

**功能描述**:
仪表盘页面，根据用户角色显示不同的内容。管理员可查看系统统计、用户活跃度、收入趋势；普通用户可查看项目列表、快速操作入口和全局入门引导。

**Props 接口**:

```typescript
interface DashboardProps {
  lang: "zh" | "en";
  role: "admin" | "user";
  user: any;
  onLoginRequired: () => void;
  onLaunch: (tab: string) => void;
}
```

**状态管理**:
- `activeTab` - 当前选中的标签页
- `projects` - 项目列表数据
- `stats` - 统计数据

**依赖项**:
- `recharts` - 图表组件
- `lucide-react` - 图标库
- `../components/Layout` - 布局和工具函数
- `../components/GlobalOnboarding` - 入门引导

---

### Login

**文件路径**: `src/pages/Login.tsx`

**功能描述**:
登录页面，支持邮箱密码登录、忘记密码流程和第三方登录入口（Google、GitHub）。

**Props 接口**:

```typescript
interface LoginProps {
  lang: "zh" | "en";
  onLogin: (user: any) => void;
}
```

**状态管理**:
- `mode` - 当前模式（"login" | "forgot"）
- `email`, `password` - 表单输入
- `isLoading` - 加载状态
- `error` - 错误信息

---

### Billing

**文件路径**: `src/pages/Billing.tsx`

**功能描述**:
订阅与账单管理页面，显示当前订阅计划、点数余额、订阅历史，支持购买点数包和升级订阅计划。

**Props 接口**:

```typescript
interface BillingProps {
  lang: "zh" | "en";
  user: any;
  onLoginRequired: () => void;
}
```

**状态管理**:
- `activeTab` - 当前标签页
- `subscription` - 订阅信息
- `creditPackages` - 点数包列表
- `transactions` - 交易历史

---

### UserSettings

**文件路径**: `src/pages/UserSettings.tsx`

**功能描述**:
用户设置页面，管理用户的 API 密钥配置（OpenAI、Gemini、Anthropic、DeepSeek）。

**Props 接口**:

```typescript
interface UserSettingsProps {
  lang: "zh" | "en";
  user: any;
  onLoginRequired: () => void;
}
```

**状态管理**:
- `apiKeys` - API 密钥配置对象
- `isSaving` - 保存状态

---

### NodeManagement

**文件路径**: `src/pages/NodeManagement.tsx`

**功能描述**:
服务节点管理页面，管理员可查看和管理部署在服务器上的应用节点，支持部署、卸载、重启操作。

**Props 接口**:

```typescript
interface NodeManagementProps {
  lang: "zh" | "en";
}
```

**状态管理**:
- `nodes` - 节点列表
- `selectedNode` - 选中的节点
- `isLoading` - 加载状态

---

### AppStore

**文件路径**: `src/pages/AppStore.tsx`

**功能描述**:
应用市场页面，展示所有可用应用，支持按分类筛选和搜索。包含 9 个核心应用：独立站生成、AI 运营、市场调查、B2B 客户挖掘、视频混剪、社媒发布、客服翻译、物流查询、Polymarket 机器人。

**Props 接口**:

```typescript
interface AppStoreProps {
  lang: "zh" | "en";
  onLaunch: (tab: string) => void;
}
```

**状态管理**:
- `searchQuery` - 搜索关键词
- `selectedCategory` - 选中的分类

---

### ApiServices

**文件路径**: `src/pages/ApiServices.tsx`

**功能描述**:
API 服务管理页面，管理员可配置 LLM 模型池、外部 API 密钥和 Polymarket 钱包。

**Props 接口**:

```typescript
interface ApiServicesProps {
  lang: "zh" | "en";
}
```

**状态管理**:
- `activeTab` - 当前标签页
- `llmPool` - LLM 模型池配置
- `externalKeys` - 外部 API 密钥
- `wallets` - 钱包列表

---

### TaskManagement

**文件路径**: `src/pages/TaskManagement.tsx`

**功能描述**:
爬虫任务管理页面，创建、监控和管理爬虫任务，支持快速启动预设任务模板。

**Props 接口**:

```typescript
interface TaskManagementProps {
  lang: "zh" | "en";
}
```

**状态管理**:
- `tasks` - 任务列表
- `selectedTask` - 选中的任务
- `isCreating` - 创建任务模态框状态

---

### DataManagement

**文件路径**: `src/pages/DataManagement.tsx`

**功能描述**:
爬虫数据管理页面，查看和管理爬取的数据，支持筛选、导出和批量操作。

**Props 接口**:

```typescript
interface DataManagementProps {
  lang: "zh" | "en";
}
```

**状态管理**:
- `data` - 数据列表
- `filters` - 筛选条件
- `selectedRows` - 选中的行
- `pagination` - 分页状态

---

### ConfigManagement

**文件路径**: `src/pages/ConfigManagement.tsx`

**功能描述**:
系统配置管理页面，管理代理配置、解析器配置、账号配置、翻译配置、合规配置和通知配置。

**Props 接口**:

```typescript
interface ConfigManagementProps {
  lang: "zh" | "en";
}
```

**状态管理**:
- `activeTab` - 当前配置类型
- `configs` - 配置数据

---

### SystemManagement

**文件路径**: `src/pages/SystemManagement.tsx`

**功能描述**:
系统管理页面，管理员可管理用户、服务器、环境变量、系统配置和数据备份。

**Props 接口**:

```typescript
interface SystemManagementProps {
  lang: "zh" | "en";
}
```

**状态管理**:
- `activeTab` - 当前管理模块
- `users` - 用户列表
- `servers` - 服务器列表
- `envVars` - 环境变量

---

### LogsMonitoring

**文件路径**: `src/pages/LogsMonitoring.tsx`

**功能描述**:
日志监控页面，查看系统运行日志和实时监控图表。

**Props 接口**:

```typescript
interface LogsMonitoringProps {
  lang: "zh" | "en";
}
```

**状态管理**:
- `logs` - 日志列表
- `filters` - 日志筛选条件
- `refreshInterval` - 刷新间隔

---

### ThirdPartyIntegrations

**文件路径**: `src/pages/ThirdPartyIntegrations.tsx`

**功能描述**:
第三方集成页面，管理 LinkedIn、海关数据、CRM、邮件服务等 SaaS 集成。

**Props 接口**:

```typescript
interface ThirdPartyIntegrationsProps {
  lang: "zh" | "en";
}
```

**状态管理**:
- `integrations` - 集成列表及状态

---

### AdminUsers

**文件路径**: `src/pages/AdminUsers.tsx`

**功能描述**:
用户管理页面（管理员专用），查看、添加、编辑、禁用用户账户。

**Props 接口**:

```typescript
interface AdminUsersProps {
  lang: "zh" | "en";
}
```

**状态管理**:
- `users` - 用户列表
- `selectedUser` - 选中的用户
- `isModalOpen` - 模态框状态

---

### AdminBilling

**文件路径**: `src/pages/AdminBilling.tsx`

**功能描述**:
财务管理页面（管理员专用），管理功能定价和点数包配置。

**Props 接口**:

```typescript
interface AdminBillingProps {
  lang: "zh" | "en";
}
```

**状态管理**:
- `features` - 功能定价列表
- `packages` - 点数包配置

---

### ModularAppCenter

**文件路径**: `src/pages/ModularAppCenter.tsx`

**功能描述**:
模块化应用中心，管理应用版本和配置，支持版本回滚和灰度发布。

**Props 接口**:

```typescript
interface ModularAppCenterProps {
  lang: "zh" | "en";
}
```

**状态管理**:
- `apps` - 应用列表
- `selectedApp` - 选中的应用
- `versions` - 版本历史

---

## 三、应用页面 (Application Pages)

应用页面位于 `src/pages/apps/` 目录，是平台核心功能模块的页面组件。

### AIOperations

**文件路径**: `src/pages/apps/AIOperations.tsx`

**功能描述**:
AI 独立站运营页面，管理店铺绑定、SEO 优化、广告投放、商品抓取和博客写作。

**Props 接口**:

```typescript
interface AIOperationsProps {
  lang: "zh" | "en";
  projectId?: number;
  onLoginRequired?: () => void;
  user?: any;
}
```

**状态管理**:
- `activeTab` - 当前功能标签
- `stores` - 绑定的店铺列表
- `seoConfig` - SEO 配置
- `adCampaigns` - 广告活动

---

### B2BLeads

**文件路径**: `src/pages/apps/B2BLeads.tsx`

**功能描述**:
B2B 客户挖掘与营销页面，支持 Google Maps 挖掘、LinkedIn 开发、海关数据查询和邮件营销。

**Props 接口**:

```typescript
interface B2BLeadsProps {
  lang: "zh" | "en";
  projectId?: number;
  onLoginRequired?: () => void;
  user?: any;
}
```

**状态管理**:
- `activeTab` - 当前挖掘渠道
- `leads` - 线索列表
- `campaigns` - 邮件营销活动
- `isMining` - 挖掘状态

---

### SiteGenerator

**文件路径**: `src/pages/apps/SiteGenerator.tsx`

**功能描述**:
多步骤独立站生成器，包含知识库配置、SEO 博客设置和部署选项。

**Props 接口**:

```typescript
interface SiteGeneratorProps {
  lang: "zh" | "en";
  projectId?: number;
  onLoginRequired?: () => void;
  user?: any;
}
```

**状态管理**:
- `currentStep` - 当前步骤（1-3）
- `siteConfig` - 站点配置
- `knowledgeBase` - 知识库文件
- `isDeploying` - 部署状态

---

### VideoMixer

**文件路径**: `src/pages/apps/VideoMixer.tsx`

**功能描述**:
视频混剪生成器，支持 AI 云端模式和本地轻量模式，生成 TikTok/Reels 营销视频。

**Props 接口**:

```typescript
interface VideoMixerProps {
  lang: "zh" | "en";
}
```

**状态管理**:
- `mode` - 处理模式（"ai" | "simple"）
- `assets` - 素材列表
- `settings` - 生成设置

---

### PolymarketBot

**文件路径**: `src/pages/apps/PolymarketBot.tsx`

**功能描述**:
Polymarket 交易机器人页面，支持模拟交易和真实交易，包含策略管理、市场分析和交易记录。

**Props 接口**:

```typescript
interface PolymarketBotProps {
  lang: "zh" | "en";
  onLaunch?: (tab: string) => void;
}
```

**状态管理**:
- `isRunning` - 机器人运行状态
- `activeTab` - 当前标签页
- `tradingMode` - 交易模式（"paper" | "live"）
- `strategies` - 策略列表
- `orders` - 订单历史
- `stats` - 盈亏统计
- `walletConfig` - 钱包配置

---

### MarketResearch

**文件路径**: `src/pages/apps/MarketResearch.tsx`

**功能描述**:
市场调查报告生成器，基于配置参数生成包含竞争对手、客户画像、潜在合作方的报告。

**Props 接口**:

```typescript
interface MarketResearchProps {
  lang: "zh" | "en";
  projectId?: number;
  onLoginRequired?: () => void;
  user?: any;
}
```

**状态管理**:
- `isGeneratingOutline` - 生成大纲状态
- `isGeneratingDetail` - 生成详细报告状态
- `reportType` - 报告类型（"outline" | "detail"）
- `reportContent` - 报告内容
- `region`, `country`, `industry`, `businessModel` - 配置参数

---

### LogisticsTracking

**文件路径**: `src/pages/apps/LogisticsTracking.tsx`

**功能描述**:
全球物流查询页面，输入运单号查询国际物流轨迹与实时状态。

**Props 接口**:

```typescript
interface LogisticsTrackingProps {
  lang: "zh" | "en";
}
```

**状态管理**:
- `trackingNumber` - 运单号
- `isSearching` - 搜索状态
- `hasResult` - 是否有结果

---

### CustomerService

**文件路径**: `src/pages/apps/CustomerService.tsx`

**功能描述**:
客服翻译与 AI 回复页面，支持手动辅助翻译、独立站客服记录查看、AI 自动回复配置和 Chrome 插件下载。

**Props 接口**:

```typescript
interface CustomerServiceProps {
  lang: "zh" | "en";
  projectId?: number;
}
```

**状态管理**:
- `activeTab` - 当前标签页
- `copied` - 复制状态

---

### CloudBrowser

**文件路径**: `src/pages/apps/CloudBrowser.tsx`

**功能描述**:
云浏览器页面，管理隔离的浏览器环境，支持 Cookie 持久化、防关联和场景化 IP 购买。

**Props 接口**:

```typescript
interface CloudBrowserProps {
  lang: "zh" | "en";
}
```

**状态管理**:
- `activeProfile` - 当前激活的浏览器环境

---

## 四、应用模块 (Application Modules)

应用模块位于 `src/apps/` 目录，每个模块包含独立的功能实现、README 文档和知识库文件。

### 模块结构

```
src/apps/
├── ai-operations/
│   ├── AIOperations.tsx    # 主组件
│   ├── README.md           # 模块说明
│   └── kb.md               # 知识库文档
├── b2b-leads/
│   ├── B2BLeads.tsx
│   ├── README.md
│   └── kb.md
├── site-generator/
│   ├── SiteGenerator.tsx
│   ├── README.md
│   └── kb.md
├── video-mixer/
├── polymarket-bot/
│   ├── PolymarketBot.tsx
│   ├── README.md
│   └── kb.md
├── market-research/
│   ├── MarketResearch.tsx
│   ├── README.md
│   └── kb.md
├── logistics-tracking/
│   ├── LogisticsTracking.tsx
│   ├── README.md
│   └── kb.md
├── customer-service/
│   ├── CustomerService.tsx
│   ├── README.md
│   └── kb.md
├── cloud-browser/
│   ├── CloudBrowser.tsx
│   ├── README.md
│   └── kb.md
└── social-media/
    ├── SocialMedia.tsx
    ├── README.md
    └── kb.md
```

### 模块列表

| 模块名称 | 组件文件 | 功能描述 |
|---------|---------|---------|
| ai-operations | AIOperations.tsx | AI 独立站运营管理 |
| b2b-leads | B2BLeads.tsx | B2B 客户挖掘与营销 |
| site-generator | SiteGenerator.tsx | 独立站生成器 |
| video-mixer | VideoMixer.tsx | 视频混剪生成器 |
| polymarket-bot | PolymarketBot.tsx | Polymarket 交易机器人 |
| market-research | MarketResearch.tsx | 市场调查报告生成 |
| logistics-tracking | LogisticsTracking.tsx | 全球物流查询 |
| customer-service | CustomerService.tsx | 客服翻译与 AI 回复 |
| cloud-browser | CloudBrowser.tsx | 云浏览器环境管理 |
| social-media | SocialMedia.tsx | 社媒发布管理 |

---

## 五、状态管理说明

### 状态管理策略

本项目采用 React 内置的 `useState` 和 `useEffect` Hooks 进行状态管理，未使用第三方状态管理库。

### 状态分类

#### 1. 组件内部状态

使用 `useState` 管理组件内部的 UI 状态：

```typescript
const [activeTab, setActiveTab] = useState<string>("overview");
const [isLoading, setIsLoading] = useState<boolean>(false);
const [formData, setFormData] = useState<{ email: string; password: string }>({
  email: "",
  password: ""
});
```

#### 2. 服务端状态

通过 API 请求获取并缓存在组件状态中：

```typescript
const [data, setData] = useState<any[]>([]);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch("/api/data");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError("Failed to fetch data");
    }
  };
  fetchData();
}, []);
```

#### 3. 异步操作状态

使用 `AbortController` 管理可取消的异步操作：

```typescript
const abortControllerRef = useRef<AbortController | null>(null);

const handleAsyncAction = async () => {
  abortControllerRef.current = new AbortController();
  try {
    const res = await fetch("/api/action", {
      signal: abortControllerRef.current.signal
    });
    // 处理响应
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Operation cancelled');
    }
  }
};

const cancelAction = () => {
  abortControllerRef.current?.abort();
};
```

### 状态提升模式

跨组件共享状态通过 Props 传递和回调函数实现：

```typescript
// 父组件
function ParentComponent() {
  const [user, setUser] = useState<any>(null);
  
  return (
    <Layout
      user={user}
      onLogout={() => setUser(null)}
    >
      <ChildComponent user={user} onUserUpdate={setUser} />
    </Layout>
  );
}

// 子组件
function ChildComponent({ user, onUserUpdate }: { 
  user: any; 
  onUserUpdate: (user: any) => void 
}) {
  // 使用 user 和 onUserUpdate
}
```

---

## 六、工具函数

### cn 样式合并函数

**位置**: `src/components/Layout.tsx`

**功能**: 合并 Tailwind CSS 类名，处理条件类名和类名冲突。

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**使用示例**:

```typescript
<div className={cn(
  "base-class",
  isActive && "active-class",
  isDisabled ? "disabled-class" : "enabled-class"
)}>
```

### 多语言支持模式

所有组件通过 `lang` prop 接收当前语言设置，使用条件渲染实现多语言：

```typescript
function Component({ lang }: { lang: "zh" | "en" }) {
  return (
    <div>
      <h1>{lang === "zh" ? "中文标题" : "English Title"}</h1>
      <p>{lang === "zh" ? "中文描述" : "English Description"}</p>
    </div>
  );
}
```

### API 请求模式

统一的 API 请求处理模式：

```typescript
const handleApiCall = async () => {
  setIsLoading(true);
  try {
    const res = await fetch("/api/endpoint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    // 处理结果
  } catch (error) {
    console.error(error);
    // 处理错误
  } finally {
    setIsLoading(false);
  }
};
```

---

## 附录：组件依赖关系图

```
App
└── Layout
    ├── Dashboard
    │   └── GlobalOnboarding
    ├── Login
    ├── Billing
    ├── UserSettings
    ├── NodeManagement
    ├── AppStore
    ├── ApiServices
    ├── TaskManagement
    │   └── ActionButton
    ├── DataManagement
    ├── ConfigManagement
    ├── SystemManagement
    ├── LogsMonitoring
    ├── ThirdPartyIntegrations
    ├── AdminUsers
    ├── AdminBilling
    ├── ModularAppCenter
    └── Apps/
        ├── AIOperations
        ├── B2BLeads
        ├── SiteGenerator
        ├── VideoMixer
        ├── PolymarketBot
        │   └── ActionButton
        ├── MarketResearch
        ├── LogisticsTracking
        ├── CustomerService
        └── CloudBrowser
```

---

*文档最后更新: 2026-03-06*
