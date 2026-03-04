import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, CartItem } from './entities/cart.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    private productsService: ProductsService,
  ) {}

  async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    let cart: Cart | null = null;
    
    if (userId) {
      cart = await this.cartRepository.findOne({
        where: { userId },
        relations: ['items'],
      });
    } else if (sessionId) {
      cart = await this.cartRepository.findOne({
        where: { sessionId },
        relations: ['items'],
      });
    }
    
    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        sessionId,
        items: [],
      });
      cart = await this.cartRepository.save(cart);
    }
    
    return cart;
  }

  async addItem(userId: string | undefined, sessionId: string | undefined, addToCartDto: AddToCartDto): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    const { productId, quantity, attributes } = addToCartDto;
    
    // 检查产品是否存在
    const product = await this.productsService.findOne(productId);
    
    // 检查购物车中是否已有该产品
    let cartItem = cart.items.find(
      (item) => item.productId === productId && JSON.stringify(item.attributes) === JSON.stringify(attributes),
    );
    
    if (cartItem) {
      cartItem.quantity += quantity;
      await this.cartItemRepository.save(cartItem);
    } else {
      cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        quantity,
        attributes,
      });
      await this.cartItemRepository.save(cartItem);
    }
    
    return this.getOrCreateCart(userId, sessionId);
  }

  async updateItem(
    userId: string | undefined,
    sessionId: string | undefined,
    itemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    
    const cartItem = cart.items.find((item) => item.id === itemId);
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }
    
    if (updateCartItemDto.quantity === 0) {
      await this.cartItemRepository.remove(cartItem);
    } else {
      cartItem.quantity = updateCartItemDto.quantity;
      await this.cartItemRepository.save(cartItem);
    }
    
    return this.getOrCreateCart(userId, sessionId);
  }

  async removeItem(userId: string | undefined, sessionId: string | undefined, itemId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    
    const cartItem = cart.items.find((item) => item.id === itemId);
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }
    
    await this.cartItemRepository.remove(cartItem);
    return this.getOrCreateCart(userId, sessionId);
  }

  async clearCart(userId: string | undefined, sessionId: string | undefined): Promise<void> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    await this.cartItemRepository.remove(cart.items);
  }

  async getCart(userId?: string, sessionId?: string): Promise<any> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    
    // 获取产品详情
    const itemsWithDetails = await Promise.all(
      cart.items.map(async (item) => {
        const product = await this.productsService.findOne(item.productId).catch(() => null);
        return {
          ...item,
          productName: product?.name || 'Unknown Product',
          productImage: product?.images?.[0] || null,
          price: product?.price || 0,
          total: Number(product?.price || 0) * item.quantity,
        };
      }),
    );
    
    const total = itemsWithDetails.reduce((sum, item) => sum + item.total, 0);
    const itemCount = itemsWithDetails.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      id: cart.id,
      items: itemsWithDetails,
      total,
      itemCount,
    };
  }

  async mergeCarts(userId: string, sessionId: string): Promise<Cart> {
    const sessionCart = await this.getOrCreateCart(undefined, sessionId);
    const userCart = await this.getOrCreateCart(userId, undefined);
    
    // 将session购物车中的商品转移到用户购物车
    for (const item of sessionCart.items) {
      const existingItem = userCart.items.find(
        (userItem) =>
          userItem.productId === item.productId &&
          JSON.stringify(userItem.attributes) === JSON.stringify(item.attributes),
      );
      
      if (existingItem) {
        existingItem.quantity += item.quantity;
        await this.cartItemRepository.save(existingItem);
      } else {
        const newItem = this.cartItemRepository.create({
          cartId: userCart.id,
          productId: item.productId,
          quantity: item.quantity,
          attributes: item.attributes,
        });
        await this.cartItemRepository.save(newItem);
      }
    }
    
    // 删除session购物车
    await this.cartRepository.remove(sessionCart);
    
    return this.getOrCreateCart(userId, undefined);
  }
}
