import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from '../../database/entities/content.entity';
import { CreateContentDto, UpdateContentDto, GetContentQueryDto } from './dto';

@Injectable()
export class ContentsService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
  ) {}

  async create(createContentDto: CreateContentDto): Promise<Content> {
    const content = this.contentRepository.create({
      tenant_id: createContentDto.tenantId,
      key: createContentDto.key,
      value: createContentDto.value,
      language: createContentDto.language || 'zh-CN',
      section: createContentDto.section,
    });
    return this.contentRepository.save(content);
  }

  async findAll(query: GetContentQueryDto): Promise<Content[]> {
    const { tenantId, key, language, section } = query;
    
    const where: any = { tenant_id: tenantId };
    
    if (key) {
      where.key = key;
    }
    if (language) {
      where.language = language;
    }
    if (section) {
      where.section = section;
    }

    return this.contentRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Content> {
    const content = await this.contentRepository.findOne({
      where: { id, tenant_id: tenantId },
    });
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return content;
  }

  async update(
    id: string,
    tenantId: string,
    updateContentDto: UpdateContentDto,
  ): Promise<Content> {
    const content = await this.findOne(id, tenantId);
    
    if (updateContentDto.value !== undefined) {
      content.value = updateContentDto.value;
    }
    if (updateContentDto.language) {
      content.language = updateContentDto.language;
    }
    if (updateContentDto.section) {
      content.section = updateContentDto.section;
    }
    
    return this.contentRepository.save(content);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const content = await this.findOne(id, tenantId);
    await this.contentRepository.remove(content);
  }

  async getByKey(key: string, tenantId: string, language = 'zh-CN'): Promise<Content | null> {
    return this.contentRepository.findOne({
      where: { key, tenant_id: tenantId, language },
    });
  }
}
