import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ArticlesService } from './articles.service';
import { Article, ArticleStatus } from './entities/article.entity';
import { NotFoundException } from '@nestjs/common';

const createMockRepository = <T>(): jest.Mocked<Repository<T>> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  softRemove: jest.fn(),
  increment: jest.fn(),
} as any);

describe('ArticlesService', () => {
  let service: ArticlesService;
  let repository: jest.Mocked<Repository<Article>>;

  const mockArticle = {
    id: 'article-1',
    title: 'Test Article',
    slug: 'test-article',
    content: 'Test content',
    excerpt: 'Test excerpt',
    status: ArticleStatus.PUBLISHED,
    views: 100,
    categoryId: 'category-1',
    category: { id: 'category-1', name: 'Test Category' },
    tags: [],
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(Article),
          useValue: createMockRepository<Article>(),
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    repository = module.get(getRepositoryToken(Article));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an article with generated slug', async () => {
      const createDto = {
        title: 'Test Article',
        content: 'Content',
        status: ArticleStatus.DRAFT,
      };

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockArticle as Article);
      repository.save.mockResolvedValue(mockArticle as Article);

      const result = await service.create(createDto as any);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'test-article' }),
      );
      expect(result).toEqual(mockArticle);
    });

    it('should append timestamp if slug already exists', async () => {
      const createDto = { title: 'Test Article', content: 'Content' };

      repository.findOne.mockResolvedValue(mockArticle as Article);
      repository.create.mockImplementation((data: any) => data as Article);
      repository.save.mockResolvedValue(mockArticle as Article);

      await service.create(createDto as any);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: expect.stringMatching(/test-article-\d+/),
        }),
      );
    });

    it('should handle special characters in title', async () => {
      const createDto = { title: 'Test Article! @#$', content: 'Content' };

      repository.findOne.mockResolvedValue(null);
      repository.create.mockImplementation((data: any) => data as Article);
      repository.save.mockResolvedValue(mockArticle as Article);

      await service.create(createDto as any);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'test-article',
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated articles', async () => {
      const query = { page: 1, limit: 10 };
      const mockArticles = [mockArticle];

      repository.findAndCount.mockResolvedValue([mockArticles as Article[], 1]);

      const result = await service.findAll(query as any);

      expect(result.items).toEqual(mockArticles);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter by category', async () => {
      const query = { page: 1, limit: 10, categoryId: 'category-1' };

      repository.findAndCount.mockResolvedValue([[mockArticle] as Article[], 1]);

      await service.findAll(query as any);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ categoryId: 'category-1' }),
        }),
      );
    });

    it('should filter by status', async () => {
      const query = { page: 1, limit: 10, status: ArticleStatus.PUBLISHED };

      repository.findAndCount.mockResolvedValue([[mockArticle] as Article[], 1]);

      await service.findAll(query as any);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: ArticleStatus.PUBLISHED }),
        }),
      );
    });

    it('should search by title', async () => {
      const query = { page: 1, limit: 10, search: 'test' };

      repository.findAndCount.mockResolvedValue([[mockArticle] as Article[], 1]);

      await service.findAll(query as any);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: Like('%test%'),
          }),
        }),
      );
    });

    it('should sort by specified field', async () => {
      const query = { page: 1, limit: 10, orderBy: 'views', order: 'ASC' as const };

      repository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(query as any);

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { views: 'ASC' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an article by id', async () => {
      repository.findOne.mockResolvedValue(mockArticle as Article);

      const result = await service.findOne('article-1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'article-1' },
        relations: ['category', 'tags'],
      });
      expect(result).toEqual(mockArticle);
    });

    it('should throw NotFoundException if article not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return published article by slug', async () => {
      repository.findOne.mockResolvedValue(mockArticle as Article);
      repository.increment.mockResolvedValue({ affected: 1 } as any);

      const result = await service.findBySlug('test-article');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { slug: 'test-article', status: ArticleStatus.PUBLISHED },
        relations: ['category', 'tags'],
      });
      expect(repository.increment).toHaveBeenCalledWith(
        { id: 'article-1' },
        'views',
        1,
      );
      expect(result.views).toBe(101);
    });

    it('should throw NotFoundException if article not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an article', async () => {
      const updateDto = { content: 'Updated content' };

      repository.findOne.mockResolvedValue(mockArticle as Article);
      repository.save.mockResolvedValue({ ...mockArticle, ...updateDto } as Article);

      const result = await service.update('article-1', updateDto as any);

      expect(result.content).toBe('Updated content');
    });

    it('should regenerate slug if title changes', async () => {
      const updateDto = { title: 'New Title' };

      repository.findOne.mockResolvedValue(mockArticle as Article);
      repository.save.mockResolvedValue({
        ...mockArticle,
        ...updateDto,
        slug: 'new-title',
      } as Article);

      const result = await service.update('article-1', updateDto as any);

      expect(result.slug).toBe('new-title');
    });

    it('should not change slug if title is same', async () => {
      const updateDto = { title: 'Test Article', content: 'Updated' };

      repository.findOne.mockResolvedValue(mockArticle as Article);
      repository.save.mockResolvedValue({
        ...mockArticle,
        ...updateDto,
      } as Article);

      const result = await service.update('article-1', updateDto as any);

      expect(result.slug).toBe('test-article');
    });

    it('should throw NotFoundException if article not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft remove an article', async () => {
      repository.findOne.mockResolvedValue(mockArticle as Article);
      repository.softRemove.mockResolvedValue(mockArticle as Article);

      await service.remove('article-1');

      expect(repository.softRemove).toHaveBeenCalledWith(mockArticle);
    });

    it('should throw NotFoundException if article not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('incrementViews', () => {
    it('should increment article views', async () => {
      repository.increment.mockResolvedValue({ affected: 1 } as any);

      await service.incrementViews('article-1');

      expect(repository.increment).toHaveBeenCalledWith({ id: 'article-1' }, 'views', 1);
    });
  });

  describe('getPopularArticles', () => {
    it('should return most viewed articles', async () => {
      const mockArticles = [mockArticle];
      repository.find.mockResolvedValue(mockArticles as Article[]);

      const result = await service.getPopularArticles(5);

      expect(repository.find).toHaveBeenCalledWith({
        where: { status: ArticleStatus.PUBLISHED },
        order: { views: 'DESC' },
        take: 5,
        relations: ['category'],
      });
      expect(result).toEqual(mockArticles);
    });

    it('should use default limit', async () => {
      repository.find.mockResolvedValue([]);

      await service.getPopularArticles();

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    });
  });

  describe('getRecentArticles', () => {
    it('should return recently published articles', async () => {
      const mockArticles = [mockArticle];
      repository.find.mockResolvedValue(mockArticles as Article[]);

      const result = await service.getRecentArticles(5);

      expect(repository.find).toHaveBeenCalledWith({
        where: { status: ArticleStatus.PUBLISHED },
        order: { publishedAt: 'DESC' },
        take: 5,
        relations: ['category'],
      });
    });
  });
});
