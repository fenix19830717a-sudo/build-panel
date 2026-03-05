import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersService } from './orders.service';
import { Order, OrderItem, OrderStatus } from './entities/order.entity';
import { ProductsService } from '../products/products.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const createMockRepository = <T>(): jest.Mocked<Repository<T>> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
} as any);

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: jest.Mocked<Repository<Order>>;
  let orderItemRepository: jest.Mocked<Repository<OrderItem>>;
  let productsService: jest.Mocked<ProductsService>;

  const mockProduct = {
    id: 'product-1',
    name: 'Test Product',
    price: 99.99,
    stock: 10,
  };

  const mockOrder = {
    id: 'order-1',
    orderNumber: 'ORD-123456',
    userId: 'user-1',
    items: [],
    shippingAddress: { address: '123 Test St' },
    notes: '',
    subtotal: 99.99,
    shippingCost: 10,
    tax: 8,
    total: 117.99,
    status: OrderStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: createMockRepository<Order>(),
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: createMockRepository<OrderItem>(),
        },
        {
          provide: ProductsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get(getRepositoryToken(Order));
    orderItemRepository = module.get(getRepositoryToken(OrderItem));
    productsService = module.get(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const createDto = {
        items: [{ productId: 'product-1', quantity: 1 }],
        shippingAddress: { address: '123 Test St' },
        notes: 'Test order',
      };

      productsService.findOne.mockResolvedValue(mockProduct as any);
      orderItemRepository.create.mockReturnValue({
        productId: 'product-1',
        productName: 'Test Product',
        price: 99.99,
        quantity: 1,
        total: 99.99,
      } as OrderItem);
      orderRepository.create.mockReturnValue(mockOrder as Order);
      orderRepository.save.mockResolvedValue(mockOrder as Order);

      const result = await service.create('user-1', createDto as any);

      expect(result).toHaveProperty('orderNumber');
      expect(result.subtotal).toBe(99.99);
      expect(result.shippingCost).toBe(10);
      expect(result.total).toBe(117.99);
    });

    it('should throw BadRequestException if product is out of stock', async () => {
      const createDto = {
        items: [{ productId: 'product-1', quantity: 20 }],
        shippingAddress: { address: '123 Test St' },
      };

      productsService.findOne.mockResolvedValue(mockProduct as any);

      await expect(service.create('user-1', createDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should calculate shipping cost as 0 for orders over 100', async () => {
      const expensiveProduct = { ...mockProduct, price: 150 };
      const createDto = {
        items: [{ productId: 'product-1', quantity: 1 }],
        shippingAddress: { address: '123 Test St' },
      };

      productsService.findOne.mockResolvedValue(expensiveProduct as any);
      orderItemRepository.create.mockReturnValue({
        productId: 'product-1',
        quantity: 1,
        total: 150,
      } as OrderItem);
      orderRepository.create.mockImplementation((data: any) => data as Order);
      orderRepository.save.mockResolvedValue({ ...mockOrder, subtotal: 150, shippingCost: 0, total: 162 } as Order);

      const result = await service.create('user-1', createDto as any);

      expect(result.shippingCost).toBe(0);
    });
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const query = { page: 1, limit: 10 };
      const mockOrders = [mockOrder];

      orderRepository.findAndCount.mockResolvedValue([mockOrders as Order[], 1]);

      const result = await service.findAll(query as any);

      expect(result.data).toEqual(mockOrders);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by userId', async () => {
      const query = { page: 1, limit: 10, userId: 'user-1' };

      orderRepository.findAndCount.mockResolvedValue([[mockOrder] as Order[], 1]);

      await service.findAll(query as any);

      expect(orderRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-1' }),
        }),
      );
    });

    it('should filter by status', async () => {
      const query = { page: 1, limit: 10, status: OrderStatus.PENDING };

      orderRepository.findAndCount.mockResolvedValue([[mockOrder] as Order[], 1]);

      await service.findAll(query as any);

      expect(orderRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: OrderStatus.PENDING }),
        }),
      );
    });
  });

  describe('findByUser', () => {
    it('should return orders for specific user', async () => {
      const query = { page: 1, limit: 10 };

      orderRepository.findAndCount.mockResolvedValue([[mockOrder] as Order[], 1]);

      await service.findByUser('user-1', query as any);

      expect(orderRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-1' }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      orderRepository.findOne.mockResolvedValue(mockOrder as Order);

      const result = await service.findOne('order-1');

      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        relations: ['items'],
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const updateDto = { notes: 'Updated notes' };

      orderRepository.findOne.mockResolvedValue(mockOrder as Order);
      orderRepository.save.mockResolvedValue({ ...mockOrder, ...updateDto } as Order);

      const result = await service.update('order-1', updateDto as any);

      expect(result.notes).toBe('Updated notes');
    });

    it('should throw NotFoundException if order not found', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a pending order', async () => {
      orderRepository.findOne.mockResolvedValue(mockOrder as Order);
      orderRepository.save.mockResolvedValue({ ...mockOrder, status: OrderStatus.CANCELLED } as Order);

      const result = await service.cancel('order-1');

      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should throw BadRequestException if order is already delivered', async () => {
      orderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.DELIVERED,
      } as Order);

      await expect(service.cancel('order-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if order is already cancelled', async () => {
      orderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      } as Order);

      await expect(service.cancel('order-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getOrderStats', () => {
    it('should return order statistics', async () => {
      orderRepository.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(20) // pending
        .mockResolvedValueOnce(30) // processing
        .mockResolvedValueOnce(25) // shipped
        .mockResolvedValueOnce(20) // delivered
        .mockResolvedValueOnce(5); // cancelled

      const result = await service.getOrderStats();

      expect(result).toEqual({
        total: 100,
        pending: 20,
        processing: 30,
        shipped: 25,
        delivered: 20,
        cancelled: 5,
      });
    });
  });
});
