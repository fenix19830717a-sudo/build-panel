import { PartialType } from '@nestjs/swagger';

export class CreateTagDto {
  name: string;
  description?: string;
}

export class UpdateTagDto extends PartialType(CreateTagDto) {}
