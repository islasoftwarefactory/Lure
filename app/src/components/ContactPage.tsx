import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Send, ArrowLeft } from 'lucide-react';
import { AnnouncementBar } from './AnnouncementBar';
import { Footer } from './Footer';
import { Header } from './Header';
import { SideCart } from './SideCart';
import { SocialIcons } from './SocialIcons';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from '../context/CartContext';
import api from '../services/api';

// Adicione esta definição de tipo
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  // Adicione outras propriedades conforme necessário
}

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartItems, setCartItems } = useCart();

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', message: '' };

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!message.trim()) {
      newErrors.message = 'Message is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const contactData = {
          full_name: name.trim(),
          email: email.trim(),
          message: message.trim()
        };

        console.log('Sending contact data:', contactData);
        
        const response = await api.post('/contact/create', contactData);
        
        if (response.status === 201) {
          // Store the name for the success message
          setSubmittedName(name.trim());
          
          // Clear the form
          setName('');
          setEmail('');
          setMessage('');
          setErrors({ name: '', email: '', message: '' });
          
          // Show success state
          setIsSuccess(true);
          
          console.log('Contact created successfully:', response.data);
        }
      } catch (error: any) {
        console.error('Error sending message:', error);
        
        // Handle different error types
        if (error.response) {
          // Server responded with error status
          if (error.response.status === 400) {
            setErrors({ name: 'Please check that all required fields are filled correctly.', email: '', message: '' });
          } else if (error.response.status === 500) {
            setErrors({ name: 'Server error. Please try again later.', email: '', message: '' });
          } else {
            const errorMessage = error.response.data?.error || error.response.data?.message || 'Error sending message';
            setErrors({ name: errorMessage, email: '', message: '' });
          }
        } else if (error.request) {
          setErrors({ name: 'Network error. Please check your connection and try again.', email: '', message: '' });
        } else {
          setErrors({ name: 'An unexpected error occurred. Please try again.', email: '', message: '' });
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSendAnother = () => {
    setIsSuccess(false);
    setSubmittedName('');
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
        <AnnouncementBar />
        <Header onCartClick={() => setIsCartOpen(true)} />
        
        <main className="flex-grow pt-32 sm:pt-36 pb-20 flex items-center justify-center">
          <div className="container mx-auto p-4 md:p-6 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center relative overflow-hidden"
            >
              {/* Animated background elements */}
              <motion.div
                className="absolute -top-10 -right-10 w-32 h-32 bg-green-100 rounded-full opacity-20"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-100 rounded-full opacity-20"
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 180, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </motion.div>
                  {/* Pulse animation */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-green-200"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </motion.div>

              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mb-8"
              >
                <h2 className="text-3xl md:text-4xl font-bold font-aleo text-gray-900 mb-4">
                  Message Sent!
                </h2>
                <p className="text-xl font-aleo text-gray-700 mb-2">
                  Thank you, {submittedName}!
                </p>
                <p className="text-lg font-aleo text-gray-600 leading-relaxed">
                  We've received your message and will get back to you as soon as possible. 
                  Our team typically responds within 24 hours.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="space-y-4"
              >
                <Button
                  onClick={handleSendAnother}
                  className="bg-black text-white font-aleo text-lg font-bold rounded-full px-8 py-3 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Another Message
                </Button>
                

              </motion.div>


            </motion.div>
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
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />
      
      <main className="flex-grow pt-32 sm:pt-36 pb-20">
        <div className="container mx-auto p-4 md:p-6 space-y-8 max-w-2xl">
          {/* Page Title Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <h1 className="text-3xl md:text-4xl font-extrabold font-aleo text-gray-900">Contact Us</h1>
          </motion.div>

          {/* Contact Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white rounded-2xl shadow-lg">
              <CardHeader className="bg-gray-50/80 p-6 border-b">
                <CardTitle className="font-aleo text-2xl font-bold">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-aleo text-base">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`font-aleo ${errors.name ? 'border-red-500' : ''}`}
                      disabled={isSubmitting}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1 font-aleo">{errors.name}</p>}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-aleo text-base">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`font-aleo ${errors.email ? 'border-red-500' : ''}`}
                      disabled={isSubmitting}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1 font-aleo">{errors.email}</p>}
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <Label htmlFor="message" className="font-aleo text-base">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={`font-aleo min-h-[120px] resize-y ${errors.message ? 'border-red-500' : ''}`}
                      rows={5}
                      disabled={isSubmitting}
                    />
                    {errors.message && <p className="text-red-500 text-sm mt-1 font-aleo">{errors.message}</p>}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-black text-white font-aleo text-lg font-bold rounded-full py-3 hover:bg-gray-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <motion.div className="flex items-center justify-center">
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Sending Message...
                      </motion.div>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
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
  );
};