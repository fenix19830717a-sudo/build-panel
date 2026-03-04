import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Media, MediaType } from './entities/media.entity';
import { CreateMediaDto, UpdateMediaDto, MediaQueryDto } from './dto/media.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  async create(createMediaDto: CreateMediaDto): Promise<Media> {
    const media = this.mediaRepository.create(createMediaDto);
    return this.mediaRepository.save(media);
  }

  async findAll(query: MediaQueryDto): Promise<{ items: Media[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, type, search } = query;

    const where: any = {};
    
    if (type) where.type = type;
    if (search) {
      where.originalName = Like(`%${search}%`);
    }

    const findOptions: FindManyOptions<Media> = {
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [items, total] = await this.mediaRepository.findAndCount(findOptions);

    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID "${id}" not found`);
    }

    return media;
  }

  async update(id: string, updateMediaDto: UpdateMediaDto): Promise<Media> {
    const media = await this.findOne(id);
    Object.assign(media, updateMediaDto);
    return this.mediaRepository.save(media);
  }

  async remove(id: string): Promise<void> {
    const media = await this.findOne(id);
    await this.mediaRepository.softRemove(media);
  }

  async getByType(type: MediaType, limit: number = 20): Promise<Media[]> {
    return this.mediaRepository.find({
      where: { type },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  determineMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return MediaType.IMAGE;
    if (mimeType.startsWith('video/')) return MediaType.VIDEO;
    if (mimeType.startsWith('audio/')) return MediaType.AUDIO;
    if (
      mimeType.includes('pdf') ||
      mimeType.includes('word') ||
      mimeType.includes('excel') ||
      mimeType.includes('text')
    ) {
      return MediaType.DOCUMENT;
    }
    return MediaType.OTHER;
  }
}
