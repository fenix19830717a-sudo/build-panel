import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { BackupService } from './backup.service';
import { CreateBackupDto, CreateBackupJobDto, UpdateBackupJobDto, BackupResponseDto } from '../common/dto/backup.dto';

@ApiTags('backups')
@ApiBearerAuth()
@Controller('backups')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  // Job endpoints
  @Get('jobs')
  @ApiOperation({ summary: 'Get all backup jobs' })
  @ApiResponse({ status: 200, description: 'List of backup jobs' })
  async findAllJobs() {
    return this.backupService.findAllJobs();
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get backup job by ID' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  async findJobById(@Param('id') id: string) {
    return this.backupService.findJobById(id);
  }

  @Post('jobs')
  @ApiOperation({ summary: 'Create backup job' })
  @ApiResponse({ status: 201, description: 'Backup job created' })
  async createJob(@Body() createDto: CreateBackupJobDto) {
    return this.backupService.createJob(createDto);
  }

  @Put('jobs/:id')
  @ApiOperation({ summary: 'Update backup job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  async updateJob(@Param('id') id: string, @Body() updateDto: UpdateBackupJobDto) {
    return this.backupService.updateJob(id, updateDto);
  }

  @Delete('jobs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete backup job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  async deleteJob(@Param('id') id: string) {
    await this.backupService.deleteJob(id);
  }

  // Backup endpoints
  @Get()
  @ApiOperation({ summary: 'Get all backups' })
  @ApiQuery({ name: 'databaseId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'List of backups', type: [BackupResponseDto] })
  async findAllBackups(
    @Query('databaseId') databaseId?: string,
    @Query('status') status?: string,
  ) {
    return this.backupService.findAllBackups({ databaseId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get backup by ID' })
  @ApiParam({ name: 'id', description: 'Backup ID' })
  async findBackupById(@Param('id') id: string) {
    return this.backupService.findBackupById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create backup' })
  @ApiResponse({ status: 201, description: 'Backup created', type: BackupResponseDto })
  async createBackup(@Body() createDto: CreateBackupDto) {
    return this.backupService.createBackup(createDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete backup' })
  @ApiParam({ name: 'id', description: 'Backup ID' })
  async deleteBackup(@Param('id') id: string) {
    await this.backupService.deleteBackup(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download backup' })
  @ApiParam({ name: 'id', description: 'Backup ID' })
  async downloadBackup(@Param('id') id: string, @Res() res: Response) {
    const { path, filename } = await this.backupService.downloadBackup(id);
    res.download(path, filename);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify backup integrity' })
  @ApiParam({ name: 'id', description: 'Backup ID' })
  async verifyBackup(@Param('id') id: string) {
    return this.backupService.verifyBackup(id);
  }
}
