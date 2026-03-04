import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Cart } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      clearAuth: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface CartState {
  cart: Cart | null;
  sessionId: string;
  setCart: (cart: Cart) => void;
  clearCart: () => void;
  getSessionId: () => string;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      setCart: (cart) => set({ cart }),
      clearCart: () => set({ cart: null }),
      getSessionId: () => get().sessionId,
    }),
    {
      name: 'cart-storage',
    }
  )
);

interface UIState {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  searchQuery: string;
  setCartOpen: (isOpen: boolean) => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  searchQuery: '',
  setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
