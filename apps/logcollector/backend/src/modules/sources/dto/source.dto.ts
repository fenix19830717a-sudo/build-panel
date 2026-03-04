import { IsString, IsOptional, IsEnum, IsObject, IsInt, IsPort } from 'class-validator';
import { SourceType, SourceStatus } from '../entities/source.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSourceDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: SourceType })
  @IsEnum(SourceType)
  type: SourceType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  host?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  port?: number;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}

export class UpdateSourceDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false, enum: SourceStatus })
  @IsEnum(SourceStatus)
  @IsOptional()
  status?: SourceStatus;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}
