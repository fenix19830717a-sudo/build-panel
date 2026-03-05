import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentsService } from './contents.service';
import { Content } from '../../database/entities/content.entity';
import { NotFoundException } from '@nestjs/common';
import { createMockRepository, mockFactory } from '../../../test/test-utils';

describe('ContentsService', () => {
  let service: ContentsService;
  let repository: jest.Mocked<Repository<Content>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentsService,
        {
          provide: getRepositoryToken(Content),
          useValue: createMockRepository<Content>(),
        },
      ],
    }).compile();

    service = module.get<ContentsService>(ContentsService);
    repository = module.get(getRepositoryToken(Content));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new content successfully', async () => {
      const createDto = {
        tenantId: 'tenant-123',
        key: 'hero_title',
        value: 'Welcome to our site',
        language: 'en',
        section: 'home',
      };

      const mockContent = mockFactory.content({
        ...createDto,
        id: 'content-123',
      });

      repository.create.mockReturnValue(mockContent as Content);
      repository.save.mockResolvedValue(mockContent as Content);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith({
        tenant_id: createDto.tenantId,
        key: createDto.key,
        value: createDto.value,
        language: createDto.language,
        section: createDto.section,
      });
      expect(repository.save).toHaveBeenCalledWith(mockContent);
      expect(result).toEqual(mockContent);
    });

    it('should use default language if not provided', async () => {
      const createDto = {
        tenantId: 'tenant-123',
        key: 'hero_title',
        value: 'Welcome',
      };

      const mockContent = mockFactory.content({
        tenant_id: createDto.tenantId,
        key: createDto.key,
        value: createDto.value,
        language: 'zh-CN',
      });

      repository.create.mockReturnValue(mockContent as Content);
      repository.save.mockResolvedValue(mockContent as Content);

      await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ language: 'zh-CN' }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all contents for a tenant', async () => {
      const query = { tenantId: 'tenant-123' };
      const mockContents = [
        mockFactory.content({ id: '1', key: 'hero_title' }),
        mockFactory.content({ id: '2', key: 'about_text' }),
      ];

      repository.find.mockResolvedValue(mockContents as Content[]);

      const result = await service.findAll(query);

      expect(repository.find).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant-123' },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(mockContents);
    });

    it('should filter by key', async () => {
      const query = { tenantId: 'tenant-123', key: 'hero_title' };
      const mockContents = [mockFactory.content({ key: 'hero_title' })];

      repository.find.mockResolvedValue(mockContents as Content[]);

      await service.findAll(query);

      expect(repository.find).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant-123', key: 'hero_title' },
        order: { created_at: 'DESC' },
      });
    });

    it('should filter by language', async () => {
      const query = { tenantId: 'tenant-123', language: 'en' };
      const mockContents = [mockFactory.content({ language: 'en' })];

      repository.find.mockResolvedValue(mockContents as Content[]);

      await service.findAll(query);

      expect(repository.find).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant-123', language: 'en' },
        order: { created_at: 'DESC' },
      });
    });

    it('should filter by section', async () => {
      const query = { tenantId: 'tenant-123', section: 'home' };
      const mockContents = [mockFactory.content({ section: 'home' })];

      repository.find.mockResolvedValue(mockContents as Content[]);

      await service.findAll(query);

      expect(repository.find).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant-123', section: 'home' },
        order: { created_at: 'DESC' },
      });
    });

    it('should apply all filters together', async () => {
      const query = {
        tenantId: 'tenant-123',
        key: 'hero_title',
        language: 'en',
        section: 'home',
      };

      repository.find.mockResolvedValue([]);

      await service.findAll(query);

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          tenant_id: 'tenant-123',
          key: 'hero_title',
          language: 'en',
          section: 'home',
        },
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a content by id', async () => {
      const mockContent = mockFactory.content({
        id: 'content-123',
        tenant_id: 'tenant-123',
      });
      repository.findOne.mockResolvedValue(mockContent as Content);

      const result = await service.findOne('content-123', 'tenant-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'content-123', tenant_id: 'tenant-123' },
      });
      expect(result).toEqual(mockContent);
    });

    it('should throw NotFoundException if content not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('non-existent', 'tenant-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update content value', async () => {
      const existingContent = mockFactory.content({
        id: 'content-123',
        tenant_id: 'tenant-123',
        value: 'Old Value',
      });
      const updateDto = { value: 'New Value' };

      repository.findOne.mockResolvedValue(existingContent as Content);
      repository.save.mockResolvedValue({
        ...existingContent,
        ...updateDto,
      } as Content);

      const result = await service.update(
        'content-123',
        'tenant-123',
        updateDto,
      );

      expect(result.value).toBe('New Value');
      expect(repository.save).toHaveBeenCalled();
    });

    it('should update content language', async () => {
      const existingContent = mockFactory.content({
        id: 'content-123',
        tenant_id: 'tenant-123',
        language: 'zh-CN',
      });
      const updateDto = { language: 'en' };

      repository.findOne.mockResolvedValue(existingContent as Content);
      repository.save.mockResolvedValue({
        ...existingContent,
        ...updateDto,
      } as Content);

      const result = await service.update(
        'content-123',
        'tenant-123',
        updateDto,
      );

      expect(result.language).toBe('en');
    });

    it('should update content section', async () => {
      const existingContent = mockFactory.content({
        id: 'content-123',
        tenant_id: 'tenant-123',
        section: 'home',
      });
      const updateDto = { section: 'about' };

      repository.findOne.mockResolvedValue(existingContent as Content);
      repository.save.mockResolvedValue({
        ...existingContent,
        ...updateDto,
      } as Content);

      const result = await service.update(
        'content-123',
        'tenant-123',
        updateDto,
      );

      expect(result.section).toBe('about');
    });

    it('should update multiple fields', async () => {
      const existingContent = mockFactory.content({
        id: 'content-123',
        tenant_id: 'tenant-123',
        value: 'Old',
        language: 'zh-CN',
      });
      const updateDto = { value: 'New', language: 'en' };

      repository.findOne.mockResolvedValue(existingContent as Content);
      repository.save.mockResolvedValue({
        ...existingContent,
        ...updateDto,
      } as Content);

      const result = await service.update(
        'content-123',
        'tenant-123',
        updateDto,
      );

      expect(result.value).toBe('New');
      expect(result.language).toBe('en');
    });

    it('should throw NotFoundException if content not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent', 'tenant-123', { value: 'New' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should not update undefined fields', async () => {
      const existingContent = mockFactory.content({
        id: 'content-123',
        tenant_id: 'tenant-123',
        value: 'Original',
        language: 'zh-CN',
      });
      const updateDto = {};

      repository.findOne.mockResolvedValue(existingContent as Content);
      repository.save.mockResolvedValue(existingContent as Content);

      const result = await service.update(
        'content-123',
        'tenant-123',
        updateDto,
      );

      expect(result.value).toBe('Original');
      expect(result.language).toBe('zh-CN');
    });
  });

  describe('remove', () => {
    it('should remove content successfully', async () => {
      const mockContent = mockFactory.content({
        id: 'content-123',
        tenant_id: 'tenant-123',
      });
      repository.findOne.mockResolvedValue(mockContent as Content);
      repository.remove.mockResolvedValue(mockContent as Content);

      await service.remove('content-123', 'tenant-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'content-123', tenant_id: 'tenant-123' },
      });
      expect(repository.remove).toHaveBeenCalledWith(mockContent);
    });

    it('should throw NotFoundException if content not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('non-existent', 'tenant-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getByKey', () => {
    it('should return content by key', async () => {
      const mockContent = mockFactory.content({
        key: 'hero_title',
        tenant_id: 'tenant-123',
        language: 'zh-CN',
      });
      repository.findOne.mockResolvedValue(mockContent as Content);

      const result = await service.getByKey('hero_title', 'tenant-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { key: 'hero_title', tenant_id: 'tenant-123', language: 'zh-CN' },
      });
      expect(result).toEqual(mockContent);
    });

    it('should use custom language', async () => {
      const mockContent = mockFactory.content({
        key: 'hero_title',
        tenant_id: 'tenant-123',
        language: 'en',
      });
      repository.findOne.mockResolvedValue(mockContent as Content);

      await service.getByKey('hero_title', 'tenant-123', 'en');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { key: 'hero_title', tenant_id: 'tenant-123', language: 'en' },
      });
    });

    it('should return null if content not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.getByKey('non-existent', 'tenant-123');

      expect(result).toBeNull();
    });
  });
});
