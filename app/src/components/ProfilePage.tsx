'use client'

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';
import { AnnouncementBar } from './AnnouncementBar';
import { SideCart } from "./SideCart";
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // Importa o useAuth correto
import api from '@/services/api'; // Importa a instância da API
import { Button } from "@/components/ui/button"; // Para o botão de logout
import { Link } from "react-router-dom";
import { Package, MapPin, LogOut, User, Mail, CheckCircle, Heart } from 'lucide-react'; // Import additional icons
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { LoginComponent } from './LoginComponent';

// Interface para os dados do usuário (ajuste conforme o retorno do seu backend)
interface UserData {
  id: number;
  name: string;
  email: string;
  photo?: string; // URL da foto, opcional
  auth_provider?: string; // Ex: "Google"
  // Adicione outros campos que user.serialize() retorna, se necessário
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { isCartOpen, setIsCartOpen, cartItems, setCartItems } = useCart();
  const auth = useAuth(); // Usa o contexto de autenticação
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Efeito para buscar os dados do usuário logado
  useEffect(() => {
    const fetchUserData = async () => {
      // Só busca se houver um token (garantido pelo ProtectedRoute, mas verificamos de novo)
      if (!auth.token) {
        console.log("ProfilePage: No token found, skipping fetch.");
        setIsLoading(false);
        // Opcional: redirecionar para login se chegar aqui sem token
        // navigate('/login');
        return;
      }

      setIsLoading(true);
      setError(null);
      console.log("ProfilePage: Attempting to fetch user data from /user/me");

      try {
        const response = await api.get('/user/me'); // Chama a nova rota do backend

        if (response.data && response.data.data) {
          console.log("ProfilePage: User data received:", response.data.data);
          setUserData(response.data.data);
        } else {
           console.error("ProfilePage: Invalid data structure received from API.");
           setError("Failed to load profile data (invalid format).");
        }
      } catch (err: any) {
        console.error("ProfilePage: Error fetching user data:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
           // Se token inválido/expirado ou acesso negado, deslogar e redirecionar
           setError("Session expired or invalid. Please log in again.");
           auth.logout(); // Chama a função logout do contexto
           navigate('/login'); // Redireciona para login
        } else {
           setError(err.response?.data?.message || "Failed to load profile data.");
        }
         setUserData(null); // Limpa dados em caso de erro
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [auth.token, auth, navigate]); // Depende do token para re-buscar se ele mudar

  const handleLogout = () => {
    auth.logout(); // Chama a função de logout do contexto
    navigate('/login'); // Redireciona para a página de login
  };

  // --- EDIT 1: Adicionar handler para o botão "My Orders" ---
  const handleGoToMyOrders = () => {
      navigate('/my-orders-list'); // Navega para a nova rota da lista de pedidos
  };
  // --- FIM EDIT 1 ---

  // Handler para o botão "Addresses"
  const handleAddressesClick = () => {
    navigate('/addresses'); // Navega para a página de endereços
  };

  const handleFavoritesClick = () => {
    navigate('/favorites');
  };

  // Se não autenticado, exibe o LoginComponent
  if (!auth.isAuthenticated) {
    return <LoginComponent />;
  }

  // Renderização condicional durante o carregamento ou erro
  if (isLoading) {
    return (
        <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
          <AnnouncementBar />
          <Header onCartClick={() => setIsCartOpen(true)} />
          <main className="flex-grow flex items-center justify-center">
            <div className="text-base sm:text-lg">Loading profile...</div>
          </main>
          <Footer />
          <SideCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} setItems={setCartItems} />
      </div>
    );
  }

  if (error) {
     return (
        <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
          <AnnouncementBar />
          <Header onCartClick={() => setIsCartOpen(true)} />
          <main className="flex-grow flex items-center justify-center text-center p-4">
            <div>
               <p className="text-red-600 font-semibold text-sm sm:text-base">Error loading profile:</p>
               <p className="text-red-500 text-sm sm:text-base mt-2">{error}</p>
               <Button onClick={() => navigate('/login')} className="mt-4 text-sm sm:text-base">Go to Login</Button>
            </div>
          </main>
          <Footer />
          <SideCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} setItems={setCartItems} />
       </div>
     );
  }

  if (!userData) {
     return (
        <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
          <AnnouncementBar />
          <Header onCartClick={() => setIsCartOpen(true)} />
          <main className="flex-grow flex items-center justify-center">
            <div className="text-base sm:text-lg">No profile data available.</div>
          </main>
          <Footer />
          <SideCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} setItems={setCartItems} />
       </div>
     );
  }

