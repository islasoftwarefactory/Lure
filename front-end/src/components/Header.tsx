import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, ShoppingCart } from 'lucide-react'; // Importando os ícones da biblioteca lucide-react
import Logo from '../assets/icons/home/Logo.svg?react';

interface HeaderProps {
  onCartClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCartClick }) => {
  return (
    <header className="fixed top-8 left-0 right-0 z-50 p-4 h-[80px] flex justify-center">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between w-3/4 py-4 px-6 rounded-full bg-white h-full"
      >
        <div className="w-16 flex items-center justify-center">
          <Logo className="h-12 w-12" />
        </div>
        <Link to="/" className="text-5xl font-bold no-underline text-black">ʟᴜʀᴇ</Link>
        <div className="w-16 flex justify-end space-x-3">
          <Link to="/account/login" className="text-black">
            <User size={28} className="cursor-pointer" /> {/* Usando o ícone User da biblioteca lucide-react */}
          </Link>
          <button
            className="text-black"
            onClick={onCartClick}
          >
            <ShoppingCart size={28} className="cursor-pointer" /> {/* Usando o ícone ShoppingCart da biblioteca lucide-react */}
          </button>
        </div>
      </motion.div>
    </header>
  );
};