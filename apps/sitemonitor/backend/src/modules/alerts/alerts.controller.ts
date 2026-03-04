import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { Alert, AlertStatus, AlertSeverity } from '../../entities/alert.entity';

@ApiTags('alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: '获取告警列表', description: '分页获取告警记录' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiQuery({ name: 'status', required: false, description: '告警状态', enum: AlertStatus })
  @ApiQuery({ name: 'severity', required: false, description: '告警级别', enum: AlertSeverity })
  @ApiQuery({ name: 'monitorId', required: false, description: '监控ID' })
  @ApiResponse({ status: 200, description: '成功' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: AlertStatus,
    @Query('severity') severity?: AlertSeverity,
    @Query('monitorId') monitorId?: string,
  ): Promise<{ data: Alert[]; total: number; page: number; limit: number }> {
    return this.alertsService.findAll(page, limit, status, severity, monitorId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取告警详情', description: '根据ID获取告警详情' })
  @ApiParam({ name: 'id', description: '告警ID' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 404, description: '告警不存在' })
  async findOne(@Param('id') id: string): Promise<Alert> {
    return this.alertsService.findOne(id);
  }

  @Post(':id/acknowledge')
  @ApiOperation({ summary: '确认告警', description: '确认指定告警' })
  @ApiParam({ name: 'id', description: '告警ID' })
  @ApiResponse({ status: 200, description: '成功' })
  async acknowledge(@Param('id') id: string): Promise<Alert> {
    return this.alertsService.acknowledgeAlert(id);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: '解决告警', description: '解决指定告警' })
  @ApiParam({ name: 'id', description: '告警ID' })
  @ApiResponse({ status: 200, description: '成功' })
  async resolve(@Param('id') id: string): Promise<Alert> {
    return this.alertsService.resolveAlert(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除告警', description: '删除指定告警' })
  @ApiParam({ name: 'id', description: '告警ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.alertsService.deleteAlert(id);
  }

  @Get('stats/overview')
  @ApiOperation({ summary: '获取告警统计', description: '获取告警统计数据' })
  @ApiQuery({ name: 'hours', required: false, description: '小时数', example: 24 })
  @ApiResponse({ status: 200, description: '成功' })
  async getStats(
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
  ): Promise<{
    total: number;
    pending: number;
    sent: number;
    acknowledged: number;
    resolved: number;
    failed: number;
    bySeverity: Record<AlertSeverity, number>;
    byType: Record<string, number>;
  }> {
    return this.alertsService.getStats(hours);
  }
}
