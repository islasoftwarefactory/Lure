'use client'

import { Button } from "@/components/ui/button"
import { useState } from 'react'
import UserIcon from '../assets/icons/home/UserIcon.svg?url'
import ShoppingCartIcon from '../assets/icons/home/ShoppingCartIcon.svg?url'
import googlePayLogo from '../assets/icons/payments/google-pay.svg'
import applePayLogo from '../assets/icons/payments/apple-pay.svg'
import { SideCart } from './SideCart'
import PinterestIcon from '../assets/icons/home/Pinterest.svg?url'
import TikTokIcon from '../assets/icons/home/TikTok.svg?url'
import InstagramIcon from '../assets/icons/home/Instagram.svg?url'  // Adicione esta linha
import { AnnouncementBar } from '@/components/AnnouncementBar'
import { Footer } from './Footer'

const SocialMediaIcons = () => {
  return (
    <div className="flex space-x-4">
      {[
        { icon: PinterestIcon, alt: "Pinterest" },
        { icon: TikTokIcon, alt: "TikTok" },
        { icon: InstagramIcon, alt: "Instagram" },
      ].map((social, index) => (
        <div
          key={index}
          className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <img
              src={social.icon}
              alt={social.alt}
              className="w-full h-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ExpandedInterfaceWithAnnouncementBar: React.FC = () => {
  console.log('ExpandedInterfaceWithAnnouncementBar is rendering');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  return (
    <div className="relative">
      <AnnouncementBar />
      <header className="p-4">
        <div className="flex justify-end space-x-4">
          <button
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            aria-label="Profile"
          >
            <img src={UserIcon} alt="Profile" className="w-6 h-6" />
          </button>
          <button
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            aria-label="Shopping Cart"
            onClick={() => setIsCartOpen(true)}
          >
            <img src={ShoppingCartIcon} alt="Shopping Cart" className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Button
            variant="outline"
            className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 border border-gray-300 rounded-lg shadow-sm transition duration-300 ease-in-out transform hover:scale-105"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition duration-300 ease-in-out transform hover:scale-105"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                fill="currentColor"
              />
            </svg>
            Continue with Apple
          </Button>

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
  )
}