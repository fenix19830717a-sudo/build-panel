import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RestoreService } from './restore.service';
import { RestoreMode } from '../common/entities/restore-log.entity';

@ApiTags('restore')
@ApiBearerAuth()
@Controller('restore')
export class RestoreController {
  constructor(private readonly restoreService: RestoreService) {}

  @Get()
  @ApiOperation({ summary: 'Get all restore logs' })
  @ApiResponse({ status: 200, description: 'List of restore logs' })
  async findAll() {
    return this.restoreService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restore log by ID' })
  @ApiParam({ name: 'id', description: 'Restore log ID' })
  async findOne(@Param('id') id: string) {
    return this.restoreService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Restore backup' })
  @ApiResponse({ status: 201, description: 'Restore started' })
  async restore(@Body() data: {
    backupId: string;
    targetDatabaseId: string;
    restoreMode?: RestoreMode;
    pitrTimestamp?: Date;
    includeTables?: string[];
    excludeTables?: string[];
    dropBeforeRestore?: boolean;
  }) {
    return this.restoreService.restore(data);
  }
}
