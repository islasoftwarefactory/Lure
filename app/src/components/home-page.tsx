'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, ReactNode, useEffect } from 'react'
import { SideCart } from "./SideCart.tsx"
import hoodieImage from '../assets/icons/pieces/hoodie.png'
import { AnnouncementBar } from './AnnouncementBar'
import { Footer } from './Footer'
import { useNavigate } from 'react-router-dom';
import { Header } from './Header'
import { SocialIcons } from './SocialIcons'
import api from '../services/api';

export function HomePage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAndGetAnonymousToken = async () => {
      console.log('🔍 Iniciando verificação de token');
      const existingToken = localStorage.getItem('jwt_token');

      if (!existingToken) {
        try {
          console.log('📡 Tentando obter token anônimo...');
          const response = await api.get('/auth/anonymous-token');
          console.log('📥 Resposta completa:', response);

          if (response.data && response.data.token) {
            console.log('✅ Token recebido com sucesso');
            localStorage.setItem('jwt_token', response.data.token);
          } else {
            console.error('⚠️ Resposta sem token:', response.data);
          }
        } catch (error) {
          console.error('❌ Erro ao obter token:', {
            message: error.message,
            response: error.response,
            config: error.config
          });
        }
      } else {
        console.log('✅ Token existente encontrado');
      }
    };

    checkAndGetAnonymousToken();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />
      
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Welcome to the Store</h1>
            <p>Products will be loaded soon...</p>
          </div>
        </div>
      </main>

      <Footer />

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