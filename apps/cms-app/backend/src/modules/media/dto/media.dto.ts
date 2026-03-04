import { PartialType } from '@nestjs/swagger';

export class CreateMediaDto {
  originalName: string;
  fileName: string;
  url: string;
  thumbnailUrl?: string;
  type: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  description?: string;
}

export class UpdateMediaDto extends PartialType(CreateMediaDto) {}

export class MediaQueryDto {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
}
