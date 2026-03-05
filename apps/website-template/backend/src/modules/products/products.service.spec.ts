import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Product, ProductStatus } from '../../database/entities/product.entity';
import { ProductCategory } from '../../database/entities/product-category.entity';
import { ProductTag } from '../../database/entities/product-tag.entity';
import { NotFoundException } from '@nestjs/common';
import { createMockRepository, mockFactory } from '../../../test/test-utils';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: jest.Mocked<Repository<Product>>;
  let categoryRepository: jest.Mocked<Repository<ProductCategory>>;
  let tagRepository: jest.Mocked<Repository<ProductTag>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: createMockRepository<Product>(),
        },
        {
          provide: getRepositoryToken(ProductCategory),
          useValue: createMockRepository<ProductCategory>(),
        },
        {
          provide: getRepositoryToken(ProductTag),
          useValue: createMockRepository<ProductTag>(),
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get(getRepositoryToken(Product));
    categoryRepository = module.get(getRepositoryToken(ProductCategory));
    tagRepository = module.get(getRepositoryToken(ProductTag));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new product successfully', async () => {
      const createDto = {
        tenantId: 'tenant-123',
        name: 'New Product',
        description: 'Product description',
        short_description: 'Short desc',
        price: 99.99,
        compare_price: 129.99,
        stock: 50,
        sku: 'SKU-001',
        images: ['https://example.com/image.jpg'],
        category_id: 'category-123',
        tag_ids: ['tag-1', 'tag-2'],
        status: ProductStatus.PUBLISHED,
        seo: { title: 'SEO Title' },
        attributes: { color: 'red' },
      };

      const mockProduct = mockFactory.product({
        ...createDto,
        id: 'product-123',
      });

      productRepository.create.mockReturnValue(mockProduct as Product);
      productRepository.save.mockResolvedValue(mockProduct as Product);

      const result = await service.create(createDto);

      expect(productRepository.create).toHaveBeenCalledWith({
        tenant_id: createDto.tenantId,
        name: createDto.name,
        description: createDto.description,
        short_description: createDto.short_description,
        price: createDto.price,
        compare_price: createDto.compare_price,
        stock: createDto.stock,
        sku: createDto.sku,
        images: createDto.images,
        category_id: createDto.category_id,
        tag_ids: createDto.tag_ids,
        status: createDto.status,
        seo: createDto.seo,
        attributes: createDto.attributes,
      });
      expect(result).toEqual(mockProduct);
    });

    it('should use default values for optional fields', async () => {
      const createDto = {
        tenantId: 'tenant-123',
        name: 'Simple Product',
        price: 99.99,
      };

      const mockProduct = mockFactory.product({
        id: 'product-123',
        tenant_id: createDto.tenantId,
        name: createDto.name,
        price: createDto.price,
        stock: 0,
        tag_ids: [],
        images: [],
        attributes: {},
        status: ProductStatus.DRAFT,
      });

      productRepository.create.mockReturnValue(mockProduct as Product);
      productRepository.save.mockResolvedValue(mockProduct as Product);

      await service.create(createDto);

      expect(productRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          stock: 0,
          tag_ids: [],
          images: [],
          attributes: {},
          status: ProductStatus.DRAFT,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const query = { tenantId: 'tenant-123' };
      const mockProducts = [
        mockFactory.product({ id: '1', name: 'Product 1' }),
        mockFactory.product({ id: '2', name: 'Product 2' }),
      ];

      productRepository.findAndCount.mockResolvedValue([
        mockProducts as Product[],
        mockProducts.length,
      ]);

      const result = await service.findAll(query);

      expect(productRepository.findAndCount).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant-123' },
        skip: 0,
        take: 10,
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual({
        data: mockProducts,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should handle custom pagination', async () => {
      const query = { tenantId: 'tenant-123', page: 2, limit: 5 };

      productRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(query);

      expect(productRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
    });

    it('should filter by category', async () => {
      const query = { tenantId: 'tenant-123', category: 'category-123' };

      productRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(query);

      expect(productRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            tenant_id: 'tenant-123',
            category_id: 'category-123',
          },
        }),
      );
    });

    it('should filter by status', async () => {
      const query = { tenantId: 'tenant-123', status: ProductStatus.PUBLISHED };

      productRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(query);

      expect(productRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            tenant_id: 'tenant-123',
            status: ProductStatus.PUBLISHED,
          },
        }),
      );
    });

    it('should calculate total pages correctly', async () => {
      const query = { tenantId: 'tenant-123', limit: 10 };
      const mockProducts = new Array(25).fill(null).map((_, i) =>
        mockFactory.product({ id: `${i + 1}` }),
      );

      productRepository.findAndCount.mockResolvedValue([
        mockProducts.slice(0, 10) as Product[],
        25,
      ]);

      const result = await service.findAll(query);

      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const mockProduct = mockFactory.product({
        id: 'product-123',
        tenant_id: 'tenant-123',
      });
      productRepository.findOne.mockResolvedValue(mockProduct as Product);

      const result = await service.findOne('product-123', 'tenant-123');

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'product-123', tenant_id: 'tenant-123' },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      productRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('non-existent', 'tenant-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update product successfully', async () => {
      const existingProduct = mockFactory.product({
        id: 'product-123',
        tenant_id: 'tenant-123',
        name: 'Old Name',
        price: 99.99,
      });
      const updateDto = { name: 'New Name', price: 149.99 };

      productRepository.findOne.mockResolvedValue(existingProduct as Product);
      productRepository.save.mockResolvedValue({
        ...existingProduct,
        ...updateDto,
      } as Product);

      const result = await service.update(
        'product-123',
        'tenant-123',
        updateDto,
      );

      expect(result.name).toBe('New Name');
      expect(result.price).toBe(149.99);
    });

    it('should throw NotFoundException if product not found', async () => {
      productRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent', 'tenant-123', { name: 'New' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove product successfully', async () => {
      const mockProduct = mockFactory.product({
        id: 'product-123',
        tenant_id: 'tenant-123',
      });
      productRepository.findOne.mockResolvedValue(mockProduct as Product);
      productRepository.remove.mockResolvedValue(mockProduct as Product);

      await service.remove('product-123', 'tenant-123');

      expect(productRepository.remove).toHaveBeenCalledWith(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      productRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('non-existent', 'tenant-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findCategories', () => {
    it('should return all categories for a tenant', async () => {
      const mockCategories = [
        mockFactory.category({ id: '1', name: 'Category 1', sort_order: 1 }),
        mockFactory.category({ id: '2', name: 'Category 2', sort_order: 2 }),
      ];

      categoryRepository.find.mockResolvedValue(mockCategories as ProductCategory[]);

      const result = await service.findCategories('tenant-123');

      expect(categoryRepository.find).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant-123' },
        order: { sort_order: 'ASC' },
      });
      expect(result).toEqual(mockCategories);
    });

    it('should return empty array if no categories', async () => {
      categoryRepository.find.mockResolvedValue([]);

      const result = await service.findCategories('tenant-123');

      expect(result).toEqual([]);
    });
  });

  describe('createCategory', () => {
    it('should create a new category successfully', async () => {
      const data = {
        name: 'New Category',
        slug: 'new-category',
        description: 'Category description',
        tenantId: 'tenant-123',
      };

      const mockCategory = mockFactory.category({
        ...data,
        id: 'category-123',
        tenant_id: data.tenantId,
      });

      categoryRepository.create.mockReturnValue(mockCategory as ProductCategory);
      categoryRepository.save.mockResolvedValue(mockCategory as ProductCategory);

      const result = await service.createCategory(data);

      expect(categoryRepository.create).toHaveBeenCalledWith({
        tenant_id: data.tenantId,
        name: data.name,
        slug: data.slug,
        description: data.description,
      });
      expect(result).toEqual(mockCategory);
    });

    it('should create category without description', async () => {
      const data = {
        name: 'Simple Category',
        slug: 'simple-category',
        tenantId: 'tenant-123',
      };

      const mockCategory = mockFactory.category({
        id: 'category-123',
        tenant_id: data.tenantId,
        name: data.name,
        slug: data.slug,
        description: undefined,
      });

      categoryRepository.create.mockReturnValue(mockCategory as ProductCategory);
      categoryRepository.save.mockResolvedValue(mockCategory as ProductCategory);

      await service.createCategory(data);

      expect(categoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: undefined,
        }),
      );
    });
  });

  describe('findTags', () => {
    it('should return all tags for a tenant', async () => {
      const mockTags = [
        mockFactory.tag({ id: '1', name: 'Tag A' }),
        mockFactory.tag({ id: '2', name: 'Tag B' }),
      ];

      tagRepository.find.mockResolvedValue(mockTags as ProductTag[]);

      const result = await service.findTags('tenant-123');

      expect(tagRepository.find).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant-123' },
        order: { name: 'ASC' },
      });
      expect(result).toEqual(mockTags);
    });

    it('should return tags sorted by name', async () => {
      const mockTags = [
        mockFactory.tag({ id: '2', name: 'Apple' }),
        mockFactory.tag({ id: '1', name: 'Banana' }),
      ];

      tagRepository.find.mockResolvedValue(mockTags as ProductTag[]);

      await service.findTags('tenant-123');

      expect(tagRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { name: 'ASC' },
        }),
      );
    });
  });
});
