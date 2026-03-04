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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto, CartResponseDto } from './dto/cart.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: '获取购物车' })
  @ApiResponse({ status: 200, description: '返回购物车内容', type: CartResponseDto })
  async getCart(
    @Request() req,
    @Query('sessionId') sessionId?: string,
  ) {
    const userId = req.user?.id;
    return this.cartService.getCart(userId, sessionId);
  }

  @Post('items')
  @ApiBearerAuth()
  @ApiOperation({ summary: '添加商品到购物车' })
  @ApiResponse({ status: 201, description: '商品已添加', type: CartResponseDto })
  async addItem(
    @Request() req,
    @Body() addToCartDto: AddToCartDto,
    @Query('sessionId') sessionId?: string,
  ) {
    const userId = req.user?.id;
    return this.cartService.addItem(userId, sessionId, addToCartDto);
  }

  @Put('items/:itemId')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新购物车商品' })
  @ApiResponse({ status: 200, description: '商品已更新', type: CartResponseDto })
  async updateItem(
    @Request() req,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Query('sessionId') sessionId?: string,
  ) {
    const userId = req.user?.id;
    return this.cartService.updateItem(userId, sessionId, itemId, updateCartItemDto);
  }

  @Delete('items/:itemId')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除购物车商品' })
  @ApiResponse({ status: 200, description: '商品已删除', type: CartResponseDto })
  async removeItem(
    @Request() req,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Query('sessionId') sessionId?: string,
  ) {
    const userId = req.user?.id;
    return this.cartService.removeItem(userId, sessionId, itemId);
  }

  @Delete()
  @ApiBearerAuth()
  @ApiOperation({ summary: '清空购物车' })
  @ApiResponse({ status: 200, description: '购物车已清空' })
  async clearCart(
    @Request() req,
    @Query('sessionId') sessionId?: string,
  ) {
    const userId = req.user?.id;
    await this.cartService.clearCart(userId, sessionId);
    return { message: 'Cart cleared successfully' };
  }

  @Post('merge')
  @ApiBearerAuth()
  @ApiOperation({ summary: '合并购物车' })
  @ApiResponse({ status: 200, description: '购物车已合并', type: CartResponseDto })
  async mergeCarts(
    @Request() req,
    @Query('sessionId') sessionId: string,
  ) {
    return this.cartService.mergeCarts(req.user.id, sessionId);
  }
}
