import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { NotFoundException } from '@nestjs/common';

// Mock Repository Factory
const createMockRepository = <T>(): jest.Mocked<Repository<T>> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  increment: jest.fn(),
} as any);

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: jest.Mocked<Repository<Product>>;

  const mockProduct = {
    id: 'product-1',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    compareAtPrice: 129.99,
    stock: 100,
    isActive: true,
    images: ['image1.jpg'],
    sku: 'SKU-001',
    attributes: { color: 'red' },
    viewCount: 0,
    rating: 4.5,
    reviewCount: 10,
    categoryId: 'category-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: createMockRepository<Product>(),
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createDto = {
        name: 'New Product',
        description: 'Description',
        price: 99.99,
        stock: 50,
      };

      repository.create.mockReturnValue(mockProduct as Product);
      repository.save.mockResolvedValue(mockProduct as Product);

      const result = await service.create(createDto as any);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const query = { page: 1, limit: 10 };
      const mockProducts = [mockProduct];

      repository.findAndCount.mockResolvedValue([mockProducts as Product[], 1]);

      const result = await service.findAll(query as any);

      expect(result.data).toEqual(mockProducts);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should filter by category', async () => {
      const query = { page: 1, limit: 10, categoryId: 'category-1' };

      repository.findAndCount.mockResolvedValue([[mockProduct] as Product[], 1]);

      await service.findAll(query as any);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ categoryId: 'category-1' }),
        }),
      );
    });

    it('should filter by search term', async () => {
      const query = { page: 1, limit: 10, search: 'test' };

      repository.findAndCount.mockResolvedValue([[mockProduct] as Product[], 1]);

      await service.findAll(query as any);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: Like('%test%'),
          }),
        }),
      );
    });

    it('should filter by price range', async () => {
      const query = { page: 1, limit: 10, minPrice: 50, maxPrice: 100 };

      repository.findAndCount.mockResolvedValue([[mockProduct] as Product[], 1]);

      await service.findAll(query as any);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: Between(50, 100),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      repository.findOne.mockResolvedValue(mockProduct as Product);

      const result = await service.findOne('product-1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'product-1' } });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto = { name: 'Updated Product' };

      repository.findOne.mockResolvedValue(mockProduct as Product);
      repository.save.mockResolvedValue({ ...mockProduct, ...updateDto } as Product);

      const result = await service.update('product-1', updateDto as any);

      expect(result.name).toBe('Updated Product');
    });

    it('should throw NotFoundException if product not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      repository.findOne.mockResolvedValue(mockProduct as Product);
      repository.remove.mockResolvedValue(mockProduct as Product);

      await service.remove('product-1');

      expect(repository.remove).toHaveBeenCalledWith(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('incrementViewCount', () => {
    it('should increment product view count', async () => {
      repository.increment.mockResolvedValue({ affected: 1 } as any);

      await service.incrementViewCount('product-1');

      expect(repository.increment).toHaveBeenCalledWith({ id: 'product-1' }, 'viewCount', 1);
    });
  });

  describe('getFeaturedProducts', () => {
    it('should return featured products', async () => {
      const mockProducts = [mockProduct];
      repository.find.mockResolvedValue(mockProducts as Product[]);

      const result = await service.getFeaturedProducts(8);

      expect(repository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { viewCount: 'DESC' },
        take: 8,
      });
      expect(result).toEqual(mockProducts);
    });

    it('should use default limit if not provided', async () => {
      repository.find.mockResolvedValue([]);

      await service.getFeaturedProducts();

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 8 }),
      );
    });
  });

  describe('getNewArrivals', () => {
    it('should return new arrivals sorted by createdAt', async () => {
      const mockProducts = [mockProduct];
      repository.find.mockResolvedValue(mockProducts as Product[]);

      const result = await service.getNewArrivals(8);

      expect(repository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { createdAt: 'DESC' },
        take: 8,
      });
      expect(result).toEqual(mockProducts);
    });
  });
});
