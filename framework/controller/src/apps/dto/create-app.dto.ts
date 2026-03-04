import { IsString, IsOptional, MinLength, MaxLength, IsJSON, IsObject } from 'class-validator';

export class CreateAppDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  version: string;

  @IsString()
  @MinLength(1)
  image: string;

  @IsOptional()
  @IsObject()
  configSchema?: Record<string, any>;

  @IsOptional()
  @IsObject()
  defaultConfig?: Record<string, any>;
}
