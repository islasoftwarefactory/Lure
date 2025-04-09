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
import AppleSSO from '../assets/icons/home/AppleSSO.svg?react'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'

export function LoginComponent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirecionar se já estiver autenticado
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleAppleLogin = () => {
    // Implement Apple SSO login logic here
    console.log('Apple login clicked');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />

      <main className="flex-grow flex flex-col items-center pt-[200px] pb-[120px]">
        <div className="w-full max-w-md space-y-16 flex flex-col items-center px-6">
          <div className="w-full text-center">
            <h2 className="text-3xl font-extrabold font-aleo mb-6">LOGIN</h2>
            <p className="text-gray-600 mb-8">Acesse sua conta para continuar</p>
          </div>
          
          <div className="w-full space-y-5 mt-20">
            <div className="flex justify-center w-full">
              <GoogleLogin />
            </div>
            
            <Button 
              className="w-full py-4 bg-white text-black border border-gray-300 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center rounded-full"
              onClick={handleAppleLogin}
            >
              <AppleSSO className="mr-3 h-5 w-5" />
              <span className="text-sm font-medium">Continue with Apple</span>
            </Button>
          </div>
          
          <div className="mt-16">
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