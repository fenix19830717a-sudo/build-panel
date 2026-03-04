import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MonitorService } from './monitor.service';

@ApiTags('monitor')
@ApiBearerAuth()
@Controller('monitor')
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  async getDashboardStats() {
    return this.monitorService.getDashboardStats();
  }

  @Get('trend')
  @ApiOperation({ summary: 'Get backup trend data' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getBackupTrend(@Query('days') days?: string) {
    return this.monitorService.getBackupTrend(parseInt(days || '7'));
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent backups' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentBackups(@Query('limit') limit?: string) {
    return this.monitorService.getRecentBackups(parseInt(limit || '10'));
  }

  @Get('failed')
  @ApiOperation({ summary: 'Get failed backups' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFailedBackups(@Query('limit') limit?: string) {
    return this.monitorService.getFailedBackups(parseInt(limit || '10'));
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get job statistics' })
  async getJobStats() {
    return this.monitorService.getJobStats();
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get active alerts' })
  async getAlerts() {
    return this.monitorService.getAlerts();
  }
}
