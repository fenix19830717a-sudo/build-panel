import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { Category } from './entities/category.entity';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建分类' })
  @ApiResponse({ status: 201, description: '分类创建成功', type: Category })
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: '获取分类树' })
  @ApiResponse({ status: 200, description: '返回分类树' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get('flat')
  @ApiOperation({ summary: '获取扁平分类列表' })
  @ApiResponse({ status: 200, description: '返回分类列表' })
  async findAllFlat() {
    return this.categoriesService.findAllFlat();
  }

  @Get('tree')
  @ApiOperation({ summary: '获取分类树结构' })
  @ApiResponse({ status: 200, description: '返回分类树' })
  async getTree() {
    return this.categoriesService.getCategoryTree();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取分类详情' })
  @ApiResponse({ status: 200, description: '返回分类详情', type: Category })
  @ApiResponse({ status: 404, description: '分类不存在' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新分类' })
  @ApiResponse({ status: 200, description: '分类更新成功', type: Category })
  @ApiResponse({ status: 404, description: '分类不存在' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除分类' })
  @ApiResponse({ status: 204, description: '分类删除成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
