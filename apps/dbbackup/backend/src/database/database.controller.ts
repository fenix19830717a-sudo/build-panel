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
import { DatabaseService } from './database.service';
import { CreateDatabaseDto, UpdateDatabaseDto, TestConnectionDto, DatabaseResponseDto } from '../common/dto/database.dto';

@ApiTags('databases')
@ApiBearerAuth()
@Controller('databases')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all databases', description: 'Returns a list of all configured databases' })
  @ApiResponse({ status: 200, description: 'List of databases', type: [DatabaseResponseDto] })
  async findAll() {
    return this.databaseService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get database by ID', description: 'Returns a single database configuration' })
  @ApiParam({ name: 'id', description: 'Database ID' })
  @ApiResponse({ status: 200, description: 'Database found', type: DatabaseResponseDto })
  @ApiResponse({ status: 404, description: 'Database not found' })
  async findOne(@Param('id') id: string) {
    return this.databaseService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create database', description: 'Create a new database configuration' })
  @ApiResponse({ status: 201, description: 'Database created', type: DatabaseResponseDto })
  async create(@Body() createDto: CreateDatabaseDto) {
    return this.databaseService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update database', description: 'Update an existing database configuration' })
  @ApiParam({ name: 'id', description: 'Database ID' })
  @ApiResponse({ status: 200, description: 'Database updated', type: DatabaseResponseDto })
  async update(@Param('id') id: string, @Body() updateDto: UpdateDatabaseDto) {
    return this.databaseService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete database', description: 'Delete a database configuration' })
  @ApiParam({ name: 'id', description: 'Database ID' })
  @ApiResponse({ status: 204, description: 'Database deleted' })
  async remove(@Param('id') id: string) {
    await this.databaseService.remove(id);
  }

  @Post('test-connection')
  @ApiOperation({ summary: 'Test database connection', description: 'Test connection to a database' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  async testConnection(@Body() testDto: TestConnectionDto) {
    return this.databaseService.testConnection(testDto);
  }
}
