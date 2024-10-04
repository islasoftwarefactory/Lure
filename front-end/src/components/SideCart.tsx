import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Assume we have an AuthContext

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
    <motion.div
      ref={cartRef}
      initial={{ x: '100%' }}
      animate={{ x: isOpen ? 0 : '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-[80px] right-0 bottom-[80px] w-64 bg-[#f3f4f6] shadow-lg z-50 overflow-y-auto"
    >
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center py-1 px-2 border-b">
          <h2 className="text-xs font-bold">Cart</h2>
          <button onClick={onClose} className="text-sm">&times;</button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-1">
          {items.map((item) => (
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
          ))}
        </div>
        
        <div className="py-1 px-2 border-t">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-xs">Total:</span>
            <span className="font-bold text-xs">${calculateTotal().toFixed(2)}</span>
          </div>
          <button 
            onClick={handleCheckout}
            className="w-full bg-black text-white py-1 rounded text-xs"
          >
            Checkout
          </button>
        </div>
        
        <div className="py-1 px-2 border-b">
          <button 
            onClick={handleProfileClick}
            className="w-full bg-gray-200 text-black py-1 rounded text-xs"
          >
            {isLoggedIn ? 'Account' : 'Login'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};