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
import { useQuery } from '@tanstack/react-query';

interface ProductResponse {
  data: {
    id: string;
    name: string;
    price: number;
    description: string;
  }[];
}

export function HomePage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAndGetAnonymousToken = async () => {
      const existingToken = localStorage.getItem('jwt_token');
      console.log('🔍 Token atual:', {
        exists: !!existingToken,
        value: existingToken || 'Nenhum token'
      });

      if (!existingToken) {
        try {
          console.log('📝 Iniciando geração de token anônimo...');
          const response = await api.get('/auth/anonymous-token');
          
          console.log('📦 Token JWT recebido:', {
            token: response.data.token,
            user_id: response.data.user_id,
            type: response.data.type
          });
          
          localStorage.setItem('jwt_token', response.data.token);
          console.log('💾 Token salvo:', response.data.token);
        } catch (error) {
          console.error('❌ Erro ao gerar token:', error);
        }
      }
    };

    checkAndGetAnonymousToken();
  }, []);

  // Fetch products usando o token JWT que já está configurado
  const { data: productsData, isLoading } = useQuery<ProductResponse>({
    queryKey: ['products'],
    queryFn: async () => {
      const currentToken = localStorage.getItem('jwt_token');
      console.log('🔍 Buscando produtos com token:', currentToken);
      
      const config = {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      };
      console.log('📨 Headers da requisição:', config.headers);
      
      const response = await api.get('/product/read/all', config);
      console.log('📦 Produtos recebidos:', response.data);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    onError: (error) => {
      console.error('❌ Erro ao buscar produtos:', error);
    }
  });

  const currentProduct = productsData?.data[0];

  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />
      
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center">
          <div className="w-full md:w-1/2 flex justify-center items-center mb-8 md:mb-0">
            {isLoading ? (
              <div className="w-64 h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black" />
              </div>
            ) : currentProduct ? (
              <motion.div
                className="w-64 h-64 rounded-3xl overflow-hidden cursor-pointer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={hoodieImage}
                  alt={currentProduct.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ) : (
              <div>Nenhum produto encontrado</div>
            )}
          </div>
          <div className="w-full md:w-1/2">
            {currentProduct && (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">{currentProduct.name}</h2>
                <p className="text-xl mb-4">${currentProduct.price}</p>
                <p className="mb-4">{currentProduct.description}</p>
              </div>
            )}
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