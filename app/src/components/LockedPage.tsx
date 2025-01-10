import React, { useEffect, useState } from 'react';
import { TikTok   } from 'lucide-react';
import { Instagram, Mail } from 'lucide-react';

import { SideCart } from './SideCart';
import { SocialIcons } from './SocialIcons';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from '@/assets/icons/home/Logo.svg';
import { useAuth } from '../hooks/useAuth';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
}

function CountdownTimer() {
  const [time, setTime] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date('2024-01-01T00:00:00').getTime();
      setTime({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      });
    };

    calculateTimeLeft();
  }, []);

  return (
    <div className="grid grid-cols-4 gap-4 text-center my-4">
      <div>
        <div className="text-4xl font-extrabold font-aleo text-black">??</div>
        <div className="text-sm uppercase tracking-wider font-medium text-black">Days</div>
      </div>
      <div>
        <div className="text-4xl font-extrabold font-aleo text-black">??</div>
        <div className="text-sm uppercase tracking-wider font-medium text-black">Hours</div>
      </div>
      <div>
        <div className="text-4xl font-extrabold font-aleo text-black">??</div>
        <div className="text-sm uppercase tracking-wider font-medium text-black">Minutes</div>
      </div>
      <div>
        <div className="text-4xl font-extrabold font-aleo text-black">??</div>
        <div className="text-sm uppercase tracking-wider font-medium text-black">Seconds</div>
      </div>
    </div>
  );
}

export function LockedPage() {
  const { token, setToken, getAnonymousToken } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('email');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    whatsapp: ''
  });

  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        console.log('LockedPage: Token não encontrado, solicitando token anônimo...');
        try {
          await getAnonymousToken();
        } catch (error) {
          console.error('Erro ao obter token anônimo:', error);
        }
      } else {
        console.log('LockedPage: Token atual:', token);
      }
    };

    initAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Enviando requisição com dados:', formData);
      console.log('Token atual:', token);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          contactMethod,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Resposta do registro:', data);
        
        if (data.token) {
          console.log('Novo token recebido:', data.token);
          setToken(data.token);
          localStorage.setItem('jwt_token', data.token);
        }
      }
    } catch (error) {
      console.error('Erro durante registro:', error);
      console.log('Estado do token após erro:', token);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f2] text-black">
      <main className="flex-grow flex flex-col items-center justify-center p-4 animate-pageLoad">
        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 -top-24 z-10">
            <CountdownTimer />
          </div>
          <div className="w-[1000px] h-[600px] bg-white rounded-[30px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 flex flex-col items-center">
            <img 
              src={Logo} 
              alt="Logo" 
              className="w-32 h-32 drop-shadow-xl animate-float mb-4"
            />
            <div className="w-full max-w-2xl space-y-4">
              <h2 className="text-2xl font-extrabold font-aleo text-black text-center drop-shadow-sm">
                NEWSLETTER
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => setContactMethod('email')}
                    className={`flex-1 py-3 rounded-full font-medium transition-colors ${
                      contactMethod === 'email'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-black'
                    }`}
                  >
                    Email
                  </button>
                  <button
                    onClick={() => setContactMethod('whatsapp')}
                    className={`flex-1 py-3 rounded-full font-medium transition-colors ${
                      contactMethod === 'whatsapp'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-black'
                    }`}
                  >
                    SMS
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 rounded-full border-2 border-black focus:outline-none focus:border-gray-800"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 rounded-full border-2 border-black focus:outline-none focus:border-gray-800"
                  />
                  
                  {contactMethod === 'email' ? (
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 rounded-full border-2 border-black focus:outline-none focus:border-gray-800"
                    />
                  ) : (
                    <input
                      type="tel"
                      placeholder="WhatsApp"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full px-4 py-2 rounded-full border-2 border-black focus:outline-none focus:border-gray-800"
                    />
                  )}

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className="w-[50%] py-3 rounded-full bg-black text-white font-medium hover:bg-gray-900 transition-colors"
                    >
                      SEND
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex space-x-4">
          <a
            href="mailto:contact@example.com"
            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <Mail className="w-5 h-5" />
          </a>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href="https://www.tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <svg 
              viewBox="0 0 24 24" 
              className="w-5 h-5"
              fill="currentColor"
            >
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </a>
        </div>
      </div>

      <SideCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        setItems={setCartItems}
      />
    </div>
  );
}
