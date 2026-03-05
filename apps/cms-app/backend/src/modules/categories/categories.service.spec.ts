import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { NotFoundException } from '@nestjs/common';

const createMockRepository = <T>(): jest.Mocked<Partial<Repository<T>>> > => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softRemove: jest.fn(),
  manager: {
    getTreeRepository: jest.fn().mockReturnValue({
      findTrees: jest.fn(),
    }),
  },
} as any);

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: jest.Mocked<Repository<Category>>;

  const mockCategory = {
    id: 'category-1',
    name: 'Test Category',
    slug: 'test-category',
    description: 'Test description',
    sortOrder: 1,
    parent: null,
    children: [],
    articles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: createMockRepository<Category>(),
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get(getRepositoryToken(Category));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category with generated slug', async () => {
      const createDto = { name: 'Test Category', description: 'Description' };

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockCategory as Category);
      repository.save.mockResolvedValue(mockCategory as Category);

      const result = await service.create(createDto as any);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'test-category' }),
      );
      expect(result).toEqual(mockCategory);
    });

    it('should append timestamp if slug already exists', async () => {
      const createDto = { name: 'Test Category' };

      repository.findOne.mockResolvedValue(mockCategory as Category);
      repository.create.mockImplementation((data: any) => data as Category);
      repository.save.mockResolvedValue(mockCategory as Category);

      await service.create(createDto as any);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: expect.stringMatching(/test-category-\d+/),
        }),
      );
    });

    it('should create category with parent', async () => {
      const createDto = { name: 'Child Category', parentId: 'category-1' };
      const parentCategory = { ...mockCategory, id: 'category-1' };

      repository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(parentCategory as Category);
      repository.create.mockImplementation((data: any) => data as Category);
      repository.save.mockResolvedValue({
        ...mockCategory,
        name: 'Child Category',
        parent: parentCategory,
      } as Category);

      const result = await service.create(createDto as any);

      expect(repository.findOne).toHaveBeenNthCalledWith(2, {
        where: { id: 'category-1' },
      });
      expect(result.parent).toEqual(parentCategory);
    });

    it('should throw NotFoundException if parent not found', async () => {
      const createDto = { name: 'Child Category', parentId: 'non-existent' };

      repository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await expect(service.create(createDto as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const mockCategories = [mockCategory];
      repository.find.mockResolvedValue(mockCategories as Category[]);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        relations: ['parent'],
        order: { sortOrder: 'ASC', createdAt: 'DESC' },
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('findTree', () => {
    it('should return category tree structure', async () => {
      const mockTree = [
        { ...mockCategory, children: [{ ...mockCategory, id: 'child-1' }] },
      ];
      const treeRepository = { findTrees: jest.fn().mockResolvedValue(mockTree) };
      repository.manager.getTreeRepository.mockReturnValue(treeRepository as any);

      const result = await service.findTree();

      expect(repository.manager.getTreeRepository).toHaveBeenCalledWith(Category);
      expect(treeRepository.findTrees).toHaveBeenCalled();
      expect(result).toEqual(mockTree);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      repository.findOne.mockResolvedValue(mockCategory as Category);

      const result = await service.findOne('category-1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'category-1' },
        relations: ['parent', 'children', 'articles'],
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException if category not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return category by slug', async () => {
      repository.findOne.mockResolvedValue(mockCategory as Category);

      const result = await service.findBySlug('test-category');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { slug: 'test-category' },
        relations: ['parent', 'children', 'articles'],
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException if slug not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto = { description: 'Updated description' };

      repository.findOne.mockResolvedValue(mockCategory as Category);
      repository.save.mockResolvedValue({ ...mockCategory, ...updateDto } as Category);

      const result = await service.update('category-1', updateDto as any);

      expect(result.description).toBe('Updated description');
    });

    it('should regenerate slug if name changes', async () => {
      const updateDto = { name: 'New Name' };

      repository.findOne.mockResolvedValue(mockCategory as Category);
      repository.save.mockResolvedValue({
        ...mockCategory,
        ...updateDto,
        slug: 'new-name',
      } as Category);

      const result = await service.update('category-1', updateDto as any);

      expect(result.slug).toBe('new-name');
    });

    it('should not change slug if name is same', async () => {
      const updateDto = { name: 'Test Category', description: 'Updated' };

      repository.findOne.mockResolvedValue(mockCategory as Category);
      repository.save.mockResolvedValue({
        ...mockCategory,
        ...updateDto,
      } as Category);

      const result = await service.update('category-1', updateDto as any);

      expect(result.slug).toBe('test-category');
    });

    it('should update parent category', async () => {
      const updateDto = { parentId: 'new-parent' };
      const newParent = { ...mockCategory, id: 'new-parent' };

      repository.findOne
        .mockResolvedValueOnce(mockCategory as Category)
        .mockResolvedValueOnce(newParent as Category);
      repository.save.mockResolvedValue({
        ...mockCategory,
        parent: newParent,
      } as Category);

      const result = await service.update('category-1', updateDto as any);

      expect(result.parent).toEqual(newParent);
    });

    it('should throw NotFoundException if category not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft remove a category', async () => {
      repository.findOne.mockResolvedValue(mockCategory as Category);
      repository.softRemove.mockResolvedValue(mockCategory as Category);

      await service.remove('category-1');

      expect(repository.softRemove).toHaveBeenCalledWith(mockCategory);
    });

    it('should throw NotFoundException if category not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
