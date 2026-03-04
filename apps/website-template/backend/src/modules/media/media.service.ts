import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, MediaType } from '../../database/entities/media.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  async findAll(tenantId: string, folder?: string): Promise<Media[]> {
    const where: any = { tenant_id: tenantId };
    if (folder) {
      where.folder = folder;
    }

    return this.mediaRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  async upload(
    file: Express.Multer.File,
    tenantId: string,
    folder?: string,
  ): Promise<Media> {
    // Determine media type
    let type = MediaType.OTHER;
    if (file.mimetype.startsWith('image/')) {
      type = MediaType.IMAGE;
    } else if (file.mimetype.startsWith('video/')) {
      type = MediaType.VIDEO;
    } else if (file.mimetype.startsWith('audio/')) {
      type = MediaType.AUDIO;
    } else if (
      file.mimetype.includes('pdf') ||
      file.mimetype.includes('document') ||
      file.mimetype.includes('text')
    ) {
      type = MediaType.DOCUMENT;
    }

    // In production, upload to MinIO/S3
    // For now, store local path
    const url = `/uploads/${tenantId}/${folder || 'general'}/${file.filename}`;

    const media = this.mediaRepository.create({
      tenant_id: tenantId,
      filename: file.filename,
      original_name: file.originalname,
      mime_type: file.mimetype,
      type,
      size: file.size,
      url,
      folder: folder || 'general',
    });

    return this.mediaRepository.save(media);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const media = await this.mediaRepository.findOne({
      where: { id, tenant_id: tenantId },
    });
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    await this.mediaRepository.remove(media);
  }
}
