import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Alert } from '../../entities/alert.entity';
import { CheckResult } from '../../entities/check-result.entity';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: '获取仪表盘概览', description: '获取监控总览统计数据' })
  @ApiResponse({ status: 200, description: '成功' })
  async getOverview(): Promise<{
    totalMonitors: number;
    upMonitors: number;
    downMonitors: number;
    pausedMonitors: number;
    pendingMonitors: number;
    avgUptime: number;
    avgResponseTime: number;
    activeAlerts: number;
    recentAlerts: number;
  }> {
    return this.dashboardService.getOverview();
  }

  @Get('status-distribution')
  @ApiOperation({ summary: '获取状态分布', description: '获取监控状态的分布情况' })
  @ApiResponse({ status: 200, description: '成功' })
  async getStatusDistribution(): Promise<{ status: string; count: number; percentage: number }[]> {
    return this.dashboardService.getStatusDistribution();
  }

  @Get('response-time-stats')
  @ApiOperation({ summary: '获取响应时间统计', description: '获取响应时间统计信息' })
  @ApiQuery({ name: 'hours', required: false, description: '小时数', example: 24 })
  @ApiResponse({ status: 200, description: '成功' })
  async getResponseTimeStats(
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
  ): Promise<{
    avg: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  }> {
    return this.dashboardService.getResponseTimeStats(hours);
  }

  @Get('uptime-trend')
  @ApiOperation({ summary: '获取可用率趋势', description: '获取可用率历史趋势' })
  @ApiQuery({ name: 'days', required: false, description: '天数', example: 7 })
  @ApiResponse({ status: 200, description: '成功' })
  async getUptimeTrend(
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
  ): Promise<{ date: string; uptime: number }[]> {
    return this.dashboardService.getUptimeTrend(days);
  }

  @Get('recent-alerts')
  @ApiOperation({ summary: '获取最近告警', description: '获取最近的告警记录' })
  @ApiQuery({ name: 'limit', required: false, description: '数量', example: 10 })
  @ApiResponse({ status: 200, description: '成功' })
  async getRecentAlerts(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<Alert[]> {
    return this.dashboardService.getRecentAlerts(limit);
  }

  @Get('recent-checks')
  @ApiOperation({ summary: '获取最近检查', description: '获取最近的检查记录' })
  @ApiQuery({ name: 'limit', required: false, description: '数量', example: 50 })
  @ApiResponse({ status: 200, description: '成功' })
  async getRecentChecks(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ): Promise<CheckResult[]> {
    return this.dashboardService.getRecentChecks(limit);
  }
}
