'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, ReactNode, useEffect } from 'react'
import { SideCart } from "./SideCart.tsx"
import hoodieImage from '../assets/icons/pieces/hoodie_black.jpeg'
import { AnnouncementBar } from './AnnouncementBar'
import { Footer } from './Footer'
import { useNavigate } from 'react-router-dom';
import { Header } from './Header'
import { SocialIcons } from './SocialIcons'
import ProductCard from "@/components/ProductCard"
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';

export function HomePage() {
  const { isCartOpen, setIsCartOpen, cartItems, setCartItems } = useCart();
  const navigate = useNavigate();
  const { token, getAnonymousToken } = useAuth();

  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) {
        await getAnonymousToken();
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (token) {
        try {
          const response = await fetch('/api/products', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          // Processar produtos...
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      }
    };

    fetchProducts();
  }, [token]);

  const isLoading = false;
  const currentProduct = null;

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />
      
      <main className="flex-grow flex items-center justify-center px-4 py-8 pt-[180px] pb-96 font-aleo">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProductCard
            title="Hoodie Preto"
            subtitle="Edição Limitada"
            imageUrl={hoodieImage}
            isLimitedEdition={true}
            colorVariant="#000000"
            onClick={() => handleProductClick('hoodie-preto')}
          />
          <ProductCard
            title="Hoodie Branco"
            subtitle="Clássico"
            imageUrl={hoodieImage}
            colorVariant="#FFFFFF"
            onClick={() => handleProductClick('hoodie-branco')}
          />
          <ProductCard
            title="Hoodie Vermelho"
            subtitle="Nova Coleção"
            imageUrl={hoodieImage}
            colorVariant="#FF0000"
            onClick={() => handleProductClick('hoodie-vermelho')}
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