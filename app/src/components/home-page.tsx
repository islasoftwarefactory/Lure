'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, ReactNode } from 'react'
import { SideCart } from "./SideCart.tsx"
import hoodieImage from '../assets/icons/pieces/hoodie.png'
import { AnnouncementBar } from './AnnouncementBar'
import { Footer } from './Footer'
import { useNavigate } from 'react-router-dom';
import { Header } from './Header'
import { SocialIcons } from './SocialIcons'
import ProductCard from "@/components/ProductCard"

export function HomePage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  // ==================== CHAMADAS DE API COMENTADAS ====================

  // 1. Autenticação Anônima
  // useEffect(() => {
  //   const checkAndGetAnonymousToken = async () => {
  //     const existingToken = localStorage.getItem('jwt_token');
  //     
  //     if (!existingToken) {
  //       try {
  //         const response = await api.get('/auth/anonymous-token');
  //         localStorage.setItem('jwt_token', response.data.token);
  //       } catch (error) {
  //         console.error('Erro ao gerar token:', error);
  //       }
  //     }
  //   };
  //   checkAndGetAnonymousToken();
  // }, []);

  // 2. Busca de Produtos
  // const { data: productsData, isLoading } = useQuery({
  //   queryKey: ['products'],
  //   queryFn: async () => {
  //     const currentToken = localStorage.getItem('jwt_token');
  //     const config = {
  //       headers: { Authorization: `Bearer ${currentToken}` }
  //     };
  //     const response = await api.get('/product/read/all', config);
  //     return response.data;
  //   },
  //   staleTime: 1000 * 60 * 5 // Cache de 5 minutos
  // });
  
  const isLoading = false;
  const currentProduct = null;

  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />
      
      <main className="flex-grow flex items-center justify-center px-4 py-8 pt-[180px]">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProductCard
            title="Hoodie Preto"
            subtitle="Edição Limitada"
            imageUrl={hoodieImage}
            isLimitedEdition={true}
            colorVariant="#000000"
          />
          <ProductCard
            title="Hoodie Branco"
            subtitle="Clássico"
            imageUrl={hoodieImage}
            colorVariant="#FFFFFF"
          />
          <ProductCard
            title="Hoodie Vermelho"
            subtitle="Nova Coleção"
            imageUrl={hoodieImage}
            colorVariant="#FF0000"
          />
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