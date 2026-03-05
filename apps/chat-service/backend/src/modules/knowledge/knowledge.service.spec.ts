import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeArticle } from '../../common/entities/knowledge-article.entity';
import { KnowledgeCategory } from '../../common/entities/knowledge-category.entity';

const createMockRepository = <T>(): jest.Mocked<Repository<T>> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
} as any);

describe('KnowledgeService', () => {
  let service: KnowledgeService;
  let articleRepository: jest.Mocked<Repository<KnowledgeArticle>>;
  let categoryRepository: jest.Mocked<Repository<KnowledgeCategory>>;

  const mockCategory = {
    id: 'category-1',
    name: 'Test Category',
    slug: 'test-category',
    description: 'Description',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockArticle = {
    id: 'article-1',
    title: 'Test Article',
    slug: 'test-article',
    content: 'Article content',
    excerpt: 'Excerpt',
    isPublished: true,
    categoryId: 'category-1',
    category: mockCategory,
    createdBy: 'user-1',
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeService,
        {
          provide: getRepositoryToken(KnowledgeArticle),
          useValue: createMockRepository<KnowledgeArticle>(),
        },
        {
          provide: getRepositoryToken(KnowledgeCategory),
          useValue: createMockRepository<KnowledgeCategory>(),
        },
      ],
    }).compile();

    service = module.get<KnowledgeService>(KnowledgeService);
    articleRepository = module.get(getRepositoryToken(KnowledgeArticle));
    categoryRepository = module.get(getRepositoryToken(KnowledgeCategory));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const createDto = {
        name: 'Test Category',
        slug: 'test-category',
        description: 'Description',
      };

      categoryRepository.create.mockReturnValue(mockCategory as KnowledgeCategory);
      categoryRepository.save.mockResolvedValue(mockCategory as KnowledgeCategory);

      const result = await service.createCategory(createDto as any);

      expect(categoryRepository.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAllCategories', () => {
    it('should return all active categories', async () => {
      const mockCategories = [mockCategory];
      categoryRepository.find.mockResolvedValue(mockCategories as KnowledgeCategory[]);

      const result = await service.findAllCategories();

      expect(categoryRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('createArticle', () => {
    it('should create a published article with publishedAt', async () => {
      const createDto = {
        title: 'Test Article',
        content: 'Content',
        isPublished: true,
      };

      articleRepository.create.mockImplementation((data: any) => data as KnowledgeArticle);
      articleRepository.save.mockResolvedValue(mockArticle as KnowledgeArticle);

      const result = await service.createArticle(createDto as any, 'user-1');

      expect(articleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createDto,
          createdBy: 'user-1',
          publishedAt: expect.any(Date),
        }),
      );
      expect(result).toEqual(mockArticle);
    });

    it('should create draft article without publishedAt', async () => {
      const createDto = {
        title: 'Draft Article',
        content: 'Content',
        isPublished: false,
      };

      const draftArticle = { ...mockArticle, isPublished: false, publishedAt: null };
      articleRepository.create.mockImplementation((data: any) => data as KnowledgeArticle);
      articleRepository.save.mockResolvedValue(draftArticle as KnowledgeArticle);

      await service.createArticle(createDto as any, 'user-1');

      expect(articleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          publishedAt: null,
        }),
      );
    });
  });

  describe('findAllArticles', () => {
    it('should return all published articles with category', async () => {
      const mockArticles = [mockArticle];
      articleRepository.find.mockResolvedValue(mockArticles as KnowledgeArticle[]);

      const result = await service.findAllArticles();

      expect(articleRepository.find).toHaveBeenCalledWith({
        where: { isPublished: true },
        relations: ['category'],
      });
      expect(result).toEqual(mockArticles);
    });
  });

  describe('search', () => {
    it('should search articles by query', async () => {
      const query = 'test';
      const mockResults = [mockArticle];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockResults),
      };

      articleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.search(query);

      expect(articleRepository.createQueryBuilder).toHaveBeenCalledWith('article');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('article.isPublished = true');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(article.title ILIKE :query OR article.content ILIKE :query)',
        { query: '%test%' },
      );
      expect(result).toEqual(mockResults);
    });

    it('should handle empty search results', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      articleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.search('nonexistent');

      expect(result).toEqual([]);
    });
  });
});
