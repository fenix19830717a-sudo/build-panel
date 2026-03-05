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
import { ThemesService } from './themes.service';
import { CreateThemeDto, UpdateThemeDto, ApplyThemeDto } from './dto/theme.dto';
import { Theme } from './entities/theme.entity';
import { TenantId } from '../../common/decorators/tenant.decorator';

@ApiTags('Themes')
@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建主题' })
  @ApiResponse({ status: 201, description: '主题创建成功', type: Theme })
  async create(
    @Body() createThemeDto: CreateThemeDto,
    @TenantId() tenantId: string,
  ): Promise<Theme> {
    return this.themesService.create(createThemeDto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: '获取主题列表' })
  @ApiResponse({ status: 200, description: '返回主题列表' })
  async findAll(@TenantId() tenantId: string): Promise<Theme[]> {
    return this.themesService.findAll(tenantId);
  }

  @Get('defaults')
  @ApiOperation({ summary: '获取系统默认主题' })
  @ApiResponse({ status: 200, description: '返回默认主题列表' })
  async findDefaults(): Promise<Theme[]> {
    return this.themesService.findDefaults();
  }

  @Get('active')
  @ApiOperation({ summary: '获取当前激活的主题' })
  @ApiResponse({ status: 200, description: '返回激活的主题' })
  async getActiveTheme(@TenantId() tenantId: string): Promise<Theme | null> {
    return this.themesService.getActiveTheme(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取主题详情' })
  @ApiResponse({ status: 200, description: '返回主题详情', type: Theme })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
  ): Promise<Theme> {
    return this.themesService.findOne(id, tenantId);
  }

  @Get('by-slug/:slug')
  @ApiOperation({ summary: '通过slug获取主题' })
  @ApiResponse({ status: 200, description: '返回主题详情', type: Theme })
  async findBySlug(
    @Param('slug') slug: string,
    @TenantId() tenantId: string,
  ): Promise<Theme | null> {
    return this.themesService.findBySlug(slug, tenantId);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新主题' })
  @ApiResponse({ status: 200, description: '主题更新成功', type: Theme })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateThemeDto: UpdateThemeDto,
    @TenantId() tenantId: string,
  ): Promise<Theme> {
    return this.themesService.update(id, updateThemeDto, tenantId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除主题' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantId() tenantId: string,
  ): Promise<void> {
    return this.themesService.remove(id, tenantId);
  }

  @Post('apply')
  @ApiBearerAuth()
  @ApiOperation({ summary: '应用主题' })
  @ApiResponse({ status: 200, description: '主题应用成功', type: Theme })
  async applyTheme(
    @Body() applyThemeDto: ApplyThemeDto,
    @TenantId() tenantId: string,
  ): Promise<Theme> {
    return this.themesService.applyTheme(applyThemeDto.themeId, tenantId);
  }

  @Get(':id/css')
  @ApiOperation({ summary: '获取主题CSS变量' })
  @ApiResponse({ status: 200, description: '返回CSS变量' })
  async getCssVariables(@Param('id', ParseUUIDPipe) id: string): Promise<{ css: string }> {
    const theme = await this.themesService.findOne(id);
    const css = this.themesService.generateCssVariables(theme.config);
    return { css };
  }
}
