import { IsString, IsOptional, IsEnum, IsObject, IsArray, IsInt, IsBoolean, IsUUID } from 'class-validator';
import { ParserType } from '../entities/parser.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateParserDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ParserType })
  @IsEnum(ParserType)
  type: ParserType;

  @ApiProperty()
  @IsString()
  pattern: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  fields?: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    required?: boolean;
  }>;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  sourceId?: string;

  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @IsOptional()
  priority?: number;
}

export class UpdateParserDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  pattern?: string;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
