import { Repository } from 'typeorm';

/**
 * 创建 TypeORM Repository Mock
 */
export function createMockRepository<T>(): jest.Mocked<Repository<T>> {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
    query: jest.fn(),
    manager: {} as any,
  } as unknown as jest.Mocked<Repository<T>>;
}

/**
 * 创建 Mock 数据工厂函数
 */
export const mockFactory = {
  tenant: (overrides = {}) => ({
    id: 'tenant-123',
    slug: 'test-tenant',
    name: 'Test Tenant',
    description: 'Test Description',
    logo: 'https://example.com/logo.png',
    favicon: 'https://example.com/favicon.ico',
    status: 'active',
    plan: 'free',
    settings: {},
    contactInfo: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  theme: (overrides = {}) => ({
    id: 'theme-123',
    name: 'Test Theme',
    slug: 'test-theme',
    description: 'Test Theme Description',
    status: 'active',
    isDefault: false,
    config: {
      colors: { primary: '#000000' },
      typography: { fontFamily: { heading: 'Arial' } },
    },
    customCss: null,
    previewImage: null,
    tenantId: 'tenant-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  content: (overrides = {}) => ({
    id: 'content-123',
    tenant_id: 'tenant-123',
    key: 'hero_title',
    value: 'Welcome',
    language: 'zh-CN',
    section: 'home',
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),

  product: (overrides = {}) => ({
    id: 'product-123',
    tenant_id: 'tenant-123',
    name: 'Test Product',
    description: 'Test Description',
    short_description: 'Short description',
    price: 99.99,
    compare_price: 129.99,
    stock: 100,
    sku: 'SKU-001',
    images: ['https://example.com/image.jpg'],
    category_id: 'category-123',
    tag_ids: ['tag-1', 'tag-2'],
    status: 'published',
    seo: {},
    attributes: {},
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),

  category: (overrides = {}) => ({
    id: 'category-123',
    tenant_id: 'tenant-123',
    name: 'Test Category',
    slug: 'test-category',
    description: 'Category description',
    sort_order: 1,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),

  tag: (overrides = {}) => ({
    id: 'tag-123',
    tenant_id: 'tenant-123',
    name: 'Test Tag',
    slug: 'test-tag',
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),
};

/**
 * 异步数据模拟辅助函数
 */
export const asyncMock = {
  resolve: <T>(value: T): Promise<T> => Promise.resolve(value),
  reject: <T>(error: Error): Promise<T> => Promise.reject(error),
};
