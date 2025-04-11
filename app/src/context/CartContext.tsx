import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, getCart, addToCart as utilAddToCart, removeFromCart as utilRemoveFromCart, updateCartItemQuantity as utilUpdateQuantity, clearCart as utilClearCart } from '../utils/cartUtils';

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(getCart());
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (newItem: CartItem) => {
    const updatedCart = utilAddToCart(newItem);
    setCartItems(updatedCart);
    console.log("CartContext: Item added, cart updated.", updatedCart);
  };

  const handleRemoveFromCart = (id: string, size: string) => {
    const updatedCart = utilRemoveFromCart(id, size);
    setCartItems(updatedCart);
     console.log("CartContext: Item removed, cart updated.", updatedCart);
  };

  const handleUpdateQuantity = (id: string, size: string, quantity: number) => {
    const updatedCart = utilUpdateQuantity(id, size, quantity);
    setCartItems(updatedCart);
     console.log("CartContext: Quantity updated, cart updated.", updatedCart);
  };

  const handleClearCart = () => {
    const updatedCart = utilClearCart();
    setCartItems(updatedCart);
     console.log("CartContext: Cart cleared.", updatedCart);
  };

  const value = {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
    setCartItems
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};