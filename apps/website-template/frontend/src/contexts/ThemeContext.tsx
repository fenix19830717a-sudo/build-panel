import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ThemeConfig, SiteConfig } from '../types';

// Default theme configuration
export const defaultTheme: ThemeConfig = {
  name: 'default',
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#ffffff',
    foreground: '#0f172a',
    muted: '#f1f5f9',
    'muted-foreground': '#64748b',
    accent: '#f8fafc',
    border: '#e2e8f0',
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
};

// Elegant theme (for jewelry/luxury)
export const elegantTheme: ThemeConfig = {
  name: 'elegant',
  colors: {
    primary: '#d4af37',
    secondary: '#8b7355',
    background: '#0a0a0a',
    foreground: '#fafafa',
    muted: '#1a1a1a',
    'muted-foreground': '#a3a3a3',
    accent: '#262626',
    border: '#333333',
  },
  fonts: {
    heading: 'Playfair Display, Georgia, serif',
    body: 'Inter, system-ui, sans-serif',
  },
};

interface ThemeContextType {
  theme: ThemeConfig;
  siteConfig: SiteConfig;
  isLoading: boolean;
  error: string | null;
  setTheme: (theme: ThemeConfig) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    name: 'My Website',
    description: 'Welcome to our amazing website',
    contact: {
      email: 'contact@example.com',
      phone: '+1 234 567 890',
      address: '123 Main Street, City, Country',
    },
    social: {
      facebook: '#',
      twitter: '#',
      instagram: '#',
      linkedin: '#',
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load theme from API
    const loadTheme = async () => {
      try {
        // Try to fetch from API
        const response = await fetch('/api/v1/theme/config');
        if (!response.ok) throw new Error('Failed to fetch theme');
        const data = await response.json();
        setTheme(data);
      } catch (err) {
        // Fallback to default theme
        console.log('Using default theme, API not available');
        setTheme(defaultTheme);
      }
    };

    // Load site config from API
    const loadSiteConfig = async () => {
      try {
        const response = await fetch('/api/v1/site/config');
        if (!response.ok) throw new Error('Failed to fetch site config');
        const data = await response.json();
        setSiteConfig(data);
      } catch (err) {
        console.log('Using default site config, API not available');
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
    loadSiteConfig();
  }, []);

  // Apply theme CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Apply fonts
    root.style.setProperty('--font-heading', theme.fonts.heading);
    root.style.setProperty('--font-body', theme.fonts.body);

    // Apply dark mode class if needed
    if (theme.name === 'elegant' || theme.colors.background === '#0a0a0a') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const value = {
    theme,
    siteConfig,
    isLoading,
    error,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
