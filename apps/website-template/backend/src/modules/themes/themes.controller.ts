import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThemesService } from './themes.service';
import { CreateThemeDto } from './dto';

@ApiTags('Themes')
@Controller('api/v1')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get('themes')
  @ApiOperation({ summary: '可用主题列表' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  findAll() {
    return this.themesService.findAll();
  }

  @Post('admin/themes')
  @ApiOperation({ summary: '创建主题' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '主题创建成功' })
  create(@Body() createThemeDto: CreateThemeDto) {
    return this.themesService.create(createThemeDto);
  }

  @Get('admin/themes/:id/config')
  @ApiOperation({ summary: '主题配置' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  getConfig(@Param('id') id: string) {
    return this.themesService.getConfig(id);
  }
}
