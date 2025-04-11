import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, getCart, addToCart as utilAddToCart, removeFromCart as utilRemoveFromCart, updateCartItemQuantity as utilUpdateQuantity, clearCart as utilClearCart } from '../utils/cartUtils';
import api from '@/services/api';

export interface CartItem {
  id: number;
  cart_item_id: number;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, newQuantity: number) => Promise<void>;
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
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (e) {
      console.error("Failed to parse cart from localStorage", e);
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = async (newItemData: Omit<CartItem, 'cart_item_id'>) => {
    console.log("CartContext: handleAddToCart called with product data:", newItemData);
    try {
      const response = await api.post('/cart/create', {
        product_id: newItemData.id,
        quantity: newItemData.quantity,
        size: newItemData.size
      });

      console.log("CartContext: RAW API Response for /cart/create:", response);
      if (response?.data?.data) {
        console.log("CartContext: API response.data.data:", response.data.data);
      } else {
        console.error("CartContext: API response missing expected structure (response.data.data).");
      }

      if (response.status === 201 && response.data?.data?.id) {
        const backendCartItem = response.data.data;
        const createdCartItem: CartItem = {
          name: newItemData.name,
          price: newItemData.price,
          image: newItemData.image,
          size: newItemData.size,
          quantity: newItemData.quantity,
          id: backendCartItem.product_id || newItemData.id,
          cart_item_id: backendCartItem.id,
        };

        console.log("CartContext: Object prepared to be added to state:", createdCartItem);

        setCartItems(prevItems => [...prevItems, createdCartItem]);
        console.log("CartContext: State updated with new item.");
      } else {
        console.error("CartContext: Failed to add item via API or missing 'id' in response.data.data.", response);
        throw new Error("Failed to add item to cart on server (invalid response or missing ID).");
      }
    } catch (error) {
      console.error("CartContext: Error in handleAddToCart API call:", error);
      throw error;
    }
  };

  const handleRemoveFromCart = async (cartItemIdToRemove: number) => {
    console.log(`CartContext: Attempting to remove cart item ID: ${cartItemIdToRemove}`);
    try {
      const response = await api.delete(`/cart/delete/${cartItemIdToRemove}`);

      if (response.status === 200 || response.status === 204) {
        console.log(`CartContext: Item ${cartItemIdToRemove} deleted via API.`);
        setCartItems(prevItems => prevItems.filter(item => item.cart_item_id !== cartItemIdToRemove));
      } else {
        console.error(`CartContext: Failed to delete item ${cartItemIdToRemove} via API, response:`, response);
        throw new Error("Failed to remove item from cart on server.");
      }
    } catch (error) {
      console.error(`CartContext: Error in handleRemoveFromCart API call for item ${cartItemIdToRemove}:`, error);
      throw error;
    }
  };

  const handleUpdateQuantity = async (cartItemIdToUpdate: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      console.log(`CartContext: Quantity for item ${cartItemIdToUpdate} reached 0, removing item.`);
      await handleRemoveFromCart(cartItemIdToUpdate);
      return;
    }

    console.log(`CartContext: Attempting to update quantity for cart item ID: ${cartItemIdToUpdate} to ${newQuantity}`);
    try {
      const response = await api.put(`/cart/update/${cartItemIdToUpdate}`, {
        quantity: newQuantity
      });

      if (response.status === 200 && response.data.data) {
        console.log(`CartContext: Item ${cartItemIdToUpdate} quantity updated via API.`);
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.cart_item_id === cartItemIdToUpdate
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      } else {
        console.error(`CartContext: Failed to update quantity for item ${cartItemIdToUpdate} via API, response:`, response);
        throw new Error("Failed to update item quantity on server.");
      }
    } catch (error) {
      console.error(`CartContext: Error in handleUpdateQuantity API call for item ${cartItemIdToUpdate}:`, error);
      throw error;
    }
  };

  const handleClearCart = () => {
    localStorage.removeItem('cart');
    setCartItems([]);
    console.log("CartContext: Cart cleared (local).");
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