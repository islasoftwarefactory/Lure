import React, { useEffect, useState } from 'react';
import { TikTok, Instagram, User, Phone, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

import { SideCart } from './SideCart';
import { SocialIcons } from './SocialIcons';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from '@/assets/icons/home/Logo.svg';
import { useAuth } from '../hooks/useAuth';

// Importe as imagens da pasta @pieces
import image1 from '@/assets/icons/pieces/soons.jpeg';
// import image2 from '@/assets/pieces/conjunto2.jpg';
// import image3 from '@/assets/pieces/conjunto3.jpg';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  contactValue: string;
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
        <div className="text-xs sm:text-sm uppercase tracking-wider font-medium font-aleo text-black">Days</div>
      </div>
      <div className="flex flex-col items-center justify-center px-2 sm:px-4">
        <div className="text-2xl sm:text-4xl font-extrabold font-aleo text-black">??</div>
        <div className="text-xs sm:text-sm uppercase tracking-wider font-medium font-aleo text-black">Hours</div>
      </div>
      <div className="flex flex-col items-center justify-center px-2 sm:px-4">
        <div className="text-2xl sm:text-4xl font-extrabold font-aleo text-black">??</div>
        <div className="text-xs sm:text-sm uppercase tracking-wider font-medium font-aleo text-black">Minutes</div>
      </div>
      <div className="flex flex-col items-center justify-center px-2 sm:px-4">
        <div className="text-2xl sm:text-4xl font-extrabold font-aleo text-black">??</div>
        <div className="text-xs sm:text-sm uppercase tracking-wider font-medium font-aleo text-black">Seconds</div>
      </div>
    </div>
  );
}

// Adicione esta função de validação
const validateContact = (value: string) => {
  // Regex para validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Regex para validar telefone (formato brasileiro)
  const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

  if (emailRegex.test(value)) {
    return { type: 'email', valid: true };
  } else if (phoneRegex.test(value)) {
    return { type: 'phone', valid: true };
  }
  return { type: 'unknown', valid: false };
};

export function LockedPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    contactValue: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const images = [image1]; // Apenas a primeira imagem

  // Modifique a função handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar o contato
    const contactValidation = validateContact(formData.contactValue);
    if (!contactValidation.valid) {
      toast.error('Por favor, insira um email ou telefone válido');
      return;
    }

    // Definir o contact_type_id baseado no tipo
    const contactTypeId = contactValidation.type === 'email' ? 1 : 2; // Supondo que 1 = email, 2 = phone

    try {
      setIsLoading(true);
      
      const requestData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        contact_value: formData.contactValue,
        contact_type_id: contactTypeId
      };
      
      const response = await api.post('/scraping/create', requestData);

      if (response.status === 201) {
        toast.success('Registro realizado com sucesso!');
        setFormData({
          firstName: '',
          lastName: '',
          contactValue: ''
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
          
          <div className="relative w-full aspect-[1.5/1] sm:aspect-[2/1] bg-white/80 rounded-[20px] md:rounded-[30px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex backdrop-blur-sm overflow-hidden">
            {/* Lado esquerdo (frase) com fundo preto e gradiente sutil */}
            <div className="w-1/2 flex flex-col items-center justify-center p-6 md:p-8 bg-gradient-to-br from-black via-gray-900 to-black relative">
              {/* Divider com onda */}
              <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-white to-transparent opacity-30" style={{ clipPath: 'polygon(0 0, 100% 10%, 100% 90%, 0 100%)' }}></div>
              <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-transparent via-white to-transparent opacity-20" style={{ clipPath: 'polygon(0 0, 100% 15%, 100% 85%, 0 100%)' }}></div>
              
              {/* Frase com sombra sutil */}
              <div className="text-center text-white font-aleo font-semibold text-xl sm:text-2xl md:text-3xl leading-tight drop-shadow-lg">
                Register now to unlock exclusive early access to the Genesis Drop.
              </div>
            </div>

            {/* Lado direito (formulário e logo) */}
            <div className="w-1/2 flex items-center justify-center p-6 md:p-8">
              <div className="w-full max-w-[280px] sm:max-w-xs md:max-w-md space-y-4 sm:space-y-5">
                {/* Logo com sombra sutil */}
                <div className="flex justify-center -mt-10">
                  <img 
                    src={Logo} 
                    alt="Logo" 
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 drop-shadow-lg"
                  />
                </div>
                
                {/* Formulário */}
                <div className="space-y-3 sm:space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-3 flex flex-col items-center">
                    <div className="w-full space-y-1">
                      <label className="text-sm font-medium font-aleo text-gray-700">First Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 text-sm rounded-xl focus:outline-none transition-all shadow-sm bg-[#f2f2f2] hover:bg-gray-100 hover:scale-[1.02] hover:shadow-md relative border border-gray-200"
                        />
                      </div>
                    </div>
                    <div className="w-full space-y-1">
                      <label className="text-sm font-medium font-aleo text-gray-700">Last Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 text-sm rounded-xl focus:outline-none transition-all shadow-sm bg-[#f2f2f2] hover:bg-gray-100 hover:scale-[1.02] hover:shadow-md relative border border-gray-200"
                        />
                      </div>
                    </div>
                    <div className="w-full space-y-1">
                      <label className="text-sm font-medium font-aleo text-gray-700">Contact</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <Phone className="w-4 h-4 text-gray-500" />
                        </div>
                        <input
                          type="text"
                          value={formData.contactValue}
                          onChange={(e) => setFormData({ ...formData, contactValue: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 text-sm rounded-xl focus:outline-none transition-all shadow-sm bg-[#f2f2f2] hover:bg-gray-100 hover:scale-[1.02] hover:shadow-md relative border border-gray-200"
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Botão SEND com gradiente sutil */}
            <div className="absolute bottom-4 right-0 w-1/2 flex justify-center">
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-[60%] py-2.5 text-lg md:text-xl rounded-[20px] border-2 border-black bg-gradient-to-r from-black to-gray-900 text-white font-medium font-aleo hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl"
              >
                SEND
              </button>
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
