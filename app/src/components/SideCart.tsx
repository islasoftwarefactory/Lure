import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Overlay } from './common/Overlay';
import { Trash2 } from 'lucide-react';
import { CartItem, removeFromCart, updateCartItemQuantity } from '../utils/cartUtils';

interface SideCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  setItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const SideCart: React.FC<SideCartProps> = ({ isOpen, onClose, items, setItems }) => {
  const cartRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth(); // Get the login status from AuthContext

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

  const removeItem = (id: string) => {
    const updatedCart = removeFromCart(id, '');
    setItems(updatedCart);
  };

  const updateQuantity = (id: string, change: number) => {
    const item = items.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      const updatedCart = updateCartItemQuantity(id, item.size, newQuantity);
      setItems(updatedCart);
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout', { state: { items } });
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
            className="fixed top-[130px] right-4 left-[70%] bottom-[130px] bg-[#f3f3f3] shadow-lg z-50 overflow-y-auto rounded-3xl"
          >
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center pt-12 pb-1 px-8">
                <h2 className="text-4xl font-aleo font-bold">Your Cart</h2>
                <button 
                  onClick={onClose} 
                  className="text-sm focus:outline-none hover:bg-gray-300 transition-colors bg-transparent border-none rounded-full w-12 h-12 flex items-center justify-center"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    aria-hidden="true" 
                    focusable="false" 
                    viewBox="0 0 64 64"
                    className="w-12 h-12"
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
                {items.length === 0 ? (
                  <div className="mx-8 my-12 p-12 bg-[#ffffff] rounded-xl shadow-sm">
                    <p className="text-gray-400 text-center">Your cart is currently empty.</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="mx-8 mb-4">
                      <div className="bg-white p-4 rounded-xl h-[160px] flex">
                        <div className="w-[120px] h-[120px] bg-[#f2f2f2] rounded-lg flex items-center justify-center">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-[100px] h-[100px] object-contain"
                          />
                        </div>

                        <div className="flex-1 pl-4 flex flex-col justify-between">
                          <div>
                            <h3 className="font-aleo font-bold text-base mb-2">{item.name}</h3>
                            <p className="font-aleo font-bold text-base mb-1">${item.price.toFixed(2)}</p>
                            <p className="font-aleo font-bold text-sm text-black">Size: {item.size}</p>
                          </div>

                          <div className="flex items-center space-x-4">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)} 
                              className="w-8 h-8 flex items-center justify-center bg-[#f2f2f2] rounded-full text-black font-bold hover:bg-gray-200 transition-colors"
                            >
                              -
                            </button>
                            <span className="font-aleo font-bold text-base w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)} 
                              className="w-8 h-8 flex items-center justify-center bg-[#f2f2f2] rounded-full text-black font-bold hover:bg-gray-200 transition-colors"
                            >
                              +
                            </button>
                            <button 
                              onClick={() => removeItem(item.id)} 
                              className="ml-auto text-gray-500 hover:text-black transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Subtotal e Botão de Checkout */}
              {items.length > 0 && (
                <div className="px-8 py-6 bg-[#f3f3f3] mt-auto">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-aleo text-black text-2xl font-extrabold pl-3">Subtotal</span>
                    <span className="font-aleo text-black text-2xl font-bold">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full py-4 bg-black text-white font-extrabold text-lg hover:bg-gray-900 transition-colors rounded-full"
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