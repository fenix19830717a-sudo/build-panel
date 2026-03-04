import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  themeApi,
  siteApi,
  contentApi,
  productApi,
  categoryApi,
  pageApi,
  mediaApi,
  seoApi,
  dashboardApi,
  aiApi,
} from '../api';

// 主题 Hooks
export const useThemes = () =>
  useQuery({
    queryKey: ['themes'],
    queryFn: async () => {
      const res = await themeApi.getAll();
      return res.data || [];
    },
  });

export const useCurrentTheme = () =>
  useQuery({
    queryKey: ['theme', 'current'],
    queryFn: async () => {
      const res = await themeApi.getCurrent();
      return res.data;
    },
  });

export const useUpdateTheme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ themeId, data }: { themeId: string; data: Parameters<typeof themeApi.updateTheme>[1] }) =>
      themeApi.updateTheme(themeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      queryClient.invalidateQueries({ queryKey: ['theme', 'current'] });
    },
  });
};

// 站点配置 Hooks
export const useSiteConfig = () =>
  useQuery({
    queryKey: ['site', 'config'],
    queryFn: async () => {
      const res = await siteApi.getConfig();
      return res.data;
    },
  });

export const useUpdateSiteConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: siteApi.updateConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site', 'config'] });
    },
  });
};

export const useNavMenu = () =>
  useQuery({
    queryKey: ['site', 'navMenu'],
    queryFn: async () => {
      const res = await siteApi.getNavMenu();
      return res.data || [];
    },
  });

export const useUpdateNavMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: siteApi.updateNavMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site', 'navMenu'] });
    },
  });
};

// 内容 Hooks
export const useContentSections = () =>
  useQuery({
    queryKey: ['content', 'sections'],
    queryFn: async () => {
      const res = await contentApi.getSections();
      return res.data || [];
    },
  });

export const useUpdateContentSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof contentApi.updateSection>[1] }) =>
      contentApi.updateSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', 'sections'] });
    },
  });
};

export const useGenerateContent = () =>
  useMutation({
    mutationFn: ({ type, prompt }: { type: string; prompt: string }) =>
      contentApi.generateContent(type, prompt),
  });

// 产品 Hooks
export const useProducts = (params?: Parameters<typeof productApi.getProducts>[0]) =>
  useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const res = await productApi.getProducts(params);
      return res.data;
    },
  });

export const useProduct = (id: string) =>
  useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await productApi.getProduct(id);
      return res.data;
    },
    enabled: !!id,
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof productApi.updateProduct>[1] }) =>
      productApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useGenerateProductDescription = () =>
  useMutation({
    mutationFn: ({ productName, keywords }: { productName: string; keywords: string[] }) =>
      productApi.generateDescription(productName, keywords),
  });

// 分类 Hooks
export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoryApi.getCategories();
      return res.data || [];
    },
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof categoryApi.updateCategory>[1] }) =>
      categoryApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// 页面 Hooks
export const usePages = (params?: Parameters<typeof pageApi.getPages>[0]) =>
  useQuery({
    queryKey: ['pages', params],
    queryFn: async () => {
      const res = await pageApi.getPages(params);
      return res.data || [];
    },
  });

export const usePage = (id: string) =>
  useQuery({
    queryKey: ['page', id],
    queryFn: async () => {
      const res = await pageApi.getPage(id);
      return res.data;
    },
    enabled: !!id,
  });

export const useCreatePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pageApi.createPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
};

export const useUpdatePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof pageApi.updatePage>[1] }) =>
      pageApi.updatePage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['page'] });
    },
  });
};

export const useDeletePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pageApi.deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
};

// 媒体 Hooks
export const useMedia = (params?: Parameters<typeof mediaApi.getMedia>[0]) =>
  useQuery({
    queryKey: ['media', params],
    queryFn: async () => {
      const res = await mediaApi.getMedia(params);
      return res.data;
    },
  });

export const useUploadMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) =>
      mediaApi.uploadMedia(file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mediaApi.deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

export const useGenerateImage = () =>
  useMutation({
    mutationFn: ({ prompt, style }: { prompt: string; style?: string }) =>
      mediaApi.generateImage(prompt, style),
  });

// SEO Hooks
export const useSEOConfig = () =>
  useQuery({
    queryKey: ['seo', 'config'],
    queryFn: async () => {
      const res = await seoApi.getConfig();
      return res.data;
    },
  });

export const useUpdateSEOConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seoApi.updateConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo', 'config'] });
    },
  });
};

export const useAnalyzeSEO = () =>
  useMutation({
    mutationFn: seoApi.analyzeSEO,
  });

export const useOptimizeSEO = () =>
  useMutation({
    mutationFn: ({ pageId }: { pageId: string }) => seoApi.optimizeSEO(pageId),
  });

// 仪表盘 Hooks
export const useDashboardStats = (period?: Parameters<typeof dashboardApi.getStats>[0]) =>
  useQuery({
    queryKey: ['dashboard', 'stats', period],
    queryFn: async () => {
      const res = await dashboardApi.getStats(period);
      return res.data;
    },
  });

export const useRecentActivities = () =>
  useQuery({
    queryKey: ['dashboard', 'activities'],
    queryFn: async () => {
      const res = await dashboardApi.getRecentActivities();
      return res.data || [];
    },
  });

// AI Hooks
export const useAIGenerateContent = () =>
  useMutation({
    mutationFn: ({ type, params }: { type: string; params: Record<string, unknown> }) =>
      aiApi.generateContent(type, params),
  });

export const useAITranslate = () =>
  useMutation({
    mutationFn: ({ content, targetLang, sourceLang }: { content: string; targetLang: string; sourceLang?: string }) =>
      aiApi.translate(content, targetLang, sourceLang),
  });

export const useAIGetSuggestions = () =>
  useMutation({
    mutationFn: ({ context, type }: { context: string; type: string }) =>
      aiApi.getSuggestions(context, type),
  });
