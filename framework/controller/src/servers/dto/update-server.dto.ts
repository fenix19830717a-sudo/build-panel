import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ServerStatus } from '../entities/server.entity';

export class UpdateServerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  host?: string;

  @IsOptional()
  @IsNumber()
  port?: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  sshKey?: string;

  @IsOptional()
  @IsEnum(ServerStatus)
  status?: ServerStatus;

  @IsOptional()
  metadata?: Record<string, any>;
}
