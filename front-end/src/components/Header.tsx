import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import UserIcon from '../assets/icons/home/UserIcon.svg';
import ShoppingCartIcon from '../assets/icons/home/ShoppingCartIcon.svg';
import LogoSVG from '../assets/icons/home/Logo.svg?react'

interface HeaderProps {
  onCartClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCartClick }) => {
  return (
    <header className="p-4 h-[80px] flex justify-center bg-[#f2f2f2]">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between w-3/4 py-4 px-6 rounded-full bg-white h-full"
      >
            <div className="w-16 flex items-center justify-center">
          <LogoSVG className="h-12 w-12" />
        </div>
        <Link to="/" className="text-5xl font-bold no-underline text-black">ʟᴜʀᴇ</Link>
        <div className="w-16 flex justify-end space-x-3">
          <Link to="/account/login" className="text-black">
            <img src={UserIcon} alt="Profile" className="w-7 h-7 cursor-pointer" />
          </Link>
          <button
            className="text-black"
            onClick={onCartClick}
          >
            <img src={ShoppingCartIcon} alt="Shopping Cart" className="w-7 h-7 cursor-pointer" />
          </button>
        </div>
      </motion.div>
    </header>
  );
};