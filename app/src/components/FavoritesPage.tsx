// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// GA4 gtag declaration
declare global {
  function gtag(...args: any[]): void;
}
import { Header } from './Header';
import { Footer } from './Footer';
import { AnnouncementBar } from './AnnouncementBar';
import { SideCart } from "./SideCart";
import { useCart } from '../context/CartContext';
import { Button } from "@/components/ui/button";
import api from '../services/api';
import { Heart, ShoppingCart, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

// Interface for a single favorite product
interface FavoriteProduct {
    product_id: number;
    product_name: string;
    product_price: number;
    image_category_id: number; // Corrected: No longer expecting image_url directly
}

export function FavoritesPage() {
    const { isCartOpen, setIsCartOpen, cartItems, setCartItems } = useCart();
    const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [productImages, setProductImages] = useState<{[key: number]: string}>({}); // To store image URLs

    const navigate = useNavigate();

    // Fire GA4 page_view event for favorites page
    useEffect(() => {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: 'My Favorites',
                page_location: window.location.href,
                page_path: '/favorites'
            });

            console.log('GA4 page_view event fired for favorites page:', {
                page_title: 'My Favorites',
                page_location: window.location.href,
                page_path: '/favorites'
            });
        }
    }, []);

    useEffect(() => {
        const fetchFavorites = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get('/favorites/read');
                if (response.data && response.data.data) {
                    setFavorites(response.data.data);
                    
                    // Fire GA4 view_item_list event for favorites
                    if (typeof gtag !== 'undefined' && response.data.data.length > 0) {
                        const items = response.data.data.map((product: FavoriteProduct, index: number) => ({
                            item_id: product.product_id.toString(),
                            item_name: product.product_name,
                            price: product.product_price,
                            item_category: 'Apparel',
                            index: index,
                            currency: 'USD'
                        }));

                        gtag('event', 'view_item_list', {
                            item_list_id: 'user_favorites',
                            item_list_name: 'User Favorites',
                            items: items
                        });

                        console.log('GA4 view_item_list event fired for favorites:', {
                            item_list_id: 'user_favorites',
                            item_list_name: 'User Favorites',
                            items_count: items.length
                        });
                    }
                } else {
                    setFavorites([]);
                }
            } catch (err) {
                const message = err.response?.data?.error || err.message || "Failed to load favorites.";
                console.error("Error fetching favorites:", message, err);
                setError(message);
            } finally {
                // Keep loading true until images are also fetched
            }
        };

        fetchFavorites();
    }, []);

    // New useEffect to fetch images, similar to HomePage
    useEffect(() => {
        const fetchAllImages = async () => {
            if (favorites.length === 0) {
                setIsLoading(false); // No favorites, stop loading
                return;
            }

            const imageIds = favorites
                .map(fav => fav.image_category_id)
                .filter((id, index, self) => id && self.indexOf(id) === index); // Get unique, non-null IDs

            if (imageIds.length === 0) {
                 setIsLoading(false); // No images to fetch, stop loading
                 return;
            }

            try {
                const imagePromises = imageIds.map(id => api.get(`/image-category/read/${id}`));
                const imageResponses = await Promise.all(imagePromises);

                const newImages = {};
                imageResponses.forEach((response, index) => {
                    if (response.data && response.data.data) {
                        newImages[imageIds[index]] = response.data.data.url;
                    }
                });
                setProductImages(newImages);
            } catch (err) {
                console.error("Error fetching one or more images:", err);
                // Even if images fail, we can still display the content
            } finally {
                setIsLoading(false); // Stop loading after images are processed
            }
        };
        
        fetchAllImages();
    }, [favorites]);

    const handleToggleFavorite = async (productId: number, isCurrentlyFavorite: boolean) => {
        const originalFavorites = [...favorites];

        // Optimistic UI update - remove from favorites list immediately
        if (isCurrentlyFavorite) {
            setFavorites(favorites.filter(fav => fav.product_id !== productId));
        }

        try {
            if (isCurrentlyFavorite) {
                await api.delete(`/favorites/delete/${productId}`);
            } else {
                await api.post('/favorites/create', { product_id: productId });
            }
        } catch (error) {
            console.error('Failed to update favorite status:', error);
            // Revert UI on error
            setFavorites(originalFavorites);
        }
    };

    const handleProductClick = (productId: string) => {
        navigate(`/product/${productId}`);
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center py-10">Loading your favorite products...</div>;
        }
        if (error) {
            return <div className="text-center text-red-500 py-10">Error: {error}</div>;
        }
        if (!isLoading && favorites.length === 0) {
            return (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                    <p className="text-gray-600">You haven't added any products to your favorites yet.</p>
                </div>
            );
        }

        return (
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((product) => (
                    <ProductCard
                        key={product.product_id}
                        title={product.product_name}
                        imageUrl={productImages[product.image_category_id] || 'default_product_image.png'}
                        price={product.product_price}
                        productId={product.product_id.toString()}
                        isFavorite={true} // Always true since these are favorites
                        onToggleFavorite={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(product.product_id, true);
                        }}
                        onClick={() => handleProductClick(product.product_id.toString())}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
            <AnnouncementBar />
            <Header onCartClick={() => setIsCartOpen(true)} />

            <main className="flex-grow container mx-auto px-4 pt-32 sm:pt-36 pb-24 sm:pb-32 flex flex-col items-center">
                <div className="w-full max-w-6xl mx-auto space-y-8">
                    {/* Page Title */}
                    <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
                        <h1 className="text-3xl md:text-4xl font-extrabold font-aleo text-gray-900 flex items-center justify-center gap-3">
                            Favorites
                        </h1>
                    </div>
                    {renderContent()}   
                </div>
            </main>

            <Footer />

            <SideCart
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                items={cartItems}
                setItems={setCartItems}
            />
        </div>
    );
} 