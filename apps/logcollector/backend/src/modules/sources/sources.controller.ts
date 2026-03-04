import { Controller, Get, Post, Body, Param, Delete, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SourcesService } from './sources.service';
import { CreateSourceDto, UpdateSourceDto } from './dto/source.dto';

@ApiTags('Sources')
@Controller('api/v1/sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new log source' })
  @ApiResponse({ status: 201, description: 'Source created successfully' })
  create(@Body() createSourceDto: CreateSourceDto) {
    return this.sourcesService.create(createSourceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all log sources' })
  @ApiResponse({ status: 200, description: 'Return all sources' })
  findAll() {
    return this.sourcesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single source by ID' })
  @ApiResponse({ status: 200, description: 'Return the source' })
  @ApiResponse({ status: 404, description: 'Source not found' })
  findOne(@Param('id') id: string) {
    return this.sourcesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a source' })
  @ApiResponse({ status: 200, description: 'Source updated successfully' })
  update(@Param('id') id: string, @Body() updateSourceDto: UpdateSourceDto) {
    return this.sourcesService.update(id, updateSourceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a source' })
  @ApiResponse({ status: 204, description: 'Source deleted successfully' })
  remove(@Param('id') id: string) {
    return this.sourcesService.remove(id);
  }
}
