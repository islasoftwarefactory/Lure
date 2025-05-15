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
import fluerIcon from '@/assets/icons/home/fluer.svg';
import logoIcon from '@/assets/icons/home/logo.svg';
import fraseIcon from '@/assets/icons/home/frase_tela1.svg';

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
    
    try {
      setIsLoading(true);
      const response = await api.post('/contact/create', contactForm);

      if (response.status === 201) {
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
      toast.error(error.response?.data?.message || 'Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
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
      
      const response = await api.post('/scraping/create', requestData);

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
    <div className="min-h-screen bg-white overflow-hidden">
      <div className="relative h-screen">
        {/* Fluer - 10% para esquerda e 8% para cima (ajustado de -10% para -8%) */}
        <div className="absolute top-[-8%] left-[-10%] z-10">
          <img
            src={fluerIcon}
            alt="Logo"
            className="rounded-full w-[150px] h-[150px] sm:w-[300px] sm:h-[300px] lg:w-[500px] lg:h-[500px] object-contain"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        {/* Logo - 15% maior e 10% mais para cima */}
        <div className="absolute left-4 top-[40%] transform -translate-y-1/2">
          <img
            src={logoIcon}
            alt="Main Image"
            className="rounded-lg w-[172px] h-[172px] sm:w-[345px] sm:h-[345px] lg:w-[460px] lg:h-[460px] object-contain"
          />
        </div>

        {/* Frase_tela1 - 50% maior e 35% mais para baixo */}
        <div className="absolute right-[20%] top-[85%] transform -translate-y-1/2">
          <img
            src={fraseIcon}
            alt="Right Image"
            className="rounded-lg w-[225px] h-[225px] sm:w-[450px] sm:h-[450px] lg:w-[600px] lg:h-[600px] object-contain"
          />
        </div>

        {/* Full height column */}
        <div className="absolute right-0 top-0 h-screen w-[50px] sm:w-[75px] lg:w-[100px]">
          <img
            src="https://thumbs.dreamstime.com/b/greek-column-eps-4454327.jpg"
            alt="Column Image"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

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
    
    try {
      setIsLoading(true);
      const response = await api.post('/contact/create', contactForm);

      if (response.status === 201) {
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
      toast.error(error.response?.data?.message || 'Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
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
      
      const response = await api.post('/scraping/create', requestData);

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
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col min-h-screen w-screen overflow-hidden bg-[#000000] text-white relative"
    >
      {!showSecondPage ? (
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-grow flex items-center justify-center w-screen h-screen relative"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-screen h-screen relative"
          >
            {/* Botão CONTACT */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute top-16 left-72 z-10"
            >
              <Button
                onClick={() => {
                  setModalContent('contact');
                  setIsModalOpen(true);
                }}
                variant="ghost"
                className="text-transparent hover:bg-transparent p-0 h-auto min-w-[154px] min-h-[60px] bg-transparent"
              >
                <span className="sr-only">Contact</span>
              </Button>
            </motion.div>

            {/* Botão ABOUT */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute top-16 left-40 z-10"
            >
              <Button
                onClick={() => {
                  setModalContent('about');
                  setIsModalOpen(true);
                }}
                variant="ghost"
                className="text-transparent hover:bg-transparent p-0 h-auto min-w-[120px] min-h-[60px] bg-transparent"
              >
                <span className="sr-only">About</span>
              </Button>
            </motion.div>

            {/* Texto LURE centralizado */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-[15vw] font-recoleta font-bold text-white select-none"
              >
                LURE
              </motion.h1>
            </div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="absolute inset-0 overflow-hidden w-[1917px] h-[990px] rounded-2xl shadow-lg"
              style={{
                backgroundImage: 'url("/src/assets/icons/home/first_page.svg")',
                backgroundSize: '100%',
                backgroundPosition: 'center 100%',
                backgroundRepeat: 'no-repeat',
                margin: 0,
                padding: 0,
                objectFit: 'cover'
              }}
            >
            
              <div className="absolute right-[10%] top-0 w-[35%] h-full flex items-center justify-center p-8">
                <form 
                  onSubmit={handleSubmit}
                  className="w-full max-w-[400px] space-y-12"
                >
                  <motion.div 
                    className="space-y-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
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

                  <motion.div 
                    className="flex justify-center"
                    variants={itemVariants}
                  >
                    <Button 
                      type="submit"
                      className="w-[80%] bg-[#f2f2f2] hover:bg-[#f2f2f2] text-black rounded-2xl py-8 font-recoleta font-bold text-2xl transform hover:scale-[1.02] transition-all duration-200 hover:shadow-lg"
                      disabled={isLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? 'Enviando...' : 'Send'}
                    </Button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </motion.main>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 overflow-hidden w-[1917px] h-[990px] rounded-2xl shadow-lg"
          style={{
            backgroundImage: 'url("/src/assets/icons/home/second_page.svg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            margin: 0,
            padding: 0,
            objectFit: 'cover'
          }}
        >
          {/* Botão CONTACT */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute top-16 left-72 z-10"
          >
            <Button
              onClick={() => {
                setModalContent('contact');
                setIsModalOpen(true);
              }}
              variant="ghost"
              className="text-transparent hover:bg-transparent p-0 h-auto min-w-[154px] min-h-[60px] bg-transparent"
            >
              <span className="sr-only">Contact</span>
            </Button>
          </motion.div>

          {/* Botão ABOUT */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute top-16 left-40 z-10"
          >
            <Button
              onClick={() => {
                setModalContent('about');
                setIsModalOpen(true);
              }}
              variant="ghost"
              className="text-transparent hover:bg-transparent p-0 h-auto min-w-[77px] min-h-[60px] bg-transparent"
            >
              <span className="sr-only">About</span>
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Removendo os botões de redes sociais
      <div className="fixed bottom-4 right-4 z-50">
        ... conteúdo dos botões de redes sociais ...
      </div> */}

      {/* Removendo o SideCart
      <SideCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        setItems={setCartItems}
      /> */}

      {/* Modal atualizado para mostrar conteúdo diferente baseado em modalContent */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="space-y-6">
              {modalContent === 'about' ? (
                <>
                  <h2 className="text-2xl font-bold font-recoleta">About Us</h2>
                  <div className="prose prose-invert font-recoleta">
                    <p>
                      Welcome to LURE, where fashion meets sophistication. We are a premium clothing brand dedicated to creating timeless pieces that embody elegance and style.
                    </p>
                    <p>
                      Our mission is to provide high-quality, sustainable fashion that makes you feel confident and comfortable. Each piece is carefully crafted with attention to detail and a commitment to excellence.
                    </p>
                    <p>
                      Join us in our journey to redefine modern fashion while maintaining the highest standards of quality and design.
                    </p>
                  </div>
                </>
              ) : (
                // Conteúdo existente do formulário de contato
                <>
                  <h2 className="text-2xl font-bold font-recoleta">Contact Us</h2>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="Full Name"
                        value={contactForm.full_name}
                        onChange={(e) => setContactForm({...contactForm, full_name: e.target.value})}
                        className="w-full bg-transparent border-white/20 rounded-lg focus-visible:ring-white"
                        required
                      />
                    </div>

                    <div>
                      <Input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                        className="w-full bg-transparent border-white/20 rounded-lg focus-visible:ring-white"
                      />
                    </div>

                    <div>
                      <Input
                        type="email"
                        placeholder="Email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        className="w-full bg-transparent border-white/20 rounded-lg focus-visible:ring-white"
                        required
                      />
                    </div>

                    <div>
                      <textarea
                        placeholder="Message"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        className="w-full bg-transparent border border-white/20 rounded-lg p-3 focus:ring-white focus:border-white min-h-[100px] resize-none"
                        required
                      />
                    </div>

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
    </motion.div>
  );
}

