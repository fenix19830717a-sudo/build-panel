import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThemesService } from './themes.service';
import { Theme, ThemeStatus } from './entities/theme.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { createMockRepository, mockFactory } from '../../../test/test-utils';

describe('ThemesService', () => {
  let service: ThemesService;
  let repository: jest.Mocked<Repository<Theme>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThemesService,
        {
          provide: getRepositoryToken(Theme),
          useValue: createMockRepository<Theme>(),
        },
      ],
    }).compile();

    service = module.get<ThemesService>(ThemesService);
    repository = module.get(getRepositoryToken(Theme));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new theme successfully', async () => {
      const createDto = {
        name: 'New Theme',
        slug: 'new-theme',
        description: 'A new theme',
        config: { colors: { primary: '#000' } },
        isDefault: false,
      };

      const mockTheme = mockFactory.theme({ ...createDto, id: 'new-id' });
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockTheme as Theme);
      repository.save.mockResolvedValue(mockTheme as Theme);

      const result = await service.create(createDto, 'tenant-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { slug: createDto.slug, tenantId: 'tenant-123' },
      });
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        tenantId: 'tenant-123',
      });
      expect(result).toEqual(mockTheme);
    });

    it('should create theme without tenantId (system theme)', async () => {
      const createDto = {
        name: 'System Theme',
        slug: 'system-theme',
        config: {},
      };

      const mockTheme = mockFactory.theme({
        ...createDto,
        id: 'system-id',
        tenantId: null,
      });
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockTheme as Theme);
      repository.save.mockResolvedValue(mockTheme as Theme);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        tenantId: undefined,
      });
    });

    it('should set default theme and unset others', async () => {
      const createDto = {
        name: 'Default Theme',
        slug: 'default-theme',
        config: {},
        isDefault: true,
      };

      const mockTheme = mockFactory.theme({
        ...createDto,
        id: 'default-id',
        isDefault: true,
      });
      repository.findOne.mockResolvedValue(null);
      repository.update.mockResolvedValue({ affected: 1 } as any);
      repository.create.mockReturnValue(mockTheme as Theme);
      repository.save.mockResolvedValue(mockTheme as Theme);

      await service.create(createDto, 'tenant-123');

      expect(repository.update).toHaveBeenCalledWith(
        { tenantId: 'tenant-123', isDefault: true },
        { isDefault: false },
      );
    });

    it('should throw ConflictException if slug exists for tenant', async () => {
      const createDto = {
        name: 'Existing Theme',
        slug: 'existing-theme',
        config: {},
      };

      const existingTheme = mockFactory.theme({ slug: createDto.slug });
      repository.findOne.mockResolvedValue(existingTheme as Theme);

      await expect(service.create(createDto, 'tenant-123')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all themes for a tenant', async () => {
      const mockThemes = [
        mockFactory.theme({ id: '1', name: 'Theme 1' }),
        mockFactory.theme({ id: '2', name: 'Theme 2' }),
      ];

      repository.find.mockResolvedValue(mockThemes as Theme[]);

      const result = await service.findAll('tenant-123');

      expect(repository.find).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-123' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockThemes);
    });

    it('should return all themes without tenant filter', async () => {
      const mockThemes = [mockFactory.theme({ id: '1' })];
      repository.find.mockResolvedValue(mockThemes as Theme[]);

      await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        where: { tenantId: undefined },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findDefaults', () => {
    it('should return all default themes', async () => {
      const mockThemes = [
        mockFactory.theme({ id: '1', isDefault: true, status: ThemeStatus.ACTIVE }),
        mockFactory.theme({ id: '2', isDefault: true, status: ThemeStatus.ACTIVE }),
      ];

      repository.find.mockResolvedValue(mockThemes as Theme[]);

      const result = await service.findDefaults();

      expect(repository.find).toHaveBeenCalledWith({
        where: { isDefault: true, status: ThemeStatus.ACTIVE },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return a theme by id', async () => {
      const mockTheme = mockFactory.theme({ id: 'theme-123' });
      repository.findOne.mockResolvedValue(mockTheme as Theme);

      const result = await service.findOne('theme-123', 'tenant-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'theme-123', tenantId: 'tenant-123' },
      });
      expect(result).toEqual(mockTheme);
    });

    it('should throw NotFoundException if theme not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent', 'tenant-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return theme by slug', async () => {
      const mockTheme = mockFactory.theme({
        slug: 'test-theme',
        status: ThemeStatus.ACTIVE,
      });
      repository.findOne.mockResolvedValue(mockTheme as Theme);

      const result = await service.findBySlug('test-theme', 'tenant-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { slug: 'test-theme', tenantId: 'tenant-123', status: ThemeStatus.ACTIVE },
      });
      expect(result).toEqual(mockTheme);
    });

    it('should return null if theme not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getActiveTheme', () => {
    it('should return tenant default theme', async () => {
      const mockTheme = mockFactory.theme({
        id: 'tenant-theme',
        tenantId: 'tenant-123',
        isDefault: true,
        status: ThemeStatus.ACTIVE,
      });
      repository.findOne.mockResolvedValue(mockTheme as Theme);

      const result = await service.getActiveTheme('tenant-123');

      expect(result).toEqual(mockTheme);
    });

    it('should fallback to system default if no tenant theme', async () => {
      const mockTheme = mockFactory.theme({
        id: 'system-theme',
        tenantId: null,
        isDefault: true,
        status: ThemeStatus.ACTIVE,
      });
      repository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockTheme as Theme);

      const result = await service.getActiveTheme('tenant-123');

      expect(repository.findOne).toHaveBeenNthCalledWith(2, {
        where: { isDefault: true, status: ThemeStatus.ACTIVE, tenantId: null },
      });
      expect(result).toEqual(mockTheme);
    });

    it('should return system default if no tenantId provided', async () => {
      const mockTheme = mockFactory.theme({
        id: 'system-theme',
        tenantId: null,
        isDefault: true,
      });
      repository.findOne.mockResolvedValue(mockTheme as Theme);

      const result = await service.getActiveTheme();

      expect(result).toEqual(mockTheme);
    });
  });

  describe('update', () => {
    it('should update theme successfully', async () => {
      const existingTheme = mockFactory.theme({
        id: 'theme-123',
        name: 'Old Name',
      });
      const updateDto = { name: 'New Name' };
      const updatedTheme = { ...existingTheme, ...updateDto };

      repository.findOne.mockResolvedValueOnce(existingTheme as Theme);
      repository.save.mockResolvedValue(updatedTheme as Theme);

      const result = await service.update('theme-123', updateDto, 'tenant-123');

      expect(result.name).toBe('New Name');
    });

    it('should throw ConflictException when updating to existing slug', async () => {
      const existingTheme = mockFactory.theme({
        id: 'theme-123',
        slug: 'old-slug',
      });
      const updateDto = { slug: 'existing-slug' };
      const conflictingTheme = mockFactory.theme({
        id: 'theme-456',
        slug: 'existing-slug',
      });

      repository.findOne
        .mockResolvedValueOnce(existingTheme as Theme)
        .mockResolvedValueOnce(conflictingTheme as Theme);

      await expect(
        service.update('theme-123', updateDto, 'tenant-123'),
      ).rejects.toThrow(ConflictException);
    });

    it('should update default status and unset others', async () => {
      const existingTheme = mockFactory.theme({
        id: 'theme-123',
        isDefault: false,
      });
      const updateDto = { isDefault: true };

      repository.findOne.mockResolvedValue(existingTheme as Theme);
      repository.update.mockResolvedValue({ affected: 1 } as any);
      repository.save.mockResolvedValue({ ...existingTheme, isDefault: true } as Theme);

      await service.update('theme-123', updateDto, 'tenant-123');

      expect(repository.update).toHaveBeenCalledWith(
        { tenantId: 'tenant-123', isDefault: true },
        { isDefault: false },
      );
    });
  });

  describe('remove', () => {
    it('should remove theme successfully', async () => {
      const mockTheme = mockFactory.theme({ id: 'theme-123' });
      repository.findOne.mockResolvedValue(mockTheme as Theme);
      repository.remove.mockResolvedValue(mockTheme as Theme);

      await service.remove('theme-123', 'tenant-123');

      expect(repository.remove).toHaveBeenCalledWith(mockTheme);
    });

    it('should throw NotFoundException if theme not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent', 'tenant-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('applyTheme', () => {
    it('should apply theme as default for tenant', async () => {
      const mockTheme = mockFactory.theme({
        id: 'theme-123',
        tenantId: 'tenant-123',
        isDefault: false,
        status: ThemeStatus.DRAFT,
      });
      const updatedTheme = {
        ...mockTheme,
        isDefault: true,
        status: ThemeStatus.ACTIVE,
      };

      repository.update.mockResolvedValue({ affected: 1 } as any);
      repository.findOne.mockResolvedValue(mockTheme as Theme);
      repository.save.mockResolvedValue(updatedTheme as Theme);

      const result = await service.applyTheme('theme-123', 'tenant-123');

      expect(repository.update).toHaveBeenCalledWith(
        { tenantId: 'tenant-123', isDefault: true },
        { isDefault: false },
      );
      expect(result.isDefault).toBe(true);
      expect(result.status).toBe(ThemeStatus.ACTIVE);
    });
  });

  describe('generateCssVariables', () => {
    it('should generate CSS variables from config', () => {
      const config = {
        colors: {
          primary: '#000000',
          secondary: '#ffffff',
        },
        typography: {
          fontFamily: {
            heading: 'Arial',
            body: 'Helvetica',
          },
          fontSize: {
            base: '16px',
            lg: '18px',
          },
        },
        spacing: {
          sm: '8px',
          md: '16px',
        },
        layout: {
          maxWidth: '1200px',
          borderRadius: '8px',
        },
      };

      const result = service.generateCssVariables(config);

      expect(result).toContain('--color-primary: #000000;');
      expect(result).toContain('--color-secondary: #ffffff;');
      expect(result).toContain('--font-heading: Arial;');
      expect(result).toContain('--font-size-base: 16px;');
      expect(result).toContain('--spacing-sm: 8px;');
      expect(result).toContain('--layout-maxWidth: 1200px;');
    });

    it('should return empty root for empty config', () => {
      const result = service.generateCssVariables({});

      expect(result).toBe(':root {\n}');
    });

    it('should handle partial config', () => {
      const config = {
        colors: {
          primary: '#000',
        },
      };

      const result = service.generateCssVariables(config);

      expect(result).toContain('--color-primary: #000;');
      expect(result).not.toContain('typography');
    });
  });
});
