import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsArray, Min, Max, IsJSON } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DatabaseType, ConnectionStatus } from '../entities/database-config.entity';

export class CreateDatabaseDto {
  @ApiProperty({ description: 'Database name', example: 'Production DB' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Database type', enum: DatabaseType, example: DatabaseType.POSTGRESQL })
  @IsEnum(DatabaseType)
  type: DatabaseType;

  @ApiProperty({ description: 'Host address', example: 'localhost' })
  @IsString()
  host: string;

  @ApiProperty({ description: 'Port number', example: 5432 })
  @IsNumber()
  @Min(1)
  @Max(65535)
  port: number;

  @ApiProperty({ description: 'Database name', example: 'mydb' })
  @IsString()
  database: string;

  @ApiProperty({ description: 'Username', example: 'postgres' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Password', example: 'secretpassword' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'SSL CA certificate', required: false })
  @IsOptional()
  @IsString()
  sslCa?: string;

  @ApiProperty({ description: 'SSL certificate', required: false })
  @IsOptional()
  @IsString()
  sslCert?: string;

  @ApiProperty({ description: 'SSL key', required: false })
  @IsOptional()
  @IsString()
  sslKey?: string;

  @ApiProperty({ description: 'Enable SSL', default: false })
  @IsOptional()
  @IsBoolean()
  sslEnabled?: boolean;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Metadata', required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateDatabaseDto {
  @ApiProperty({ description: 'Database name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Host address', required: false })
  @IsOptional()
  @IsString()
  host?: string;

  @ApiProperty({ description: 'Port number', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  port?: number;

  @ApiProperty({ description: 'Database name', required: false })
  @IsOptional()
  @IsString()
  database?: string;

  @ApiProperty({ description: 'Username', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: 'Password', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ description: 'SSL CA certificate', required: false })
  @IsOptional()
  @IsString()
  sslCa?: string;

  @ApiProperty({ description: 'SSL certificate', required: false })
  @IsOptional()
  @IsString()
  sslCert?: string;

  @ApiProperty({ description: 'SSL key', required: false })
  @IsOptional()
  @IsString()
  sslKey?: string;

  @ApiProperty({ description: 'Enable SSL', required: false })
  @IsOptional()
  @IsBoolean()
  sslEnabled?: boolean;

  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Metadata', required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class TestConnectionDto {
  @ApiProperty({ description: 'Database type', enum: DatabaseType })
  @IsEnum(DatabaseType)
  type: DatabaseType;

  @ApiProperty({ description: 'Host address' })
  @IsString()
  host: string;

  @ApiProperty({ description: 'Port number' })
  @IsNumber()
  port: number;

  @ApiProperty({ description: 'Database name' })
  @IsString()
  database: string;

  @ApiProperty({ description: 'Username' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Password' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'SSL enabled', required: false })
  @IsOptional()
  @IsBoolean()
  sslEnabled?: boolean;
}

export class DatabaseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: DatabaseType })
  type: DatabaseType;

  @ApiProperty()
  host: string;

  @ApiProperty()
  port: number;

  @ApiProperty()
  database: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ enum: ConnectionStatus })
  connectionStatus: ConnectionStatus;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
