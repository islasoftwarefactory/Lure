import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

// GA4 gtag declaration
declare global {
  function gtag(...args: any[]): void;
}

interface StickyCartProps {
  product: {
    id: number;
    name: string;
    price: number;
    currency_code?: string;
    category_name?: string;
  };
  selectedSize: string;
  productImage: string;
  isVisible: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export const StickyCart: React.FC<StickyCartProps> = ({
  product,
  selectedSize,
  productImage,
  isVisible,
  onAddToCart,
  onBuyNow
}) => {
  const [quantity, setQuantity] = useState(1);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const { cartItems, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleAddToCartClick = () => {
    onAddToCart();
    
    // Fire GA4 add_to_cart event
    if (typeof gtag !== 'undefined') {
      const totalValue = product.price * quantity;
      
      gtag('event', 'add_to_cart', {
        currency: product?.currency_code,
        value: totalValue,
        items: [
          {
            item_id: product.id.toString(),
            item_name: product.name,
            price: product.price,
            quantity: quantity,
            item_variant: selectedSize,
            item_category: product.category_name,
            currency: product.currency_code
          }
        ]
      });
    }
  };

  const handleBuyNowClick = () => {
    onBuyNow();
    
    // Fire GA4 begin_checkout event
    if (typeof gtag !== 'undefined') {
      const totalValue = product.price * quantity;
      
      gtag('event', 'begin_checkout', {
        currency: product?.currency_code,
        value: totalValue,
        items: [
          {
            item_id: product.id.toString(),
            item_name: product.name,
            price: product.price,
            quantity: quantity,
            item_variant: selectedSize,
            item_category: product.category_name,
            currency: product.currency_code
          }
        ]
      });
    }
  };

  const calculateCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-gray-200 shadow-2xl"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          role="complementary"
          aria-label="Sticky cart"
        >
          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                {/* Product Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    <img 
                      src={productImage} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm truncate">{product.name}</h3>
                    <p className="text-sm text-gray-600">Size: {selectedSize}</p>
                  </div>
                  <div className="text-lg font-bold">${product.price}</div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center border border-gray-300 rounded-full">
                    <button 
                      onClick={() => handleQuantityChange(-1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors rounded-l-full"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => handleQuantityChange(1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors rounded-r-full"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Cart Preview Button */}
                  {cartItems.length > 0 && (
                    <button
                      onClick={() => setIsCartOpen(true)}
                      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label={`Open cart with ${getTotalCartItems()} items`}
                    >
                      <ShoppingCart size={20} />
                      <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getTotalCartItems()}
                      </span>
                    </button>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddToCartClick}
                      className="px-4 py-2 bg-gray-200 text-black font-medium rounded-full hover:bg-gray-300 transition-colors text-sm"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={handleBuyNowClick}
                      className="px-4 py-2 bg-black text-white font-medium rounded-full hover:bg-gray-900 transition-colors text-sm"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                {/* Product Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    <img 
                      src={productImage} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>{selectedSize}</span>
                      <span>•</span>
                      <span>${product.price}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity and Cart */}
                <div className="flex items-center gap-2">
                  {/* Quantity Selector */}
                  <div className="flex items-center border border-gray-300 rounded-full">
                    <button 
                      onClick={() => handleQuantityChange(-1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors rounded-l-full"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-2 py-1 text-sm font-medium min-w-[1.5rem] text-center">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => handleQuantityChange(1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors rounded-r-full"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Cart Preview Button */}
                  {cartItems.length > 0 && (
                    <button
                      onClick={() => setIsCartOpen(true)}
                      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label={`Open cart with ${getTotalCartItems()} items`}
                    >
                      <ShoppingCart size={18} />
                      <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {getTotalCartItems()}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAddToCartClick}
                  className="flex-1 py-2.5 bg-gray-200 text-black font-medium rounded-full hover:bg-gray-300 transition-colors text-sm"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNowClick}
                  className="flex-1 py-2.5 bg-black text-white font-medium rounded-full hover:bg-gray-900 transition-colors text-sm"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 