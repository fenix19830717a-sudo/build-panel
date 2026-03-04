import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderItem, OrderStatus } from './entities/order.entity';
import { CreateOrderDto, UpdateOrderDto, OrderQueryDto } from './dto/order.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private productsService: ProductsService,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const { items, shippingAddress, notes } = createOrderDto;
    
    // 计算订单总价
    let subtotal = 0;
    const orderItems: OrderItem[] = [];
    
    for (const item of items) {
      const product = await this.productsService.findOne(item.productId);
      
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Product ${product.name} is out of stock`);
      }
      
      const itemTotal = Number(product.price) * item.quantity;
      subtotal += itemTotal;
      
      orderItems.push(
        this.orderItemRepository.create({
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: item.quantity,
          total: itemTotal,
          attributes: item.attributes,
        }),
      );
    }
    
    // 计算运费和税费（简化处理）
    const shippingCost = subtotal > 100 ? 0 : 10;
    const tax = subtotal * 0.08; // 8% 税费
    const total = subtotal + shippingCost + tax;
    
    // 生成订单号
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const order = this.orderRepository.create({
      orderNumber,
      userId,
      items: orderItems,
      shippingAddress,
      notes,
      subtotal,
      shippingCost,
      tax,
      total,
    });
    
    return this.orderRepository.save(order);
  }

  async findAll(query: OrderQueryDto) {
    const { page, limit, userId, status } = query;
    
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    
    const [data, total] = await this.orderRepository.findAndCount({
      where,
      relations: ['items'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByUser(userId: string, query: OrderQueryDto) {
    query.userId = userId;
    return this.findAll(query);
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return this.orderRepository.save(order);
  }

  async cancel(id: string): Promise<Order> {
    const order = await this.findOne(id);
    
    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot cancel this order');
    }
    
    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }

  async getOrderStats() {
    const [
      total,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
    ] = await Promise.all([
      this.orderRepository.count(),
      this.orderRepository.count({ where: { status: OrderStatus.PENDING } }),
      this.orderRepository.count({ where: { status: OrderStatus.PROCESSING } }),
      this.orderRepository.count({ where: { status: OrderStatus.SHIPPED } }),
      this.orderRepository.count({ where: { status: OrderStatus.DELIVERED } }),
      this.orderRepository.count({ where: { status: OrderStatus.CANCELLED } }),
    ]);
    
    return {
      total,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
    };
  }
}
