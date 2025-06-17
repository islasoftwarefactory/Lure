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

interface FavoriteProduct {
  product_id: number;
}

export function HomePage() {
  const { isCartOpen, setIsCartOpen, cartItems, setCartItems } = useCart();
  const navigate = useNavigate();
  const { token, getAnonymousToken } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<Record<number, string>>({});
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

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
    const fetchInitialData = async () => {
      if (token) {
        setIsLoading(true);
        setError(null);
        try {
          const [productsResponse, favoritesResponse] = await Promise.all([
            api.get('/product/read/all'),
            api.get('/favorites/read')
          ]);

          if (productsResponse.data && productsResponse.data.data) {
            setProducts(productsResponse.data.data);
          } else {
            setProducts([]);
          }

          if (favoritesResponse.data && favoritesResponse.data.data) {
            const ids = new Set(favoritesResponse.data.data.map((fav: FavoriteProduct) => fav.product_id));
            setFavoriteIds(ids);
          }

        } catch (err: any) {
          console.error('Error fetching initial data:', err);
          setError(err.response?.data?.message || 'Error fetching data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchInitialData();
  }, [token]);

  useEffect(() => {
    const fetchProductImage = async (imageId: number) => {
      try {
        const response = await api.get(`/image-category/read/${imageId}`);
        if (response.data && response.data.data) {
          setProductImages((prev: Record<number, string>) => ({
            ...prev,
            [imageId]: response.data.data.url
          }));
        }
      } catch (error) {
        console.error(`Erro ao buscar imagem ${imageId}:`, error);
      }
    };

    // Busca as imagens para cada produto
    products.forEach((product: Product) => {
      if (product.image_category_id && !productImages[product.image_category_id]) {
        fetchProductImage(product.image_category_id);
      }
    });
  }, [products]);

  const handleToggleFavorite = (productId: number, isCurrentlyFavorite: boolean) => {
    const originalFavoriteIds = new Set(favoriteIds);

    // Optimistic UI update
    const newFavoriteIds = new Set(favoriteIds);
    if (isCurrentlyFavorite) {
      newFavoriteIds.delete(productId);
    } else {
      newFavoriteIds.add(productId);
    }
    setFavoriteIds(newFavoriteIds);

    // API call
    const apiCall = isCurrentlyFavorite
      ? api.delete(`/favorites/delete/${productId}`)
      : api.post('/favorites/create', { product_id: productId });

    apiCall.catch(error => {
      console.error('Failed to update favorite status:', error);
      // Revert UI on error
      setFavoriteIds(originalFavoriteIds);
      // Optionally show a toast notification to the user
    });
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />
      
      <main className="flex-grow pt-[140px] sm:pt-[160px] lg:pt-[180px] pb-20 sm:pb-32 lg:pb-40 font-aleo">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-lg sm:text-xl text-gray-600">Loading products...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-lg sm:text-xl text-red-600">Error: {error}</div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 text-center mb-8 sm:mb-12 lg:mb-16">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-aleo text-gray-900 mb-4">
                  Featured Products
                </h1>
                <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                  Discover our latest collection of Lure.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 justify-items-center">
                {(products || []).map((product: Product) => {
                  return (
                    <div key={product.id} className="w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[350px]">
                      <ProductCard
                        title={product.name}
                        imageUrl={productImages[product.image_category_id] || '/placeholder-image.jpg'}
                        price={product.price}
                        onClick={() => handleProductClick(product.id.toString())}
                        productId={product.id.toString()}
                        isFavorite={favoriteIds.has(product.id)}
                        onToggleFavorite={() => handleToggleFavorite(product.id, favoriteIds.has(product.id))}
                      />
                    </div>
                  );
                })}
                {!isLoading && !error && products && products.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <div className="text-lg sm:text-xl text-gray-500">No products found.</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
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