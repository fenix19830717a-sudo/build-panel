// 主题配置类型
export interface ThemeConfig {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  layout: 'default' | 'sidebar' | 'top';
  logo?: string;
  favicon?: string;
}

// 站点配置
export interface SiteConfig {
  title: string;
  description: string;
  keywords: string;
  author: string;
  language: string;
  theme: ThemeConfig;
  socialLinks: SocialLink[];
}

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

// 内容类型
export interface ContentSection {
  id: string;
  type: 'hero' | 'about' | 'services' | 'testimonials' | 'contact' | 'custom';
  title: string;
  subtitle?: string;
  content: string;
  images?: string[];
  order: number;
  isVisible: boolean;
}

// 产品类型
export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  categoryId: string;
  tags: string[];
  stock: number;
  sku: string;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
}

// 页面类型
export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  isPublished: boolean;
  isInMenu: boolean;
  menuOrder: number;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

// 媒体类型
export interface MediaItem {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video' | 'document';
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  createdAt: string;
}

// SEO 配置
export interface SEOConfig {
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  ogImage?: string;
  twitterHandle?: string;
  robotsTxt: string;
  sitemapEnabled: boolean;
  canonicalUrl?: string;
}

// 统计数据
export interface DashboardStats {
  totalVisits: number;
  uniqueVisitors: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  topPages: { path: string; views: number }[];
  visitsByDate: { date: string; visits: number }[];
  contentStats: {
    totalProducts: number;
    totalPages: number;
    totalMedia: number;
    publishedPages: number;
  };
}

// 导航菜单
export interface NavMenuItem {
  id: string;
  title: string;
  path: string;
  icon?: string;
  children?: NavMenuItem[];
  isExternal?: boolean;
  order: number;
}

// AI 生成任务
export interface AIGenerationTask {
  id: string;
  type: 'content' | 'product' | 'seo' | 'image' | 'translate';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  prompt: string;
  result?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

// 用户
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: string;
}

// API 响应
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
