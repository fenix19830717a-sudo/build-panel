export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number;
  stock: number;
  isActive: boolean;
  images: string[];
  sku: string;
  attributes: Record<string, any>;
  viewCount: number;
  rating: number;
  reviewCount: number;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
  children?: Category[];
  parent?: Category;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  total: number;
  attributes?: Record<string, any>;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
  attributes?: Record<string, any>;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone: string;
  };
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'customer';
  isActive: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
