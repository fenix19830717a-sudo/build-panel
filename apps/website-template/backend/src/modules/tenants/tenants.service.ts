import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantStatus } from '../../database/entities/tenant.entity';
import { CreateTenantDto, UpdateTenantDto, DeployTenantDto } from './dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      status: TenantStatus.ACTIVE,
    });
    return this.tenantRepository.save(tenant);
  }

  async findAll(options: { page: number; limit: number; status?: string }) {
    const { page, limit, status } = options;
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.tenantRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ 
      where: { subdomain, status: TenantStatus.ACTIVE } 
    });
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);
    Object.assign(tenant, updateTenantDto);
    return this.tenantRepository.save(tenant);
  }

  async deploy(id: string, deployDto: DeployTenantDto) {
    const tenant = await this.findOne(id);
    
    // Update deploy config
    tenant.deploy_config = {
      ...tenant.deploy_config,
      ...deployDto,
    };
    tenant.status = TenantStatus.DEPLOYING;
    
    await this.tenantRepository.save(tenant);

    // TODO: Trigger actual deployment logic
    // This would typically:
    // 1. Build frontend with tenant-specific config
    // 2. Configure nginx
    // 3. Setup SSL certificates
    // 4. Update DNS if needed
    
    return {
      success: true,
      message: 'Deployment initiated',
      tenant_id: id,
      deploy_config: tenant.deploy_config,
    };
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantRepository.remove(tenant);
  }
}
