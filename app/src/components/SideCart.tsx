import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Assume we have an AuthContext
import { Overlay } from './common/Overlay';

interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

interface SideCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  setItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

export const SideCart: React.FC<SideCartProps> = ({ isOpen, onClose, items, setItems }) => {
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
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, change: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
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
                    <div key={item.id} className="mb-2 pb-2">
                      <div className="flex mb-1">
                        <div className="w-1/2 pr-1">
                          <img src={item.image} alt={item.name} className="w-full h-auto object-cover" />
                        </div>
                        <div className="w-1/2 pl-1">
                          <h3 className="font-bold text-xs">{item.name}</h3>
                          <p className="text-xs"><span className="font-bold">Size:</span> {item.size}</p>
                          <p className="text-xs"><span className="font-bold">Price:</span> ${item.price.toFixed(2)}</p>
                          <div className="flex items-center mt-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-xs">-</button>
                            <span className="mx-2 text-xs">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-xs">+</button>
                          </div>
                          <button 
                            onClick={() => removeItem(item.id)} 
                            className="w-full mt-1 bg-black text-white px-1 py-1 rounded text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};