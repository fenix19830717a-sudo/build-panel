import { Controller, Get, Post, Body, Param, Delete, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ParsersService } from './parsers.service';
import { CreateParserDto, UpdateParserDto } from './dto/parser.dto';

@ApiTags('Parsers')
@Controller('api/v1/parsers')
export class ParsersController {
  constructor(private readonly parsersService: ParsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new log parser' })
  @ApiResponse({ status: 201, description: 'Parser created successfully' })
  create(@Body() createParserDto: CreateParserDto) {
    return this.parsersService.create(createParserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all log parsers' })
  @ApiResponse({ status: 200, description: 'Return all parsers' })
  findAll() {
    return this.parsersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single parser by ID' })
  @ApiResponse({ status: 200, description: 'Return the parser' })
  @ApiResponse({ status: 404, description: 'Parser not found' })
  findOne(@Param('id') id: string) {
    return this.parsersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a parser' })
  @ApiResponse({ status: 200, description: 'Parser updated successfully' })
  update(@Param('id') id: string, @Body() updateParserDto: UpdateParserDto) {
    return this.parsersService.update(id, updateParserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a parser' })
  @ApiResponse({ status: 204, description: 'Parser deleted successfully' })
  remove(@Param('id') id: string) {
    return this.parsersService.remove(id);
  }
}
