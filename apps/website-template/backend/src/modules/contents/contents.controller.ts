import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ContentsService } from './contents.service';
import { CreateContentDto, UpdateContentDto, GetContentQueryDto } from './dto';

@ApiTags('Contents')
@Controller('api/v1')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Get('contents')
  @ApiOperation({ summary: '获取内容 (自动识别租户)' })
  @ApiQuery({ name: 'key', required: false, type: String })
  @ApiQuery({ name: 'language', required: false, type: String })
  @ApiQuery({ name: 'section', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  findAll(
    @Query() query: GetContentQueryDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.contentsService.findAll({ ...query, tenantId });
  }

  @Post('admin/contents')
  @ApiOperation({ summary: '创建内容' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '内容创建成功' })
  create(
    @Body() createContentDto: CreateContentDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.contentsService.create({ ...createContentDto, tenantId });
  }

  @Put('admin/contents/:id')
  @ApiOperation({ summary: '更新内容' })
  @ApiResponse({ status: HttpStatus.OK, description: '更新成功' })
  update(
    @Query('id') id: string,
    @Body() updateContentDto: UpdateContentDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.contentsService.update(id, tenantId, updateContentDto);
  }
}
