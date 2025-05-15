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
import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export function LoginComponent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      setIsLoading(true);
      setError(null);
      
      try {
        // Definir um tipo/interface para o token decodificado ajuda na clareza
        interface DecodedGoogleToken {
          name: string;
          email: string;
          sub: string; // Google User ID
          picture?: string; // Opcional
          // Inclua outros campos se precisar deles
          [key: string]: any; // Para outros campos não listados
        }

        const decoded: DecodedGoogleToken = jwtDecode(credentialResponse.credential);
        console.log('Token decodificado:', decoded);

        if (!apiUrl) {
          console.error("VITE_API_BASE_URL is not defined.");
          setError("Configuration error: API URL is missing.");
          setIsLoading(false);
          return;
        }

        const fullApiUrl = `${apiUrl}/user/create`;
        console.log('Sending request to:', fullApiUrl);

        const response = await fetch(fullApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: decoded.name,                 // Valor do campo 'name' do token
            email: decoded.email,               // Valor do campo 'email' do token
            auth_provider: "Google",            // Valor literal "Google"
            provider_id: decoded.sub,           // Valor do campo 'sub' do token
            photo: decoded.picture || null      // Valor do campo 'picture', ou null se não existir
          }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('auth_token', data.token); // Assumindo que o backend retorna um token seu
          login(data.token);
          navigate('/');
        } else {
          const errorData = await response.json();
          console.error('API Error Response Data:', errorData); // Log do erro do backend
          setError(errorData.error || `Falha na autenticação (${response.status})`);
        }
      } catch (error) {
         console.error('Erro na autenticação ou fetch:', error); // Erro geral (rede, etc.)
         let errorMessage = 'Falha na autenticação. Tente novamente.';
        if (axios.isAxiosError(error) && error.response) {
          errorMessage = error.response.data.error || errorMessage;
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error('Login com Google falhou: Credencial ausente');
      setError('Autenticação com Google falhou. Tente novamente.');
    }
  };
  
  const handleGoogleError = () => {
    console.error('Login com Google falhou');
    setError('Autenticação com Google falhou. Tente novamente.');
  };
  
  const handleAppleLogin = () => {
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
          
          {error && (
            <div className="w-full p-4 bg-red-100 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}
          
          <div className="w-full space-y-5 mt-20">
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                text="continue_with"
                shape="pill"
                disabled={isLoading}
              />
            </div>
            
            {isLoading && (
              <div className="flex justify-center my-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            )}
            
            <Button 
              className="w-full py-4 bg-white text-black border border-gray-300 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center rounded-full"
              onClick={handleAppleLogin}
              disabled={isLoading}
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