'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, ReactNode, useEffect } from 'react'
import { SideCart } from "./SideCart.tsx"
import { AnnouncementBar } from './AnnouncementBar'
import { Footer } from './Footer'
import { useNavigate } from 'react-router-dom';
import { Header } from './Header'
import { SocialIcons } from './SocialIcons'
import ProductCard from "@/components/ProductCard"
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '@/services/api';

interface ImageCategory {
  id: number;
  name: string;
  url: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  inventory: number;
  category_id: number;
  gender_id: number;
  size_id: number;
  image_category_id: number;
}

export function HomePage() {
  const { isCartOpen, setIsCartOpen, cartItems, setCartItems } = useCart();
  const navigate = useNavigate();
  const { token, getAnonymousToken } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<Record<number, string>>({});

  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) {
        console.log("No token detected, attempting to fetch anonymous token...");
        try {
          if (typeof getAnonymousToken === 'function') {
             await getAnonymousToken();
             console.log("Anonymous token fetch initiated (check AuthContext logs for API call).");
          } else {
             console.error("Error: getAnonymousToken is still not a function after fixing import.");
          }
        } catch (err) {
          console.error("Failed to fetch anonymous token:", err);
          setError("Could not initialize session. Please refresh.");
        }
      } else {
        console.log("Existing token found:", token ? token.substring(0, 10) + '...' : 'None');
      }
    };

    initializeAuth();
  }, [token, getAnonymousToken]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (token) {
        console.log("Token available, attempting to fetch products...");
        setIsLoading(true);
        setError(null);
        try {
          const response = await api.get('/product/read/all');
          
          console.log('Product API Response:', response.data);

          if (response.data && response.data.data) {
            setProducts(response.data.data);
          } else {
            setProducts([]);
          }
        } catch (err: any) {
          console.error('Error fetching products:', err);
          if (err.response?.status === 401) {
            setError("Session expired or invalid. Please login again if applicable.");
          } else {
            setError(err.response?.data?.message || 'Error fetching products');
          }
          setProducts([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log("No token available yet, skipping product fetch.");
      }
    };

    fetchProducts();
  }, [token]);

  useEffect(() => {
    const fetchProductImage = async (imageId: number) => {
      try {
        const response = await api.get(`/image-category/read/${imageId}`);
        if (response.data && response.data.data) {
          setProductImages(prev => ({
            ...prev,
            [imageId]: response.data.data.url
          }));
        }
      } catch (error) {
        console.error(`Erro ao buscar imagem ${imageId}:`, error);
      }
    };

    // Busca as imagens para cada produto
    products.forEach(product => {
      if (product.image_category_id && !productImages[product.image_category_id]) {
        fetchProductImage(product.image_category_id);
      }
    });
  }, [products]);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />
      
      <main className="flex-grow flex items-center justify-center px-4 py-8 pt-[180px] pb-96 font-aleo">
        {isLoading ? (
          <div>Loading products...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(products || []).map((product) => {
              return (
                <ProductCard
                  key={product.id}
                  title={product.name}
                  subtitle={product.description}
                  imageUrl={productImages[product.image_category_id]}
                  price={product.price}
                  onClick={() => handleProductClick(product.id.toString())}
                />
              );
            })}
            {!isLoading && !error && products && products.length === 0 && (
               <div>No products found.</div>
            )}
          </div>
        )}
      </main>

      <div className="fixed bottom-4 right-4 z-50">
        <SocialIcons />
      </div>

      <Footer />

      <SideCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        setItems={setCartItems}
      />
    </div>
  )
}