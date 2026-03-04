import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto, DeployTenantDto } from './dto';

@ApiTags('Admin - Tenants')
@Controller('api/v1/admin/tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({ summary: '创建租户' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '租户创建成功' })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @ApiOperation({ summary: '租户列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
  ) {
    return this.tenantsService.findAll({ page, limit, status });
  }

  @Get(':id')
  @ApiOperation({ summary: '租户详情' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '租户不存在' })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新租户' })
  @ApiResponse({ status: HttpStatus.OK, description: '更新成功' })
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Post(':id/deploy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '部署租户站点' })
  @ApiResponse({ status: HttpStatus.OK, description: '部署成功' })
  deploy(
    @Param('id') id: string,
    @Body() deployDto: DeployTenantDto,
  ) {
    return this.tenantsService.deploy(id, deployDto);
  }
}
