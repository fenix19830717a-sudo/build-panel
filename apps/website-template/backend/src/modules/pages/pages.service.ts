import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page, PageStatus } from '../../database/entities/page.entity';
import { CreatePageDto, UpdatePageDto } from './dto';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private pageRepository: Repository<Page>,
  ) {}

  async create(createPageDto: CreatePageDto): Promise<Page> {
    // If this page is set as homepage, unset any existing homepage
    if (createPageDto.is_homepage) {
      await this.pageRepository.update(
        { tenant_id: createPageDto.tenantId, is_homepage: true },
        { is_homepage: false },
      );
    }

    const page = this.pageRepository.create({
      tenant_id: createPageDto.tenantId,
      title: createPageDto.title,
      slug: createPageDto.slug,
      content: createPageDto.content,
      blocks: createPageDto.blocks || [],
      status: createPageDto.status || PageStatus.DRAFT,
      is_homepage: createPageDto.is_homepage || false,
      show_in_nav: createPageDto.show_in_nav ?? true,
      nav_label: createPageDto.nav_label || createPageDto.title,
      nav_order: createPageDto.nav_order || 0,
      seo: createPageDto.seo,
      custom_css: createPageDto.custom_css,
      custom_js: createPageDto.custom_js,
    });
    return this.pageRepository.save(page);
  }

  async findAll(tenantId: string, status?: string): Promise<Page[]> {
    const where: any = { tenant_id: tenantId };
    if (status) {
      where.status = status;
    }

    return this.pageRepository.find({
      where,
      order: { nav_order: 'ASC', created_at: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Page> {
    const page = await this.pageRepository.findOne({
      where: { id, tenant_id: tenantId },
    });
    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }
    return page;
  }

  async findBySlug(slug: string, tenantId: string): Promise<Page> {
    const page = await this.pageRepository.findOne({
      where: { slug, tenant_id: tenantId },
    });
    if (!page) {
      throw new NotFoundException(`Page with slug ${slug} not found`);
    }
    return page;
  }

  async getHomepage(tenantId: string): Promise<Page | null> {
    return this.pageRepository.findOne({
      where: { tenant_id: tenantId, is_homepage: true },
    });
  }

  async update(
    id: string,
    tenantId: string,
    updatePageDto: UpdatePageDto,
  ): Promise<Page> {
    const page = await this.findOne(id, tenantId);
    Object.assign(page, updatePageDto);
    return this.pageRepository.save(page);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const page = await this.findOne(id, tenantId);
    await this.pageRepository.remove(page);
  }
}
