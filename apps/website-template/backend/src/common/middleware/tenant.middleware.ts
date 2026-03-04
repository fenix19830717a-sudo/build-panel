import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../database/entities/tenant.entity';

export interface TenantRequest extends Request {
  tenantId?: string;
  tenant?: Tenant;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async use(req: TenantRequest, res: Response, next: NextFunction) {
    // 1. Try to get tenant from X-Tenant-ID header
    const tenantId = req.headers['x-tenant-id'] as string;
    
    if (tenantId) {
      const tenant = await this.tenantRepository.findOne({
        where: { id: tenantId, status: 'active' },
      });
      if (tenant) {
        req.tenantId = tenant.id;
        req.tenant = tenant;
        return next();
      }
    }

    // 2. Try to get tenant from subdomain
    const host = req.headers.host || '';
    const subdomain = host.split('.')[0];
    
    if (subdomain && subdomain !== 'www' && subdomain !== 'api' && subdomain !== 'admin') {
      const tenant = await this.tenantRepository.findOne({
        where: { subdomain, status: 'active' },
      });
      if (tenant) {
        req.tenantId = tenant.id;
        req.tenant = tenant;
        return next();
      }
    }

    // 3. Try to get tenant from custom domain
    if (host) {
      const tenant = await this.tenantRepository.findOne({
        where: { domain: host, status: 'active' },
      });
      if (tenant) {
        req.tenantId = tenant.id;
        req.tenant = tenant;
        return next();
      }
    }

    // No tenant found - allow public routes
    next();
  }
}
