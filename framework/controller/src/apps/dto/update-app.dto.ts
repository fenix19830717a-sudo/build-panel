import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { AppStatus } from '../entities/app.entity';

export class UpdateAppDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsObject()
  configSchema?: Record<string, any>;

  @IsOptional()
  @IsObject()
  defaultConfig?: Record<string, any>;

  @IsOptional()
  @IsEnum(AppStatus)
  status?: AppStatus;
}
