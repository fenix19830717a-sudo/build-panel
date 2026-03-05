import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartService } from './cart.service';
import { Cart, CartItem } from './entities/cart.entity';
import { ProductsService } from '../products/products.service';
import { NotFoundException } from '@nestjs/common';

const createMockRepository = <T>(): jest.Mocked<Repository<T>> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
} as any);

describe('CartService', () => {
  let service: CartService;
  let cartRepository: jest.Mocked<Repository<Cart>>;
  let cartItemRepository: jest.Mocked<Repository<CartItem>>;
  let productsService: jest.Mocked<ProductsService>;

  const mockProduct = {
    id: 'product-1',
    name: 'Test Product',
    price: 99.99,
    images: ['image1.jpg'],
  };

  const mockCartItem = {
    id: 'item-1',
    cartId: 'cart-1',
    productId: 'product-1',
    quantity: 2,
    attributes: { size: 'M' },
  };

  const mockCart = {
    id: 'cart-1',
    userId: 'user-1',
    sessionId: null,
    items: [mockCartItem],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(Cart),
          useValue: createMockRepository<Cart>(),
        },
        {
          provide: getRepositoryToken(CartItem),
          useValue: createMockRepository<CartItem>(),
        },
        {
          provide: ProductsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get(getRepositoryToken(Cart));
    cartItemRepository = module.get(getRepositoryToken(CartItem));
    productsService = module.get(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrCreateCart', () => {
    it('should return existing cart by userId', async () => {
      cartRepository.findOne.mockResolvedValue(mockCart as Cart);

      const result = await service.getOrCreateCart('user-1');

      expect(cartRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        relations: ['items'],
      });
      expect(result).toEqual(mockCart);
    });

    it('should return existing cart by sessionId', async () => {
      cartRepository.findOne.mockResolvedValue(mockCart as Cart);

      const result = await service.getOrCreateCart(undefined, 'session-1');

      expect(cartRepository.findOne).toHaveBeenCalledWith({
        where: { sessionId: 'session-1' },
        relations: ['items'],
      });
    });

    it('should create new cart if not found', async () => {
      cartRepository.findOne.mockResolvedValue(null);
      cartRepository.create.mockReturnValue({ items: [] } as Cart);
      cartRepository.save.mockResolvedValue(mockCart as Cart);

      const result = await service.getOrCreateCart('user-1');

      expect(cartRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        sessionId: undefined,
        items: [],
      });
      expect(result).toEqual(mockCart);
    });
  });

  describe('addItem', () => {
    it('should add new item to cart', async () => {
      const addToCartDto = {
        productId: 'product-1',
        quantity: 1,
        attributes: { size: 'L' },
      };

      cartRepository.findOne.mockResolvedValue({ ...mockCart, items: [] } as Cart);
      productsService.findOne.mockResolvedValue(mockProduct as any);
      cartItemRepository.create.mockReturnValue(mockCartItem as CartItem);
      cartItemRepository.save.mockResolvedValue(mockCartItem as CartItem);

      await service.addItem('user-1', undefined, addToCartDto as any);

      expect(cartItemRepository.create).toHaveBeenCalledWith({
        cartId: 'cart-1',
        productId: 'product-1',
        quantity: 1,
        attributes: { size: 'L' },
      });
    });

    it('should increment quantity for existing item with same attributes', async () => {
      const addToCartDto = {
        productId: 'product-1',
        quantity: 1,
        attributes: { size: 'M' },
      };

      cartRepository.findOne.mockResolvedValue(mockCart as Cart);
      productsService.findOne.mockResolvedValue(mockProduct as any);
      cartItemRepository.save.mockResolvedValue({ ...mockCartItem, quantity: 3 } as CartItem);

      await service.addItem('user-1', undefined, addToCartDto as any);

      expect(cartItemRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 3 }),
      );
    });
  });

  describe('updateItem', () => {
    it('should update item quantity', async () => {
      cartRepository.findOne.mockResolvedValue(mockCart as Cart);
      cartItemRepository.save.mockResolvedValue({ ...mockCartItem, quantity: 5 } as CartItem);

      await service.updateItem('user-1', undefined, 'item-1', { quantity: 5 } as any);

      expect(cartItemRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 5 }),
      );
    });

    it('should remove item if quantity is 0', async () => {
      cartRepository.findOne.mockResolvedValue(mockCart as Cart);

      await service.updateItem('user-1', undefined, 'item-1', { quantity: 0 } as any);

      expect(cartItemRepository.remove).toHaveBeenCalledWith(mockCartItem);
    });

    it('should throw NotFoundException if item not found', async () => {
      cartRepository.findOne.mockResolvedValue({ ...mockCart, items: [] } as Cart);

      await expect(
        service.updateItem('user-1', undefined, 'item-1', { quantity: 5 } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      cartRepository.findOne.mockResolvedValue(mockCart as Cart);

      await service.removeItem('user-1', undefined, 'item-1');

      expect(cartItemRepository.remove).toHaveBeenCalledWith(mockCartItem);
    });

    it('should throw NotFoundException if item not found', async () => {
      cartRepository.findOne.mockResolvedValue({ ...mockCart, items: [] } as Cart);

      await expect(service.removeItem('user-1', undefined, 'item-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', async () => {
      cartRepository.findOne.mockResolvedValue(mockCart as Cart);

      await service.clearCart('user-1');

      expect(cartItemRepository.remove).toHaveBeenCalledWith([mockCartItem]);
    });
  });

  describe('getCart', () => {
    it('should return cart with product details', async () => {
      cartRepository.findOne.mockResolvedValue(mockCart as Cart);
      productsService.findOne.mockResolvedValue(mockProduct as any);

      const result = await service.getCart('user-1');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('itemCount');
      expect(result.items[0]).toHaveProperty('productName');
      expect(result.items[0]).toHaveProperty('price');
    });

    it('should handle missing product gracefully', async () => {
      cartRepository.findOne.mockResolvedValue(mockCart as Cart);
      productsService.findOne.mockRejectedValue(new NotFoundException());

      const result = await service.getCart('user-1');

      expect(result.items[0].productName).toBe('Unknown Product');
      expect(result.items[0].price).toBe(0);
    });

    it('should calculate total correctly', async () => {
      cartRepository.findOne.mockResolvedValue(mockCart as Cart);
      productsService.findOne.mockResolvedValue(mockProduct as any);

      const result = await service.getCart('user-1');

      expect(result.total).toBe(199.98); // 99.99 * 2
      expect(result.itemCount).toBe(2);
    });
  });

  describe('mergeCarts', () => {
    it('should merge session cart into user cart', async () => {
      const sessionCart = {
        id: 'session-cart',
        userId: null,
        sessionId: 'session-1',
        items: [{ ...mockCartItem, id: 'session-item', quantity: 3 }],
      };

      cartRepository.findOne
        .mockResolvedValueOnce(sessionCart as Cart)
        .mockResolvedValueOnce(mockCart as Cart);
      cartItemRepository.save.mockResolvedValue({} as CartItem);

      await service.mergeCarts('user-1', 'session-1');

      expect(cartRepository.remove).toHaveBeenCalledWith(sessionCart);
    });

    it('should combine quantities for same product', async () => {
      const sessionCartItem = {
        id: 'session-item',
        cartId: 'session-cart',
        productId: 'product-1',
        quantity: 3,
        attributes: { size: 'M' },
      };

      const sessionCart = {
        id: 'session-cart',
        userId: null,
        sessionId: 'session-1',
        items: [sessionCartItem],
      };

      cartRepository.findOne
        .mockResolvedValueOnce(sessionCart as Cart)
        .mockResolvedValueOnce(mockCart as Cart);
      cartItemRepository.save.mockResolvedValue({} as CartItem);

      await service.mergeCarts('user-1', 'session-1');

      // Original quantity 2 + session quantity 3 = 5
      expect(cartItemRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 5 }),
      );
    });
  });
});
