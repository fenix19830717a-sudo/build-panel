import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsArray, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BackupType, JobStatus, RetentionUnit } from '../entities/backup-job.entity';

export class CreateBackupJobDto {
  @ApiProperty({ description: 'Job name', example: 'Daily Full Backup' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Database ID' })
  @IsUUID()
  databaseId: string;

  @ApiProperty({ description: 'Backup type', enum: BackupType, default: BackupType.FULL })
  @IsEnum(BackupType)
  backupType: BackupType;

  @ApiProperty({ description: 'Cron expression', example: '0 2 * * *' })
  @IsString()
  cronExpression: string;

  @ApiProperty({ description: 'Retention value', default: 7 })
  @IsNumber()
  @Min(1)
  retentionValue: number;

  @ApiProperty({ description: 'Retention unit', enum: RetentionUnit, default: RetentionUnit.DAYS })
  @IsEnum(RetentionUnit)
  retentionUnit: RetentionUnit;

  @ApiProperty({ description: 'Encrypt backup', default: true })
  @IsOptional()
  @IsBoolean()
  encryptBackup?: boolean;

  @ApiProperty({ description: 'Compress backup', default: true })
  @IsOptional()
  @IsBoolean()
  compressBackup?: boolean;

  @ApiProperty({ description: 'Compression level', default: 6, minimum: 1, maximum: 9 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(9)
  compressionLevel?: number;

  @ApiProperty({ description: 'Include tables', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  includeTables?: string[];

  @ApiProperty({ description: 'Exclude tables', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  excludeTables?: string[];

  @ApiProperty({ description: 'Verify backup', default: true })
  @IsOptional()
  @IsBoolean()
  verifyBackup?: boolean;

  @ApiProperty({ description: 'Notify on success', default: true })
  @IsOptional()
  @IsBoolean()
  notifyOnSuccess?: boolean;

  @ApiProperty({ description: 'Notify on failure', default: true })
  @IsOptional()
  @IsBoolean()
  notifyOnFailure?: boolean;

  @ApiProperty({ description: 'Storage destinations', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  storageDestinations?: string[];
}

export class UpdateBackupJobDto {
  @ApiProperty({ description: 'Job name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Backup type', enum: BackupType, required: false })
  @IsOptional()
  @IsEnum(BackupType)
  backupType?: BackupType;

  @ApiProperty({ description: 'Cron expression', required: false })
  @IsOptional()
  @IsString()
  cronExpression?: string;

  @ApiProperty({ description: 'Job status', enum: JobStatus, required: false })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiProperty({ description: 'Retention value', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  retentionValue?: number;

  @ApiProperty({ description: 'Retention unit', enum: RetentionUnit, required: false })
  @IsOptional()
  @IsEnum(RetentionUnit)
  retentionUnit?: RetentionUnit;

  @ApiProperty({ description: 'Encrypt backup', required: false })
  @IsOptional()
  @IsBoolean()
  encryptBackup?: boolean;

  @ApiProperty({ description: 'Compress backup', required: false })
  @IsOptional()
  @IsBoolean()
  compressBackup?: boolean;
}

export class CreateBackupDto {
  @ApiProperty({ description: 'Database ID' })
  @IsUUID()
  databaseId: string;

  @ApiProperty({ description: 'Backup type', enum: BackupType, default: BackupType.FULL })
  @IsOptional()
  @IsEnum(BackupType)
  backupType?: BackupType;

  @ApiProperty({ description: 'Encrypt backup', default: true })
  @IsOptional()
  @IsBoolean()
  encryptBackup?: boolean;

  @ApiProperty({ description: 'Compress backup', default: true })
  @IsOptional()
  @IsBoolean()
  compressBackup?: boolean;
}

export class BackupResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  databaseId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  storageType: string;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty()
  completedAt: Date;

  @ApiProperty()
  createdAt: Date;
}
