import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { MonitorsService } from './monitors.service';
import {
  CreateMonitorDto,
  UpdateMonitorDto,
  MonitorResponseDto,
  MonitorListResponseDto,
  MonitorStatusResponseDto,
  QuickCheckResponseDto,
} from './monitors.dto';

@ApiTags('monitors')
@Controller('monitors')
export class MonitorsController {
  constructor(private readonly monitorsService: MonitorsService) {}

  @Get()
  @ApiOperation({ summary: '获取监控列表', description: '分页获取所有监控项' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiResponse({ status: 200, description: '成功', type: MonitorListResponseDto })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<MonitorListResponseDto> {
    const result = await this.monitorsService.findAll(page, limit);
    return {
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取监控详情', description: '根据ID获取监控项详细信息' })
  @ApiParam({ name: 'id', description: '监控ID' })
  @ApiResponse({ status: 200, description: '成功', type: MonitorResponseDto })
  @ApiResponse({ status: 404, description: '监控不存在' })
  async findOne(@Param('id') id: string): Promise<MonitorResponseDto> {
    return this.monitorsService.findOne(id) as Promise<MonitorResponseDto>;
  }

  @Post()
  @ApiOperation({ summary: '创建监控', description: '创建新的监控项' })
  @ApiResponse({ status: 201, description: '创建成功', type: MonitorResponseDto })
  @ApiResponse({ status: 400, description: '参数错误' })
  async create(@Body() createMonitorDto: CreateMonitorDto): Promise<MonitorResponseDto> {
    return this.monitorsService.create(createMonitorDto) as Promise<MonitorResponseDto>;
  }

  @Put(':id')
  @ApiOperation({ summary: '更新监控', description: '更新指定监控项' })
  @ApiParam({ name: 'id', description: '监控ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: MonitorResponseDto })
  @ApiResponse({ status: 404, description: '监控不存在' })
  async update(
    @Param('id') id: string,
    @Body() updateMonitorDto: UpdateMonitorDto,
  ): Promise<MonitorResponseDto> {
    return this.monitorsService.update(id, updateMonitorDto) as Promise<MonitorResponseDto>;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除监控', description: '删除指定监控项' })
  @ApiParam({ name: 'id', description: '监控ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '监控不存在' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.monitorsService.remove(id);
  }

  @Get(':id/status')
  @ApiOperation({ summary: '获取监控状态', description: '获取监控项的当前状态' })
  @ApiParam({ name: 'id', description: '监控ID' })
  @ApiResponse({ status: 200, description: '成功', type: MonitorStatusResponseDto })
  @ApiResponse({ status: 404, description: '监控不存在' })
  async getStatus(@Param('id') id: string): Promise<MonitorStatusResponseDto> {
    return this.monitorsService.getStatus(id) as Promise<MonitorStatusResponseDto>;
  }

  @Get(':id/history')
  @ApiOperation({ summary: '获取监控历史', description: '获取监控项的历史检查记录' })
  @ApiParam({ name: 'id', description: '监控ID' })
  @ApiQuery({ name: 'hours', required: false, description: '查询小时数', example: 24 })
  @ApiResponse({ status: 200, description: '成功' })
  async getHistory(
    @Param('id') id: string,
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
  ): Promise<any> {
    return this.monitorsService.getHistory(id, hours);
  }

  @Post(':id/check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '立即检查', description: '立即执行一次监控检查' })
  @ApiParam({ name: 'id', description: '监控ID' })
  @ApiResponse({ status: 200, description: '检查完成', type: QuickCheckResponseDto })
  @ApiResponse({ status: 404, description: '监控不存在' })
  async quickCheck(@Param('id') id: string): Promise<QuickCheckResponseDto> {
    try {
      const result = await this.monitorsService.performCheck(id);
      await this.monitorsService.saveCheckResult(id, result);
      
      return {
        success: true,
        message: 'Check completed successfully',
        data: {
          status: result.status,
          responseTime: result.responseTime,
          statusCode: result.statusCode,
          errorMessage: result.errorMessage,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post(':id/pause')
  @ApiOperation({ summary: '暂停监控', description: '暂停指定监控项' })
  @ApiParam({ name: 'id', description: '监控ID' })
  @ApiResponse({ status: 200, description: '暂停成功' })
  async pause(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.monitorsService.update(id, { isActive: false });
    return { success: true };
  }

  @Post(':id/resume')
  @ApiOperation({ summary: '恢复监控', description: '恢复指定监控项' })
  @ApiParam({ name: 'id', description: '监控ID' })
  @ApiResponse({ status: 200, description: '恢复成功' })
  async resume(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.monitorsService.update(id, { isActive: true });
    return { success: true };
  }
}
