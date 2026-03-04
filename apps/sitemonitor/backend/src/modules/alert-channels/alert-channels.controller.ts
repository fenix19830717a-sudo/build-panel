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
import { AlertChannelsService } from './alert-channels.service';
import { CreateAlertChannelDto, UpdateAlertChannelDto, TestChannelDto } from './alert-channels.dto';
import { AlertChannel } from '../../entities/alert-channel.entity';

@ApiTags('alert-channels')
@Controller('alert-channels')
export class AlertChannelsController {
  constructor(private readonly alertChannelsService: AlertChannelsService) {}

  @Get()
  @ApiOperation({ summary: '获取告警渠道列表', description: '分页获取所有告警渠道' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiResponse({ status: 200, description: '成功' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<{ data: AlertChannel[]; total: number; page: number; limit: number }> {
    return this.alertChannelsService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取告警渠道详情', description: '根据ID获取告警渠道详情' })
  @ApiParam({ name: 'id', description: '渠道ID' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiResponse({ status: 404, description: '渠道不存在' })
  async findOne(@Param('id') id: string): Promise<AlertChannel> {
    return this.alertChannelsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建告警渠道', description: '创建新的告警渠道' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() createDto: CreateAlertChannelDto): Promise<AlertChannel> {
    return this.alertChannelsService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新告警渠道', description: '更新指定告警渠道' })
  @ApiParam({ name: 'id', description: '渠道ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '渠道不存在' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAlertChannelDto,
  ): Promise<AlertChannel> {
    return this.alertChannelsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除告警渠道', description: '删除指定告警渠道' })
  @ApiParam({ name: 'id', description: '渠道ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '渠道不存在' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.alertChannelsService.remove(id);
  }

  @Post(':id/test')
  @ApiOperation({ summary: '测试告警渠道', description: '发送测试消息到指定渠道' })
  @ApiParam({ name: 'id', description: '渠道ID' })
  @ApiResponse({ status: 200, description: '测试完成' })
  async test(
    @Param('id') id: string,
    @Body() testDto: TestChannelDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.alertChannelsService.testChannel(id, testDto.message);
  }
}
