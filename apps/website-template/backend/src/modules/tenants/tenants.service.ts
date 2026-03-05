import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Tenant, TenantStatus } from './entities/tenant.entity';
import { CreateTenantDto, UpdateTenantDto, TenantQueryDto } from './dto/tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // 检查slug是否已存在
    const existing = await this.tenantRepository.findOne({
      where: { slug: createTenantDto.slug },
    });
    
    if (existing) {
      throw new ConflictException(`Tenant with slug '${createTenantDto.slug}' already exists`);
    }

    const tenant = this.tenantRepository.create(createTenantDto);
    return this.tenantRepository.save(tenant);
  }

  async findAll(query: TenantQueryDto): Promise<{ data: Tenant[]; total: number }> {
    const { search, status, plan } = query;
    
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (plan) {
      where.plan = plan;
    }
    
    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [data, total] = await this.tenantRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { slug, status: TenantStatus.ACTIVE } });
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);
    
    // 如果更新slug，检查是否冲突
    if (updateTenantDto.slug && updateTenantDto.slug !== tenant.slug) {
      const existing = await this.tenantRepository.findOne({
        where: { slug: updateTenantDto.slug },
      });
      if (existing) {
        throw new ConflictException(`Tenant with slug '${updateTenantDto.slug}' already exists`);
      }
    }
    
    Object.assign(tenant, updateTenantDto);
    return this.tenantRepository.save(tenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantRepository.remove(tenant);
  }

  async updateStatus(id: string, status: TenantStatus): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.status = status;
    return this.tenantRepository.save(tenant);
  }

  async getTenantStats() {
    const [total, active, inactive, suspended] = await Promise.all([
      this.tenantRepository.count(),
      this.tenantRepository.count({ where: { status: TenantStatus.ACTIVE } }),
      this.tenantRepository.count({ where: { status: TenantStatus.INACTIVE } }),
      this.tenantRepository.count({ where: { status: TenantStatus.SUSPENDED } }),
    ]);

    return { total, active, inactive, suspended };
  }
}
