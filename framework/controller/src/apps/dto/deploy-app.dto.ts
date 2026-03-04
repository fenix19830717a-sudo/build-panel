import { IsString, IsOptional, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PortMappingDto {
  @IsString()
  host: number;

  @IsString()
  container: number;
}

export class DeployAppDto {
  @IsString()
  serverId: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PortMappingDto)
  portMappings?: Array<{ host: number; container: number }>;
}
