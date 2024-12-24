'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { AnnouncementBar } from './AnnouncementBar'
import { Header } from './Header'
import { SocialIcons } from './SocialIcons'
import { Footer } from './Footer'
import { SideCart } from './SideCart'
import { CartItem } from '../types/CartItem'
import GoogleSSO from '../assets/icons/home/GoogleSSO.svg?react'
import AppleSSO from '../assets/icons/home/AppleSSO.svg?react'

export function LoginComponent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    // Implement Google SSO login logic here
    console.log('Google login clicked');
  };

  const handleAppleLogin = () => {
    // Implement Apple SSO login logic here
    console.log('Apple login clicked');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />

      <main className="flex-grow flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-12 flex flex-col items-center">
          <div className="w-full text-center">
            <h2 className="text-xl font-semibold mb-6">LOGIN</h2>
            <div className="space-y-4 w-full">
              <Button 
                className="w-full bg-white text-black border border-gray-300 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
                onClick={handleGoogleLogin}
              >
                <GoogleSSO className="mr-2 h-5 w-5" />
                <span className="text-sm">Continue with Google</span>
              </Button>
              <Button 
                className="w-full bg-white text-black border border-gray-300 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
                onClick={handleAppleLogin}
              >
                <AppleSSO className="mr-2 h-5 w-5" />
                <span className="text-sm">Continue with Apple</span>
              </Button>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 text-center">
              By continuing, you agree to LURE's Terms of Service and Privacy Policy.
            </p>
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

export { LoginComponent as LoginPage };