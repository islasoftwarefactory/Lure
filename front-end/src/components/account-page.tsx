'use client'

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useState } from 'react'
import googlePayLogo from '../assets/icons/payments/google-pay.svg'
import applePayLogo from '../assets/icons/payments/apple-pay.svg'
import { SideCart } from './SideCart'
import { AnnouncementBar } from './AnnouncementBar'
import { Header } from './Header'
import { CartItem } from '../types/CartItem'

export function AccountPageComponent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  console.log('AccountPage is rendering');

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />

      <main className="flex-grow flex flex-col items-start p-8">
        <div className="w-full max-w-md space-y-8">
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

      <footer className="bg-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <div className="md:justify-self-center">
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Terms and Conditions</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Printing</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Refund Policy</a></li>
            </ul>
          </div>
          <div className="md:justify-self-center">
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><a href="mailto:suporte@lure.contact" className="text-gray-600 hover:text-gray-900">suporte@lure.contact</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Contact Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Shipping and Returns</a></li>
            </ul>
            <div className="mt-6 flex space-x-4">
              <img src={googlePayLogo} alt="Google Pay" className="w-12 h-8 object-contain" />
              <img src={applePayLogo} alt="Apple Pay" className="w-12 h-8 object-contain" />
            </div>
          </div>
        </div>
      </footer>

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