'use client'

import { LogOut } from "lucide-react"
import { useState, useEffect } from 'react'
import { SideCart } from './SideCart'
import { AnnouncementBar } from './AnnouncementBar'
import { Header } from './Header'
import { CartItem } from '../types/CartItem'
import { SocialIcons } from './SocialIcons'
import { Footer } from './Footer'

export function AccountPageComponent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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

  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f2]"> {/* Alterado para bg-[#f2f2f2] */}
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />

      <main className="flex-grow flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-12"> {/* Aumentado o espaçamento entre as seções */}
          <div>
            <h2 className="text-xl font-semibold mb-2">ACCOUNT</h2>
            <button 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center"
              onClick={() => {/* Add logout functionality here */}}
            >
              <LogOut className="mr-2 h-4 w-4" /> 
              <span className="text-sm">LOG OUT</span>
            </button>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">ORDER HISTORY</h2>
            <p className="text-sm text-gray-600">YOU HAVEN'T PLACED ANY ORDERS YET.</p>
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

export { AccountPageComponent as AccountPage };