  // Renderização principal da página de perfil
  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />

      <main className="flex-grow container mx-auto px-3 sm:px-4 pt-24 sm:pt-32 md:pt-36 pb-16 sm:pb-24 md:pb-32">
        <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
          {/* Page Title */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-aleo text-gray-900">
              My Profile
            </h1>
          </div>
          
          {/* Profile Information Card */}
          <Card className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
            <CardHeader className="bg-gray-50/80 p-4 sm:p-6 border-b">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl">
                  <User size={24} className="text-blue-600 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Profile Information</CardTitle>
                  <CardDescription className="text-gray-500 mt-1 text-sm sm:text-base">Your personal account details</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:gap-10">
                {/* Profile Photo Section */}
                <div className="flex-shrink-0 flex flex-col items-center text-center md:w-1/4 mb-6 md:mb-0">
                  <div className="relative group">
                    {userData.photo ? (
                      <img
                        src={userData.photo}
                        alt="User profile"
                        className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-white shadow-md"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-3xl sm:text-4xl md:text-5xl font-bold ring-4 ring-white shadow-md">
                        {userData.name ? userData.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                  </div>
                  <h1 className="mt-3 sm:mt-4 md:mt-5 text-xl sm:text-2xl font-bold text-gray-800 break-words">{userData.name}</h1>
                  {userData.auth_provider && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Logged in with {userData.auth_provider}
                    </p>
                  )}
                </div>

                {/* Profile Details Section */}
                <div className="flex-grow md:border-l md:pl-10 border-gray-200/80">
                  <div className="space-y-4 sm:space-y-6">
                    {/* Email Field */}
                    <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <Mail className="text-blue-600 mt-1 flex-shrink-0" size={16} />
                      <div className="min-w-0 flex-1">
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Email Address</label>
                        <p className="mt-1 text-base sm:text-lg text-gray-900 break-words">{userData.email}</p>
                      </div>
                    </div>

                    {/* Account Status Field */}
                    <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={16} />
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Account Status</label>
                        <p className="mt-1">
                          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Account Actions Card */}
          <Card className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
            <CardHeader className="bg-gray-50/80 p-4 sm:p-6 border-b">
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Account Actions</CardTitle>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={handleGoToMyOrders}
                  className="w-full flex items-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 active:bg-gray-100"
                >
                  <Package className="mr-3 sm:mr-4 text-blue-600 flex-shrink-0" size={20} />
                  <span className="text-base sm:text-lg font-medium text-gray-800">My Orders</span>
                </button>
                <button
                  onClick={handleFavoritesClick}
                  className="w-full flex items-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 active:bg-gray-100"
                >
                  <Heart className="mr-3 sm:mr-4 text-red-500 flex-shrink-0" size={20} />
                  <span className="text-base sm:text-lg font-medium text-gray-800">Favorites</span>
                </button>
                <button
                  onClick={handleAddressesClick}
                  className="w-full flex items-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 active:bg-gray-100"
                >
                  <MapPin className="mr-3 sm:mr-4 text-green-600 flex-shrink-0" size={20} />
                  <span className="text-base sm:text-lg font-medium text-gray-800">Manage Addresses</span>
                </button>
              </div>
            </CardContent>
            
            <CardFooter className="bg-gray-50/80 p-4 sm:p-6 flex justify-end">
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="flex items-center gap-x-2 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 min-h-[44px]"
              >
                <LogOut size={14} className="sm:w-4 sm:h-4" />
                Logout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />

      {/* SideCart para consistência da UI */}
      <SideCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        setItems={setCartItems}
      />
    </div>
  );
} 