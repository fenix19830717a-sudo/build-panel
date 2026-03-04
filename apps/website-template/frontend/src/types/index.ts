export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  muted: string;
  'muted-foreground': string;
  accent: string;
  border: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  fonts: ThemeFonts;
  name: string;
}

export interface SiteConfig {
  name: string;
  logo?: string;
  description: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  featured?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  category: string;
  tags: string[];
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}
