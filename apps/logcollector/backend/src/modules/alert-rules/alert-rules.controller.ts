import { Controller, Get, Post, Body, Param, Delete, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AlertRulesService } from './alert-rules.service';
import { CreateAlertRuleDto, UpdateAlertRuleDto } from './dto/alert-rule.dto';

@ApiTags('Alert Rules')
@Controller('api/v1/alert-rules')
export class AlertRulesController {
  constructor(private readonly alertRulesService: AlertRulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new alert rule' })
  @ApiResponse({ status: 201, description: 'Alert rule created successfully' })
  create(@Body() createAlertRuleDto: CreateAlertRuleDto) {
    return this.alertRulesService.create(createAlertRuleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all alert rules' })
  @ApiResponse({ status: 200, description: 'Return all alert rules' })
  findAll() {
    return this.alertRulesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single alert rule by ID' })
  @ApiResponse({ status: 200, description: 'Return the alert rule' })
  @ApiResponse({ status: 404, description: 'Alert rule not found' })
  findOne(@Param('id') id: string) {
    return this.alertRulesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an alert rule' })
  @ApiResponse({ status: 200, description: 'Alert rule updated successfully' })
  update(@Param('id') id: string, @Body() updateAlertRuleDto: UpdateAlertRuleDto) {
    return this.alertRulesService.update(id, updateAlertRuleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an alert rule' })
  @ApiResponse({ status: 204, description: 'Alert rule deleted successfully' })
  remove(@Param('id') id: string) {
    return this.alertRulesService.remove(id);
  }
}
