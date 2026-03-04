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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto, OrderQueryDto } from './dto/order.dto';
import { Order } from './entities/order.entity';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建订单' })
  @ApiResponse({ status: 201, description: '订单创建成功', type: Order })
  async create(
    @Request() req,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取订单列表' })
  @ApiResponse({ status: 200, description: '返回订单列表' })
  async findAll(@Query() query: OrderQueryDto, @Request() req) {
    if (req.user.role === 'admin') {
      return this.ordersService.findAll(query);
    }
    return this.ordersService.findByUser(req.user.id, query);
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取订单统计' })
  @ApiResponse({ status: 200, description: '返回订单统计' })
  async getStats() {
    return this.ordersService.getOrderStats();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取订单详情' })
  @ApiResponse({ status: 200, description: '返回订单详情', type: Order })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新订单' })
  @ApiResponse({ status: 200, description: '订单更新成功', type: Order })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Post(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消订单' })
  @ApiResponse({ status: 200, description: '订单已取消', type: Order })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async cancel(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return this.ordersService.cancel(id);
  }
}
