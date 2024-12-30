import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem } from '../utils/cartUtils';

interface CartContextType {
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  return (
    <CartContext.Provider value={{ isCartOpen, setIsCartOpen, cartItems, setCartItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 