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
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';
import { Product } from './entities/product.entity';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建产品' })
  @ApiResponse({ status: 201, description: '产品创建成功', type: Product })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: '获取产品列表' })
  @ApiResponse({ status: 200, description: '返回产品列表' })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: '获取推荐产品' })
  @ApiResponse({ status: 200, description: '返回推荐产品列表' })
  async getFeatured(@Query('limit') limit: number = 8) {
    return this.productsService.getFeaturedProducts(limit);
  }

  @Get('new-arrivals')
  @ApiOperation({ summary: '获取新品' })
  @ApiResponse({ status: 200, description: '返回新品列表' })
  async getNewArrivals(@Query('limit') limit: number = 8) {
    return this.productsService.getNewArrivals(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取产品详情' })
  @ApiResponse({ status: 200, description: '返回产品详情', type: Product })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新产品' })
  @ApiResponse({ status: 200, description: '产品更新成功', type: Product })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除产品' })
  @ApiResponse({ status: 204, description: '产品删除成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productsService.remove(id);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '增加产品浏览次数' })
  @ApiResponse({ status: 200, description: '浏览次数已增加' })
  async incrementView(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productsService.incrementViewCount(id);
  }
}
