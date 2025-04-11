import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, ShoppingCart, Menu } from 'lucide-react';
import Logo from '../assets/icons/home/Logo.svg?react';
import { AnnouncementBar } from './AnnouncementBar';

interface HeaderProps {
  onCartClick: () => void;
  iconsPosition?: number; // Nova prop para controlar a posição dos ícones
}

export const Header: React.FC<HeaderProps> = ({ 
  onCartClick, 
  iconsPosition = 100
}) => {
  return (  
    <>
      <AnnouncementBar />
      <header className="fixed top-8 left-0 right-0 z-50 p-4 h-[100px] flex justify-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between w-[98%] py-6 px-12 rounded-[40px] bg-white h-full shadow-xl border border-black/10"
        >
          <div className="w-16 flex items-center justify-center pl-4">
            <Link to="/">
              <Logo className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
          </div>
          
          <div style={{ minWidth: `${iconsPosition}px` }}></div>
          
          <div className="flex items-center gap-6 pr-4">
            <button className="text-black" onClick={onCartClick}>
              <ShoppingCart size={28} className="cursor-pointer" />
            </button>
            <Link to="/profile">
              <User size={28} className="cursor-pointer" />
            </Link>
          </div>
        </motion.div>
      </header>
    </>
  );
};