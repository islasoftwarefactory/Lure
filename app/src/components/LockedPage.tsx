import React, { useEffect, useState } from 'react';
import { TikTok, Instagram, User, Phone, Mail, User2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from './Modal';

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

// Importando as imagens
import fluerIcon from '@/assets/icons/home/read_fluer.svg';
import logoIcon from '@/assets/icons/home/logo.svg';
import fraseIcon from '@/assets/icons/home/frase.svg';
import columnIcon from '@/assets/icons/home/column.png';
import fundoIcon from '@/assets/icons/home/fundo.svg';

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

// Adicione esta interface para o formulário de contato
interface ContactFormData {
  full_name: string;
  phone: string;
  email: string;
  message: string;
}

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<'about' | 'contact'>('about');

  // Novo estado para o formulário de contato
  const [contactForm, setContactForm] = useState<ContactFormData>({
    full_name: '',
    phone: '',
    email: '',
    message: ''
  });

  // Adicione este estado no início do componente, junto com os outros estados
  const [showSecondPage, setShowSecondPage] = useState(false);

  // Animação de container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  // Animação de elementos filhos
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 120
      }
    }
  };

  // Animação de página
  const pageVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.5
      }
    }
  };

  // Nova função para lidar com o envio do formulário de contato
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Iniciando envio do formulário de contato:', contactForm);
    
    try {
      setIsLoading(true);
      console.log('Fazendo request para /contact/create');
      
      // Aumentando o timeout para 10 segundos
      const response = await api.post('/contact/create', contactForm, {
        timeout: 10000 // 10 segundos
      });
      console.log('Resposta da API:', response.data);

      if (response.status === 201) {
        console.log('Mensagem enviada com sucesso!');
        toast.success('Mensagem enviada com sucesso!');
        setContactForm({
          full_name: '',
          phone: '',
          email: '',
          message: ''
        });
        setIsModalOpen(false);
      }
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      console.error('Detalhes do erro:', error.response?.data);
      console.error('Status do erro:', error.response?.status);
      console.error('URL da requisição:', error.config?.url);
      toast.error(
        error.code === 'ECONNABORTED' 
          ? 'Tempo de conexão excedido. Tente novamente.'
          : error.response?.data?.message || 'Erro ao enviar mensagem'
      );
    } finally {
      setIsLoading(false);
      console.log('Request finalizada');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const contactValidation = validateContact(formData.contactValue);
    if (!contactValidation.valid) {
      toast.error('Por favor, insira um email ou telefone válido');
      return;
    }

    const contactTypeId = contactValidation.type === 'email' ? 1 : 2;

    try {
      setIsLoading(true);
      
      const requestData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        contact_value: formData.contactValue,
        contact_type_id: contactTypeId
      };
      
      const response = await api.post('/locked/create', requestData);

      if (response.status === 201) {
        setFormData({
          firstName: '',
          lastName: '',
          contactValue: ''
        });
        
        setShowSecondPage(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao enviar dados');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-white overflow-hidden"
      style={{
        backgroundImage: `url(${fundoIcon})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="relative h-screen">
        {/* Fluer - 15% smaller while maintaining position */}
        <div className="absolute top-[-17%] left-[-7%] z-10">
          <img
            src={fluerIcon}
            alt="Logo"
            className="rounded-full w-[150px] h-[150px] sm:w-[300px] sm:h-[300px] lg:w-[500px] lg:h-[500px] object-contain"
            style={{ 
              transform: 'scale(0.85)',
              transformOrigin: 'top left'
            }}
          />
        </div>

        {/* Logo - dobro do tamanho original e mais para a esquerda */}
        <div className="absolute left-[-9%] top-[52%] transform -translate-y-1/2">
          <img
            src={logoIcon}
            alt="Main Image"
            className="rounded-lg w-[344px] h-[344px] sm:w-[690px] sm:h-[690px] lg:w-[920px] lg:h-[920px] object-contain"
            style={{ maxWidth: '200%', height: 'auto' }}
          />
        </div>

        {/* frase - Reposicionada para ficar abaixo do botão Send */}
        <div className="absolute right-[10%] top-[50%] w-[35%] flex justify-center">
          <img
            src={fraseIcon}
            alt="Right Image"
            className="rounded-lg w-[225px] h-[225px] sm:w-[450px] sm:h-[450px] lg:w-[600px] lg:h-[600px] object-contain"
          />
        </div>

        {/* Full height column - muito mais para direita */}
        <div className="absolute -right-[50%] top-0 h-screen w-[2000px] sm:w-[2000px] lg:w-[2000px] overflow-hidden">
          <img
            src={columnIcon}
            alt="Column Image"
            className="h-full w-full object-contain"
            style={{ maxWidth: '100%' }}
          />
        </div>

        {/* Botões do arquivo antigo */}
        <motion.div className="absolute top-[2.5%] left-72 z-10">
          <Button
            onClick={() => {
              setModalContent('contact');
              setIsModalOpen(true);
            }}
            variant="ghost"
            className="text-black hover:bg-transparent p-4 h-auto min-w-[154px] min-h-[60px] bg-transparent font-recoleta text-2xl font-semibold"
          >
            Contact
          </Button>
        </motion.div>

        <motion.div className="absolute top-[2.5%] left-40 z-10">
          <Button
            onClick={() => {
              setModalContent('about');
              setIsModalOpen(true);
            }}
            variant="ghost"
            className="text-black hover:bg-transparent p-4 h-auto min-w-[77px] min-h-[60px] bg-transparent font-recoleta text-2xl font-semibold"
          >
            About
          </Button>
        </motion.div>

        {/* Formulário do arquivo antigo */}
        <div className="absolute right-[10%] top-0 w-[35%] h-full flex items-center justify-center p-8">
          <form onSubmit={handleSubmit} className="w-full max-w-[400px] space-y-12">
            <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
              <motion.div className="relative" variants={itemVariants}>
                <User className="absolute left-5 top-1/2 transform -translate-y-1/2 text-black w-7 h-7" />
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-transparent rounded-xl pl-14 pr-6 py-8 placeholder-black text-black focus-visible:ring-0 border-[3px] border-[#000] font-recoleta placeholder:font-recoleta text-2xl hover:scale-[1.02] transition-transform duration-200 [&::placeholder]:text-black"
                  placeholder="Name"
                  required
                />
              </motion.div>
              
              <motion.div className="relative" variants={itemVariants}>
                <User2 className="absolute left-5 top-1/2 transform -translate-y-1/2 text-black w-7 h-7" />
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-transparent rounded-xl pl-14 pr-6 py-8 placeholder-black text-black focus-visible:ring-0 border-[3px] border-[#000] font-recoleta placeholder:font-recoleta text-2xl hover:scale-[1.02] transition-transform duration-200 [&::placeholder]:text-black"
                  placeholder="Last Name"
                  required
                />
              </motion.div>
              
              <motion.div className="relative" variants={itemVariants}>
                <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 text-black w-7 h-7" />
                <Input
                  type="text"
                  value={formData.contactValue}
                  onChange={(e) => setFormData({...formData, contactValue: e.target.value})}
                  className="w-full bg-transparent rounded-xl pl-14 pr-6 py-8 placeholder-black text-black focus-visible:ring-0 border-[3px] border-[#000] font-recoleta placeholder:font-recoleta text-2xl hover:scale-[1.02] transition-transform duration-200 [&::placeholder]:text-black"
                  placeholder="Contact (Email or Phone)"
                  required
                />
              </motion.div>
            </motion.div>

            <motion.div className="flex justify-center" variants={itemVariants}>
              <Button 
                type="submit"
                className="w-[80%] bg-[#4f0202] hover:bg-[#4f0202] text-white rounded-2xl py-8 font-recoleta font-bold text-2xl transform hover:scale-[1.02] transition-all duration-200 hover:shadow-lg"
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? 'Enviando...' : 'Send'}
              </Button>
            </motion.div>
          </form>
        </div>

        {/* Modal do arquivo antigo */}
        <AnimatePresence>
          {isModalOpen && (
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <div className="space-y-6">
                {modalContent === 'about' ? (
                  <>
                    <h2 className="text-2xl font-bold font-recoleta">About Us</h2>
                    <div className="prose prose-invert font-recoleta">
                      <p>Welcome to LURE, where fashion meets sophistication...</p>
                      <p>Our mission is to provide high-quality, sustainable fashion...</p>
                      <p>Join us in our journey to redefine modern fashion...</p>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold font-recoleta">Contact Us</h2>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <Input
                        type="text"
                        placeholder="Full Name"
                        value={contactForm.full_name}
                        onChange={(e) => setContactForm({...contactForm, full_name: e.target.value})}
                        className="w-full bg-transparent border-white/20 rounded-lg focus-visible:ring-white"
                        required
                      />
                      <Input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                        className="w-full bg-transparent border-white/20 rounded-lg focus-visible:ring-white"
                      />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        className="w-full bg-transparent border-white/20 rounded-lg focus-visible:ring-white"
                        required
                      />
                      <textarea
                        placeholder="Message"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        className="w-full bg-transparent border border-white/20 rounded-lg p-3 focus:ring-white focus:border-white min-h-[100px] resize-none"
                        required
                      />
                      <Button 
                        type="submit"
                        className="w-full bg-white text-black hover:bg-white/90 font-recoleta"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Sending...' : 'Send Message'}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

