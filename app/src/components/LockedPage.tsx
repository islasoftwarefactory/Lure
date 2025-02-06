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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col min-h-screen max-h-screen overflow-hidden bg-[#000000] text-white"
    >
      <main className="flex-grow flex items-center justify-center p-0 h-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full h-screen relative"
        >
          {/* Ajustando a posição do botão CONTACT */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute top-8 left-80 z-10"
          >
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="ghost"
              className="text-transparent hover:bg-transparent p-0 h-auto min-w-[140px] min-h-[60px] bg-transparent"
            >
              <span className="sr-only">Contact</span>
            </Button>
          </motion.div>

          {/* Texto LURE centralizado */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-[20vw] font-recoleta font-bold text-white select-none"
            >
              LURE
            </motion.h1>
          </div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="absolute inset-0 overflow-hidden flex"
            style={{
              backgroundImage: 'url("/src/assets/icons/home/LURE.svg")',
              backgroundSize: 'cover',
              backgroundPosition: '0 0',
              backgroundRepeat: 'no-repeat',
              width: '100%',
              height: '100%'
            }}
          >
            <div className="w-[35%] h-full flex items-center justify-center p-8 ml-auto">
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
                    <User className="absolute left-5 top-1/2 transform -translate-y-1/2 text-white w-7 h-7" />
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-[#000000] rounded-xl pl-14 pr-6 py-8 placeholder-white focus-visible:ring-0 border-0 font-recoleta placeholder:font-recoleta text-2xl hover:scale-[1.02] transition-transform duration-200"
                      placeholder="Name"
                      required
                    />
                  </motion.div>
                  
                  <motion.div className="relative" variants={itemVariants}>
                    <User2 className="absolute left-5 top-1/2 transform -translate-y-1/2 text-white w-7 h-7" />
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-[#000000] rounded-xl pl-14 pr-6 py-8 placeholder-white focus-visible:ring-0 border-0 font-recoleta placeholder:font-recoleta text-2xl hover:scale-[1.02] transition-transform duration-200"
                      placeholder="Last Name"
                      required
                    />
                  </motion.div>
                  
                  <motion.div className="relative" variants={itemVariants}>
                    <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 text-white w-7 h-7" />
                    <Input
                      type="text"
                      value={formData.contactValue}
                      onChange={(e) => setFormData({...formData, contactValue: e.target.value})}
                      className="w-full bg-[#000000] rounded-xl pl-14 pr-6 py-8 placeholder-white focus-visible:ring-0 border-0 font-recoleta placeholder:font-recoleta text-2xl hover:scale-[1.02] transition-transform duration-200"
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
                    className="w-[80%] bg-white hover:bg-[#f0f0f0] text-black rounded-2xl py-8 font-recoleta font-bold text-2xl transform hover:scale-[1.02] transition-all duration-200 hover:shadow-lg"
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
      </main>

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

      {/* Modal com formulário atualizado */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="space-y-6">
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
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

