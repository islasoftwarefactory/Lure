import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Overlay } from './common/Overlay';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart, CartItem } from '../context/CartContext';

interface SideCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideCart: React.FC<SideCartProps> = ({ isOpen, onClose }) => {
  const cartRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { cartItems, removeFromCart: cartContextRemoveFromCart, updateQuantity: cartContextUpdateQuantity, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleRemove = async (cartItemId: number) => {
    try {
      console.log(`SideCart: Requesting removal of item ${cartItemId}`);
      await cartContextRemoveFromCart(cartItemId);
      console.log(`SideCart: Removal request for ${cartItemId} successful.`);
    } catch (error) {
      console.error(`SideCart: Failed to remove item ${cartItemId}`, error);
    }
  };

  const handleQuantityIncrease = async (item: CartItem) => {
    try {
      const newQuantity = item.quantity + 1;
      console.log(`SideCart: Requesting quantity increase for item ${item.cart_item_id} to ${newQuantity}`);
      await cartContextUpdateQuantity(item.cart_item_id, newQuantity);
      console.log(`SideCart: Quantity increase request for ${item.cart_item_id} successful.`);
    } catch (error) {
      console.error(`SideCart: Failed to increase quantity for item ${item.cart_item_id}`, error);
    }
  };

  const handleQuantityDecrease = async (item: CartItem) => {
    try {
      const newQuantity = item.quantity - 1;
      console.log(`SideCart: Requesting quantity decrease for item ${item.cart_item_id} to ${newQuantity}`);
      await cartContextUpdateQuantity(item.cart_item_id, newQuantity);
      console.log(`SideCart: Quantity decrease/removal request for ${item.cart_item_id} successful.`);
    } catch (error) {
      console.error(`SideCart: Failed to decrease quantity/remove for item ${item.cart_item_id}`, error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout', { state: { items: cartItems } });
  };

  const handleProfileClick = () => {
    if (isLoggedIn) {
      navigate('/account');
    } else {
      navigate('/account/login');
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <Overlay isVisible={isOpen} onClose={onClose} />
          <motion.div
            ref={cartRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="fixed top-[120px] sm:top-[150px] right-2 sm:right-4 left-4 sm:left-[50%] lg:left-[70%] bottom-[100px] sm:bottom-[130px] bg-[#f3f3f3] shadow-lg z-50 overflow-y-auto rounded-2xl sm:rounded-3xl"
          >
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center pt-6 sm:pt-8 lg:pt-12 pb-1 px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-aleo font-bold">Your Cart</h2>
                <button 
                  onClick={onClose} 
                  className="text-sm focus:outline-none hover:bg-gray-300 transition-colors bg-transparent border-none rounded-full w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    aria-hidden="true" 
                    focusable="false" 
                    viewBox="0 0 64 64"
                    className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12"
                  >
                    <path 
                      fill="none" 
                      stroke="#000" 
                      strokeWidth="5" 
                      d="M19 17.61l27.12 27.13m0-27.12L19 44.74"
                    />
                  </svg>
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-1">
                {cartItems.length === 0 ? (
                  <div className="mx-4 sm:mx-6 lg:mx-8 my-8 sm:my-10 lg:my-12 p-6 sm:p-8 lg:p-12 bg-[#ffffff] rounded-xl shadow-sm">
                    <p className="text-gray-400 text-center text-sm sm:text-base">Your cart is currently empty.</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={`${item.cart_item_id}-${item.size}`} className="mx-4 sm:mx-6 lg:mx-8 mb-3 sm:mb-4">
                      <div className="bg-white p-3 sm:p-4 rounded-xl min-h-[140px] sm:h-[160px] flex flex-col sm:flex-row gap-3 sm:gap-0">
                        <div className="w-full sm:w-[120px] h-[80px] sm:h-[120px] bg-[#f2f2f2] rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-[70px] h-[70px] sm:w-[100px] sm:h-[100px] object-contain"
                          />
                        </div>

                        <div className="flex-1 sm:pl-4 flex flex-col justify-between">
                          <div className="text-center sm:text-left">
                            <h3 className="font-aleo font-bold text-sm sm:text-base mb-1 sm:mb-2">{item.name}</h3>
                            <p className="font-aleo font-bold text-sm sm:text-base mb-1">${item.price.toFixed(2)}</p>
                            <p className="font-aleo font-bold text-xs sm:text-sm text-black">Size: {item.size}</p>
                          </div>

                          <div className="flex items-center justify-center sm:justify-start space-x-3 sm:space-x-4 mt-3 sm:mt-0">
                            <button 
                              onClick={() => handleQuantityDecrease(item)}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-[#f2f2f2] rounded-full text-black font-bold hover:bg-gray-200 transition-colors"
                            >
                              <Minus size={12} className="sm:w-[14px] sm:h-[14px]" />
                            </button>
                            <span className="font-aleo font-bold text-sm sm:text-base w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => handleQuantityIncrease(item)}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-[#f2f2f2] rounded-full text-black font-bold hover:bg-gray-200 transition-colors"
                            >
                              <Plus size={12} className="sm:w-[14px] sm:h-[14px]" />
                            </button>
                            <button 
                              onClick={() => handleRemove(item.cart_item_id)}
                              className="ml-2 sm:ml-auto text-gray-500 hover:text-black transition-colors"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 size={18} className="sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Subtotal e Botão de Checkout */}
              {cartItems.length > 0 && (
                <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 bg-[#f3f3f3] mt-auto">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <span className="font-aleo text-black text-lg sm:text-xl lg:text-2xl font-extrabold pl-1 sm:pl-2 lg:pl-3">Subtotal</span>
                    <span className="font-aleo text-black text-lg sm:text-xl lg:text-2xl font-bold">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full py-3 sm:py-4 bg-black text-white font-extrabold text-base sm:text-lg hover:bg-gray-900 transition-colors rounded-full"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { SideCart };