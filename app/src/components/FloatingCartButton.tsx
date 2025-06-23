import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface FloatingCartButtonProps {
  isVisible: boolean;
  onAddToCart: () => void;
  itemCount?: number;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  isVisible,
  onAddToCart,
  itemCount = 0
}) => {
  const { setIsCartOpen, cartItems } = useCart();

  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCartClick = () => {
    if (cartItems.length > 0) {
      setIsCartOpen(true);
    } else {
      onAddToCart();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed bottom-6 right-6 z-[999] lg:bottom-8 lg:right-8"
        >
          <button
            onClick={handleCartClick}
            className="relative w-14 h-14 lg:w-16 lg:h-16 bg-black text-white rounded-full shadow-lg hover:bg-gray-900 transition-colors flex items-center justify-center"
            aria-label={cartItems.length > 0 ? `Open cart with ${getTotalCartItems()} items` : 'Add to cart'}
          >
            {cartItems.length > 0 ? (
              <>
                <ShoppingCart size={24} className="lg:w-7 lg:h-7" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {getTotalCartItems()}
                </span>
              </>
            ) : (
              <Plus size={24} className="lg:w-7 lg:h-7" />
            )}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 