import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const slug = this.generateSlug(createTagDto.name);
    const existing = await this.tagRepository.findOne({ where: { slug } });
    
    if (existing) {
      return existing;
    }

    const tag = this.tagRepository.create({
      ...createTagDto,
      slug,
    });

    return this.tagRepository.save(tag);
  }

  async createMany(names: string[]): Promise<Tag[]> {
    const tags: Tag[] = [];
    for (const name of names) {
      const tag = await this.create({ name });
      tags.push(tag);
    }
    return tags;
  }

  async findAll(): Promise<Tag[]> {
    return this.tagRepository.find({
      order: { articleCount: 'DESC', name: 'ASC' },
    });
  }

  async findPopular(limit: number = 20): Promise<Tag[]> {
    return this.tagRepository.find({
      order: { articleCount: 'DESC' },
      take: limit,
    });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id },
      relations: ['articles'],
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }

    return tag;
  }

  async findBySlug(slug: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { slug },
      relations: ['articles'],
    });

    if (!tag) {
      throw new NotFoundException(`Tag with slug "${slug}" not found`);
    }

    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);

    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      updateTagDto.slug = this.generateSlug(updateTagDto.name);
    }

    Object.assign(tag, updateTagDto);
    return this.tagRepository.save(tag);
  }

  async remove(id: string): Promise<void> {
    const tag = await this.findOne(id);
    await this.tagRepository.softRemove(tag);
  }

  async getTagCloud(): Promise<{ name: string; slug: string; count: number }[]> {
    const tags = await this.tagRepository.find({
      order: { articleCount: 'DESC' },
    });

    return tags.map(tag => ({
      name: tag.name,
      slug: tag.slug,
      count: tag.articleCount,
    }));
  }
}
