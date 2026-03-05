import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { TenantsService } from './tenants.service';
import { Tenant, TenantStatus, TenantPlan } from './entities/tenant.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { createMockRepository, mockFactory } from '../../../test/test-utils';

describe('TenantsService', () => {
  let service: TenantsService;
  let repository: jest.Mocked<Repository<Tenant>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: createMockRepository<Tenant>(),
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    repository = module.get(getRepositoryToken(Tenant));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new tenant successfully', async () => {
      const createDto = {
        slug: 'new-tenant',
        name: 'New Tenant',
        description: 'A new tenant',
        plan: TenantPlan.BASIC,
      };

      const mockTenant = mockFactory.tenant({ ...createDto, id: 'new-id' });
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockTenant as Tenant);
      repository.save.mockResolvedValue(mockTenant as Tenant);

      const result = await service.create(createDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { slug: createDto.slug },
      });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockTenant);
      expect(result).toEqual(mockTenant);
    });

    it('should throw ConflictException if slug already exists', async () => {
      const createDto = {
        slug: 'existing-tenant',
        name: 'Existing Tenant',
      };

      const existingTenant = mockFactory.tenant({ slug: createDto.slug });
      repository.findOne.mockResolvedValue(existingTenant as Tenant);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { slug: createDto.slug },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated tenants', async () => {
      const query = {};
      const mockTenants = [
        mockFactory.tenant({ id: '1', name: 'Tenant 1' }),
        mockFactory.tenant({ id: '2', name: 'Tenant 2' }),
      ];

      repository.findAndCount.mockResolvedValue([
        mockTenants as Tenant[],
        mockTenants.length,
      ]);

      const result = await service.findAll(query);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {},
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({
        data: mockTenants,
        total: mockTenants.length,
      });
    });

    it('should filter by status', async () => {
      const query = { status: TenantStatus.ACTIVE };
      const mockTenants = [mockFactory.tenant({ status: TenantStatus.ACTIVE })];

      repository.findAndCount.mockResolvedValue([
        mockTenants as Tenant[],
        1,
      ]);

      await service.findAll(query);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { status: TenantStatus.ACTIVE },
        order: { createdAt: 'DESC' },
      });
    });

    it('should filter by plan', async () => {
      const query = { plan: TenantPlan.PRO };
      const mockTenants = [mockFactory.tenant({ plan: TenantPlan.PRO })];

      repository.findAndCount.mockResolvedValue([
        mockTenants as Tenant[],
        1,
      ]);

      await service.findAll(query);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { plan: TenantPlan.PRO },
        order: { createdAt: 'DESC' },
      });
    });

    it('should search by name', async () => {
      const query = { search: 'test' };
      const mockTenants = [mockFactory.tenant({ name: 'Test Tenant' })];

      repository.findAndCount.mockResolvedValue([
        mockTenants as Tenant[],
        1,
      ]);

      await service.findAll(query);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { name: Like('%test%') },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a tenant by id', async () => {
      const mockTenant = mockFactory.tenant({ id: 'tenant-123' });
      repository.findOne.mockResolvedValue(mockTenant as Tenant);

      const result = await service.findOne('tenant-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'tenant-123' },
      });
      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return tenant by slug', async () => {
      const mockTenant = mockFactory.tenant({
        slug: 'test-tenant',
        status: TenantStatus.ACTIVE,
      });
      repository.findOne.mockResolvedValue(mockTenant as Tenant);

      const result = await service.findBySlug('test-tenant');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { slug: 'test-tenant', status: TenantStatus.ACTIVE },
      });
      expect(result).toEqual(mockTenant);
    });

    it('should return null if tenant not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update tenant successfully', async () => {
      const existingTenant = mockFactory.tenant({
        id: 'tenant-123',
        slug: 'old-slug',
        name: 'Old Name',
      });
      const updateDto = { name: 'New Name' };
      const updatedTenant = { ...existingTenant, ...updateDto };

      repository.findOne.mockResolvedValueOnce(existingTenant as Tenant);
      repository.save.mockResolvedValue(updatedTenant as Tenant);

      const result = await service.update('tenant-123', updateDto);

      expect(result.name).toBe('New Name');
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when updating to existing slug', async () => {
      const existingTenant = mockFactory.tenant({
        id: 'tenant-123',
        slug: 'old-slug',
      });
      const updateDto = { slug: 'existing-slug' };
      const conflictingTenant = mockFactory.tenant({
        id: 'tenant-456',
        slug: 'existing-slug',
      });

      repository.findOne
        .mockResolvedValueOnce(existingTenant as Tenant)
        .mockResolvedValueOnce(conflictingTenant as Tenant);

      await expect(service.update('tenant-123', updateDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should allow keeping the same slug', async () => {
      const existingTenant = mockFactory.tenant({
        id: 'tenant-123',
        slug: 'same-slug',
      });
      const updateDto = { slug: 'same-slug', name: 'New Name' };
      const updatedTenant = { ...existingTenant, ...updateDto };

      repository.findOne.mockResolvedValueOnce(existingTenant as Tenant);
      repository.save.mockResolvedValue(updatedTenant as Tenant);

      const result = await service.update('tenant-123', updateDto);

      expect(result.name).toBe('New Name');
    });
  });

  describe('remove', () => {
    it('should remove tenant successfully', async () => {
      const mockTenant = mockFactory.tenant({ id: 'tenant-123' });
      repository.findOne.mockResolvedValue(mockTenant as Tenant);
      repository.remove.mockResolvedValue(mockTenant as Tenant);

      await service.remove('tenant-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'tenant-123' },
      });
      expect(repository.remove).toHaveBeenCalledWith(mockTenant);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update tenant status', async () => {
      const mockTenant = mockFactory.tenant({
        id: 'tenant-123',
        status: TenantStatus.ACTIVE,
      });
      const updatedTenant = {
        ...mockTenant,
        status: TenantStatus.SUSPENDED,
      };

      repository.findOne.mockResolvedValue(mockTenant as Tenant);
      repository.save.mockResolvedValue(updatedTenant as Tenant);

      const result = await service.updateStatus(
        'tenant-123',
        TenantStatus.SUSPENDED,
      );

      expect(result.status).toBe(TenantStatus.SUSPENDED);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: TenantStatus.SUSPENDED }),
      );
    });
  });

  describe('getTenantStats', () => {
    it('should return tenant statistics', async () => {
      repository.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80) // active
        .mockResolvedValueOnce(15) // inactive
        .mockResolvedValueOnce(5); // suspended

      const result = await service.getTenantStats();

      expect(repository.count).toHaveBeenCalledTimes(4);
      expect(result).toEqual({
        total: 100,
        active: 80,
        inactive: 15,
        suspended: 5,
      });
    });
  });
});
