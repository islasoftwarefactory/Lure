import React from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

export const getCart = (): CartItem[] => {
  return JSON.parse(localStorage.getItem('cart') || '[]');
};

export const addToCart = (newItem: CartItem): CartItem[] => {
  const currentCart = getCart();
  
  const existingItemIndex = currentCart.findIndex(
    (item: CartItem) => item.id === newItem.id && item.size === newItem.size
  );

  if (existingItemIndex >= 0) {
    currentCart[existingItemIndex].quantity += newItem.quantity;
  } else {
    currentCart.push(newItem);
  }

  localStorage.setItem('cart', JSON.stringify(currentCart));
  return getCart();
};

export const removeFromCart = (id: string, size: string): CartItem[] => {
  const currentCart = getCart();
  const updatedCart = currentCart.filter(
    (item) => !(item.id === id && item.size === size)
  );
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  return getCart();
};

export const updateCartItemQuantity = (id: string, size: string, quantity: number): CartItem[] => {
  const currentCart = getCart();
  const updatedCart = currentCart.map((item) =>
    item.id === id && item.size === size
      ? { ...item, quantity: Math.max(1, quantity) }
      : item
  );
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  return getCart();
};

export const clearCart = (): CartItem[] => {
  localStorage.setItem('cart', '[]');
  return getCart();
};

export const addToCartAndShow = (
  newItem: CartItem,
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>,
  setIsCartOpen: (isOpen: boolean) => void
): void => {
  const updatedCart = addToCart(newItem);
  setCartItems(updatedCart);
  setIsCartOpen(true);
}; 