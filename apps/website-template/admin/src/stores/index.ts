import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeConfig, SiteConfig, User, NavMenuItem } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface ThemeState {
  currentTheme: ThemeConfig;
  availableThemes: ThemeConfig[];
  isLoading: boolean;
  setTheme: (theme: ThemeConfig) => void;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  setAvailableThemes: (themes: ThemeConfig[]) => void;
  setLoading: (loading: boolean) => void;
}

const defaultTheme: ThemeConfig = {
  id: 'default',
  name: '默认主题',
  primaryColor: '#1890ff',
  secondaryColor: '#52c41a',
  backgroundColor: '#ffffff',
  textColor: '#262626',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  layout: 'default',
};

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: defaultTheme,
  availableThemes: [],
  isLoading: false,
  setTheme: (theme) => set({ currentTheme: theme }),
  updateTheme: (updates) =>
    set((state) => ({
      currentTheme: { ...state.currentTheme, ...updates },
    })),
  setAvailableThemes: (themes) => set({ availableThemes: themes }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

interface SiteState {
  config: SiteConfig;
  navMenu: NavMenuItem[];
  isLoading: boolean;
  updateConfig: (updates: Partial<SiteConfig>) => void;
  setNavMenu: (menu: NavMenuItem[]) => void;
  setLoading: (loading: boolean) => void;
}

const defaultSiteConfig: SiteConfig = {
  title: '我的网站',
  description: '这是一个精美的独立站',
  keywords: '网站, 独立站, 模板',
  author: 'Admin',
  language: 'zh-CN',
  theme: defaultTheme,
  socialLinks: [],
};

export const useSiteStore = create<SiteState>((set) => ({
  config: defaultSiteConfig,
  navMenu: [],
  isLoading: false,
  updateConfig: (updates) =>
    set((state) => ({
      config: { ...state.config, ...updates },
    })),
  setNavMenu: (menu) => set({ navMenu: menu }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

interface UIState {
  sidebarCollapsed: boolean;
  themeDrawerOpen: boolean;
  previewMode: boolean;
  activeTab: string;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setThemeDrawerOpen: (open: boolean) => void;
  setPreviewMode: (mode: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  themeDrawerOpen: false,
  previewMode: false,
  activeTab: 'general',
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setThemeDrawerOpen: (open) => set({ themeDrawerOpen: open }),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

interface AIState {
  isGenerating: boolean;
  generationProgress: number;
  generationStatus: string;
  setGenerating: (generating: boolean) => void;
  setProgress: (progress: number) => void;
  setStatus: (status: string) => void;
  reset: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  isGenerating: false,
  generationProgress: 0,
  generationStatus: '',
  setGenerating: (generating) => set({ isGenerating: generating }),
  setProgress: (progress) => set({ generationProgress: progress }),
  setStatus: (status) => set({ generationStatus: status }),
  reset: () => set({ isGenerating: false, generationProgress: 0, generationStatus: '' }),
}));
