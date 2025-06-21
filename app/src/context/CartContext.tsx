import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, getCart, addToCart as utilAddToCart, removeFromCart as utilRemoveFromCart, updateCartItemQuantity as utilUpdateQuantity, clearCart as utilClearCart } from '../utils/cartUtils';
import api from '@/services/api';

export interface CartItem {
  cart_item_id: number;
  productId: number;
  sizeId: number;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
  currency_code?: string;
  category_name?: string;
}

interface InitialCartItemData {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image?: string;
  currency_code?: string; // Essential for GA4 purchase event
  category_name?: string; // Essential for GA4 item_category
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addToCart: (itemData: InitialCartItemData) => Promise<void>;
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

  const handleAddToCart = async (itemDataToAdd: InitialCartItemData) => {
    console.log("CartContext: handleAddToCart called with initial item data:", itemDataToAdd);
    try {
      const response = await api.post('/cart/create', {
        product_id: itemDataToAdd.productId,
        size: itemDataToAdd.size,
        quantity: itemDataToAdd.quantity,
      });

      console.log("CartContext: RAW API Response for /cart/create:", response);

      if (response.status === 201 && response.data?.data?.id && response.data?.data?.size_id !== undefined) {
        const backendCartItem = response.data.data;

        const createdCartItemForState: CartItem = {
          cart_item_id: backendCartItem.id,
          productId: backendCartItem.product_id,
          sizeId: backendCartItem.size_id,
          name: itemDataToAdd.name,
          price: itemDataToAdd.price,
          quantity: backendCartItem.quantity,
          size: itemDataToAdd.size,
          image: itemDataToAdd.image || '',
          currency_code: itemDataToAdd.currency_code, // Essential for GA4 purchase event
          category_name: itemDataToAdd.category_name, // Essential for GA4 item_category
        };

        console.log("CartContext: Object prepared to be added to state:", createdCartItemForState);

        setCartItems(prevItems => {
          const existingItemIndex = prevItems.findIndex(
            item => item.productId === createdCartItemForState.productId && item.sizeId === createdCartItemForState.sizeId
          );
          if (existingItemIndex > -1) {
            const updatedItems = [...prevItems];
            updatedItems[existingItemIndex].quantity += createdCartItemForState.quantity;
            updatedItems[existingItemIndex].cart_item_id = createdCartItemForState.cart_item_id;
            console.log("CartContext: Updated quantity for existing item in state.");
            return updatedItems;
          } else {
            console.log("CartContext: Added new item to state.");
            return [...prevItems, createdCartItemForState];
          }
        });

      } else {
        const errorReason = !response.data?.data?.id ? "missing 'id'" : !response.data?.data?.size_id ? "missing 'size_id'" : "unknown reason";
        console.error(`CartContext: Failed to add item via API. Response status: ${response.status}, Reason: ${errorReason}. Response data:`, response.data);
        throw new Error(`Failed to add item to cart on server (${errorReason}).`);
      }
    } catch (error) {
      console.error("CartContext: Error in handleAddToCart API call:", error);
      if ((error as any).response?.data?.error) {
         throw new Error((error as any).response.data.error);
      }
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