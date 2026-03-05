import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto, TenantQueryDto } from './dto/tenant.dto';
import { Tenant, TenantStatus } from './entities/tenant.entity';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建租户' })
  @ApiResponse({ status: 201, description: '租户创建成功', type: Tenant })
  async create(@Body() createTenantDto: CreateTenantDto): Promise<Tenant> {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取租户列表' })
  @ApiResponse({ status: 200, description: '返回租户列表' })
  async findAll(@Query() query: TenantQueryDto) {
    return this.tenantsService.findAll(query);
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取租户统计' })
  @ApiResponse({ status: 200, description: '返回租户统计' })
  async getStats() {
    return this.tenantsService.getTenantStats();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取租户详情' })
  @ApiResponse({ status: 200, description: '返回租户详情', type: Tenant })
  @ApiResponse({ status: 404, description: '租户不存在' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Tenant> {
    return this.tenantsService.findOne(id);
  }

  @Get('by-slug/:slug')
  @ApiOperation({ summary: '通过slug获取租户' })
  @ApiResponse({ status: 200, description: '返回租户详情', type: Tenant })
  async findBySlug(@Param('slug') slug: string): Promise<Tenant | null> {
    return this.tenantsService.findBySlug(slug);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新租户' })
  @ApiResponse({ status: 200, description: '租户更新成功', type: Tenant })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ): Promise<Tenant> {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除租户' })
  @ApiResponse({ status: 204, description: '租户删除成功' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.tenantsService.remove(id);
  }

  @Put(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新租户状态' })
  @ApiResponse({ status: 200, description: '状态更新成功', type: Tenant })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: TenantStatus,
  ): Promise<Tenant> {
    return this.tenantsService.updateStatus(id, status);
  }
}
