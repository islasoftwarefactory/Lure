'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, ReactNode, useEffect } from 'react'
import TikTokIcon from '../assets/icons/home/TikTok.svg'
import PinterestIcon from '../assets/icons/home/Pinterest.svg'
import InstagramIcon from '../assets/icons/home/Instagram.svg'
import ContactIcon from '../assets/icons/home/Contact.svg'
import { SideCart } from "./SideCart.tsx"
import hoodieImage from '../assets/icons/pieces/hoodie.png'
import { AnnouncementBar } from './AnnouncementBar'
import { Footer } from './Footer'
import { useNavigate } from 'react-router-dom';
import { Header } from './Header'
import { SocialIcons } from './SocialIcons'

// Definição de tipos para as props do Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

// Definição do tipo para um item do carrinho
interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

// Componente Modal atualizado
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white p-4 rounded-lg relative max-w-sm w-full mx-4"
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-[#f3f4f6] rounded-full text-black hover:bg-gray-200"
          >
            ×
          </button>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

export function HomePage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showSizes, setShowSizes] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L']);
  const [sizeError, setSizeError] = useState('');
  const navigate = useNavigate();

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const validateSize = () => {
    if (!selectedSize) {
      setSizeError('Please select a size');
      return false;
    }
    setSizeError('');
    return true;
  };

  const addToCart = () => {
    if (!validateSize()) return;

    const newItem: CartItem = {
      id: `hoodie-${selectedSize}-${Date.now()}`,
      name: 'Flower Lured Hoodie',
      price: 90,
      size: selectedSize,
      quantity: quantity,
      image: hoodieImage
    };

    setCartItems(prevItems => [...prevItems, newItem]);
    setIsModalOpen(false);
    setIsCartOpen(true);
    
    // Reset modal state
    setSelectedSize('');
    setQuantity(1);
    setSizeError('');
  };

  const handleBuyNow = () => {
    if (!validateSize()) return;

    const item: CartItem = {
      id: `hoodie-${selectedSize}-${Date.now()}`,
      name: 'Flower Lured Hoodie',
      price: 90,
      size: selectedSize,
      quantity: quantity,
      image: hoodieImage
    };

    navigate('/checkout', { state: { items: [item] } });
  };

  // Adicione esta função
  const handleProfileClick = () => {
    navigate('/account/login');
  };

  // Efeito para salvar os itens do carrinho no localStorage
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Efeito para carregar os itens do carrinho do localStorage ao iniciar
  useEffect(() => {
    const savedCartItems = localStorage.getItem('cartItems');
    if (savedCartItems) {
      try {
        const parsedItems = JSON.parse(savedCartItems);
        setCartItems(Array.isArray(parsedItems) ? parsedItems : []);
      } catch (error) {
        console.error('Error parsing cart items:', error);
        setCartItems([]);
      }
    }
  }, []);

  // Modifique a função de seleção de tamanho
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setSizeError('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />
      
      <main className="flex-grow flex items-center px-4">
        <div className="w-1/2 flex justify-center items-center">
          <motion.div
            className="w-64 h-64 rounded-3xl overflow-hidden cursor-pointer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            onClick={() => setIsModalOpen(true)}
          >
            <img
              src={hoodieImage}
              alt="Hoodie"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
        <div className="w-1/2">
          {/* Adicione aqui o conteúdo do lado direito, se necessário */}
        </div>
      </main>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div>
          <img src={hoodieImage} alt="Hoodie" className="w-full h-auto" />
          <h2 className="text-xl font-bold mt-3">Flower Lured</h2>
          <p className="text-base text-gray-600 mt-1">Regular price $90</p>
          
          <div className="mt-3">
            <p className="text-sm font-semibold mb-2">Select Size:</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  className={`px-3 py-1 text-sm rounded-md transition duration-300 ease-in-out ${
                    selectedSize === size
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-black hover:bg-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {sizeError && <p className="text-red-500 text-xs mt-1">{sizeError}</p>}
          </div>

          <div className="mt-3 flex items-center justify-center space-x-4">
            <button onClick={decrementQuantity} className="px-2 py-1 bg-gray-200 rounded text-lg font-bold hover:bg-gray-300 transition duration-300 ease-in-out">-</button>
            <span className="text-lg font-bold">{quantity}</span>
            <button onClick={incrementQuantity} className="px-2 py-1 bg-gray-200 rounded text-lg font-bold hover:bg-gray-300 transition duration-300 ease-in-out">+</button>
          </div>

          <div className="mt-3 space-y-2">
            <button 
              onClick={handleBuyNow}
              className="w-full bg-black text-white px-3 py-2 text-sm rounded hover:bg-gray-800 transition duration-300 ease-in-out hover:shadow-md"
            >
              Buy Now
            </button>
            <button 
              onClick={addToCart}
              className="w-full bg-[#e5e7eb] text-black px-3 py-2 text-sm rounded border border-black hover:bg-gray-200 transition duration-300 ease-in-out hover:shadow-md"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </Modal>

      <Footer />

      {/* Adicione o componente SocialIcons aqui */}
      <div className="fixed bottom-4 right-4 z-50">
        <SocialIcons />
      </div>

      <SideCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        setItems={setCartItems}
      />
    </div>
  )
}