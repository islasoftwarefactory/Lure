import React, { useEffect, useState } from 'react';
import { TikTok, Instagram } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

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
  SMS: string;
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
    <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center bg-white rounded-[20px] p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <div className="flex flex-col items-center justify-center px-2 sm:px-4">
        <div className="text-2xl sm:text-4xl font-extrabold font-aleo text-black">??</div>
        <div className="text-xs sm:text-sm uppercase tracking-wider font-medium text-black">Days</div>
      </div>
      <div className="flex flex-col items-center justify-center px-2 sm:px-4">
        <div className="text-2xl sm:text-4xl font-extrabold font-aleo text-black">??</div>
        <div className="text-xs sm:text-sm uppercase tracking-wider font-medium text-black">Hours</div>
      </div>
      <div className="flex flex-col items-center justify-center px-2 sm:px-4">
        <div className="text-2xl sm:text-4xl font-extrabold font-aleo text-black">??</div>
        <div className="text-xs sm:text-sm uppercase tracking-wider font-medium text-black">Minutes</div>
      </div>
      <div className="flex flex-col items-center justify-center px-2 sm:px-4">
        <div className="text-2xl sm:text-4xl font-extrabold font-aleo text-black">??</div>
        <div className="text-xs sm:text-sm uppercase tracking-wider font-medium text-black">Seconds</div>
      </div>
    </div>
  );
}

export function LockedPage() {
  const { token, setToken, getAnonymousToken } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [contactMethod, setContactMethod] = useState<'email' | 'SMS'>('email');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    SMS: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        try {
          await getAnonymousToken();
        } catch (error) {
          // Handle error silently
        }
      }
    };

    initAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Try OPTIONS request
      try {
        await api.options('/scraping/create');
      } catch (error) {
        // Handle error silently
      }
      
      const requestData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: contactMethod === 'email' ? formData.email : '',
        sms: contactMethod === 'SMS' ? formData.SMS : ''
      };
      
      const response = await api.post('/scraping/create', requestData);
      
      if (response.status === 401) {
        toast.error('Erro de autorização: Token inválido');
        return;
      }

      if (response.status === 201) {
        toast.success('Registro realizado com sucesso!');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          SMS: ''
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao enviar dados');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f2] text-black">
      <main className="flex-grow flex flex-col items-center justify-center p-4 pt-8 sm:pt-12 animate-pageLoad">
        <div className="relative w-full max-w-[95%] md:max-w-[1000px]">
          <div className="mb-8 sm:mb-12 w-full">
            <CountdownTimer />
          </div>
          
          <div className="w-full aspect-[2/1] sm:aspect-[3/1] bg-white rounded-[20px] md:rounded-[30px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 md:p-8 flex flex-col items-center justify-center">
            <img 
              src={Logo} 
              alt="Logo" 
              className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 drop-shadow-xl animate-float mb-4"
            />
            
            <div className="w-full max-w-[280px] sm:max-w-xs md:max-w-md space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold font-aleo text-black text-center drop-shadow-sm">
                NEWSLETTER
              </h2>
              
              <div className="space-y-2 sm:space-y-3">
                <div className="flex gap-2 sm:gap-3 w-full">
                  <button
                    onClick={() => setContactMethod('email')}
                    className={`flex-1 py-1 sm:py-1.5 text-sm md:text-base rounded-full font-medium transition-colors hover:bg-black hover:text-white ${
                      contactMethod === 'email'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-black'
                    }`}
                  >
                    Email
                  </button>
                  <button
                    onClick={() => setContactMethod('SMS')}
                    className={`flex-1 py-1 sm:py-1.5 text-sm md:text-base rounded-full font-medium transition-colors hover:bg-black hover:text-white ${
                      contactMethod === 'SMS'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-black'
                    }`}
                  >
                    SMS
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-2">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 sm:px-4 py-1 sm:py-1.5 text-sm md:text-base rounded-full border-2 border-black focus:outline-none focus:border-gray-800"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 sm:px-4 py-1 sm:py-1.5 text-sm md:text-base rounded-full border-2 border-black focus:outline-none focus:border-gray-800"
                  />
                  
                  {contactMethod === 'email' ? (
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 sm:px-4 py-1 sm:py-1.5 text-sm md:text-base rounded-full border-2 border-black focus:outline-none focus:border-gray-800"
                    />
                  ) : (
                    <input
                      type="tel"
                      placeholder="SMS"
                      value={formData.SMS}
                      onChange={(e) => setFormData({ ...formData, SMS: e.target.value })}
                      className="w-full px-3 sm:px-4 py-1 sm:py-1.5 text-sm md:text-base rounded-full border-2 border-black focus:outline-none focus:border-gray-800"
                    />
                  )}

                  <div className="flex justify-center pt-1 sm:pt-2">
                    <button
                      type="submit"
                      className="w-[50%] py-1 sm:py-1.5 text-sm md:text-base rounded-full bg-black text-white font-medium hover:bg-gray-900 transition-colors"
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
        <div className="flex space-x-2 md:space-x-4">
          <a
            href="https://www.instagram.com/lure.us/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 md:w-10 md:h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors"
          >
            <Instagram className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </a>
          <a
            href="https://www.tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 md:w-10 md:h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors"
          >
            <svg 
              viewBox="0 0 24 24" 
              className="w-4 h-4 md:w-5 md:h-5 text-white"
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
