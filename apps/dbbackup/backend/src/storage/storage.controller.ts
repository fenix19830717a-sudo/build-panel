import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { StorageConfig } from '../common/entities/storage-config.entity';

@ApiTags('storage')
@ApiBearerAuth()
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get()
  @ApiOperation({ summary: 'Get all storage configurations' })
  @ApiResponse({ status: 200, description: 'List of storage configurations' })
  async findAll() {
    return this.storageService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get storage config by ID' })
  @ApiParam({ name: 'id', description: 'Storage config ID' })
  async findOne(@Param('id') id: string) {
    return this.storageService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create storage configuration' })
  @ApiResponse({ status: 201, description: 'Storage configuration created' })
  async create(@Body() config: Partial<StorageConfig>) {
    return this.storageService.create(config);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update storage configuration' })
  @ApiParam({ name: 'id', description: 'Storage config ID' })
  async update(@Param('id') id: string, @Body() config: Partial<StorageConfig>) {
    return this.storageService.update(id, config);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete storage configuration' })
  @ApiParam({ name: 'id', description: 'Storage config ID' })
  async remove(@Param('id') id: string) {
    await this.storageService.remove(id);
  }
}
