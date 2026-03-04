import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto';

@ApiTags('Products')
@Controller('api/v1')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('products')
  @ApiOperation({ summary: '产品列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAll(
    @Query() query: ProductQueryDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.productsService.findAll({ ...query, tenantId });
  }

  @Get('products/:id')
  @ApiOperation({ summary: '产品详情' })
  findOne(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.productsService.findOne(id, tenantId);
  }

  @Post('admin/products')
  @ApiOperation({ summary: '创建产品' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '产品创建成功' })
  create(
    @Body() createProductDto: CreateProductDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.productsService.create({ ...createProductDto, tenantId });
  }

  @Put('admin/products/:id')
  @ApiOperation({ summary: '更新产品' })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.productsService.update(id, tenantId, updateProductDto);
  }

  @Delete('admin/products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除产品' })
  remove(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.productsService.remove(id, tenantId);
  }

  // Categories
  @Get('product-categories')
  @ApiOperation({ summary: '产品分类列表' })
  findCategories(@Headers('x-tenant-id') tenantId: string) {
    return this.productsService.findCategories(tenantId);
  }

  @Post('admin/product-categories')
  @ApiOperation({ summary: '创建产品分类' })
  createCategory(
    @Body() dto: { name: string; slug: string; description?: string },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.productsService.createCategory({ ...dto, tenantId });
  }

  // Tags
  @Get('product-tags')
  @ApiOperation({ summary: '产品标签列表' })
  findTags(@Headers('x-tenant-id') tenantId: string) {
    return this.productsService.findTags(tenantId);
  }
}
