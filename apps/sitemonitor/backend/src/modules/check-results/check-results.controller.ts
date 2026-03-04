import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CheckResultsService } from './check-results.service';
import { CheckResult } from '../../entities/check-result.entity';

@ApiTags('check-results')
@Controller('check-results')
export class CheckResultsController {
  constructor(private readonly checkResultsService: CheckResultsService) {}

  @Get('monitor/:monitorId')
  @ApiOperation({ summary: '获取检查结果', description: '获取指定监控项的检查历史' })
  @ApiParam({ name: 'monitorId', description: '监控ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 50 })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiResponse({ status: 200, description: '成功' })
  async findByMonitor(
    @Param('monitorId') monitorId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ data: CheckResult[]; total: number; page: number; limit: number }> {
    return this.checkResultsService.findByMonitor(
      monitorId,
      page,
      limit,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('monitor/:monitorId/latest')
  @ApiOperation({ summary: '获取最新检查结果', description: '获取指定监控项的最新检查结果' })
  @ApiParam({ name: 'monitorId', description: '监控ID' })
  @ApiQuery({ name: 'limit', required: false, description: '数量', example: 1 })
  @ApiResponse({ status: 200, description: '成功' })
  async getLatest(
    @Param('monitorId') monitorId: string,
    @Query('limit', new DefaultValuePipe(1), ParseIntPipe) limit: number,
  ): Promise<CheckResult[]> {
    return this.checkResultsService.getLatestByMonitor(monitorId, limit);
  }

  @Get('monitor/:monitorId/stats')
  @ApiOperation({ summary: '获取统计数据', description: '获取指定监控项的统计数据' })
  @ApiParam({ name: 'monitorId', description: '监控ID' })
  @ApiQuery({ name: 'hours', required: false, description: '小时数', example: 24 })
  @ApiResponse({ status: 200, description: '成功' })
  async getStats(
    @Param('monitorId') monitorId: string,
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
  ): Promise<{
    total: number;
    up: number;
    down: number;
    avgResponseTime: number;
    uptime: number;
  }> {
    return this.checkResultsService.getStatsByMonitor(monitorId, hours);
  }

  @Get('monitor/:monitorId/trend')
  @ApiOperation({ summary: '获取响应时间趋势', description: '获取指定监控项的响应时间趋势' })
  @ApiParam({ name: 'monitorId', description: '监控ID' })
  @ApiQuery({ name: 'hours', required: false, description: '小时数', example: 24 })
  @ApiQuery({ name: 'interval', required: false, description: '聚合间隔（分钟）', example: 60 })
  @ApiResponse({ status: 200, description: '成功' })
  async getTrend(
    @Param('monitorId') monitorId: string,
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
    @Query('interval', new DefaultValuePipe(60), ParseIntPipe) interval: number,
  ): Promise<{ timestamp: Date; avgResponseTime: number; count: number }[]> {
    return this.checkResultsService.getResponseTimeTrend(monitorId, hours, interval);
  }
}
