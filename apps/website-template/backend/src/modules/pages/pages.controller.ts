import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PagesService } from './pages.service';
import { CreatePageDto, UpdatePageDto } from './dto';

@ApiTags('Pages')
@Controller('api/v1')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get('pages')
  @ApiOperation({ summary: '页面列表' })
  findAll(
    @Query('status') status: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.pagesService.findAll(tenantId, status);
  }

  @Get('pages/:slug')
  @ApiOperation({ summary: '通过slug获取页面' })
  findBySlug(
    @Param('slug') slug: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.pagesService.findBySlug(slug, tenantId);
  }

  @Post('admin/pages')
  @ApiOperation({ summary: '创建页面' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '页面创建成功' })
  create(
    @Body() createPageDto: CreatePageDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.pagesService.create({ ...createPageDto, tenantId });
  }

  @Put('admin/pages/:id')
  @ApiOperation({ summary: '更新页面' })
  update(
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.pagesService.update(id, tenantId, updatePageDto);
  }

  @Delete('admin/pages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除页面' })
  remove(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.pagesService.remove(id, tenantId);
  }

  @Get('pages/homepage')
  @ApiOperation({ summary: '获取首页' })
  getHomepage(@Headers('x-tenant-id') tenantId: string) {
    return this.pagesService.getHomepage(tenantId);
  }
}
