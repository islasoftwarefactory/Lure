'use client'

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { AnnouncementBar } from './AnnouncementBar';
import { SideCart } from "./SideCart";
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // Importa o useAuth correto
import api from '@/services/api'; // Importa a instância da API
import { Button } from "@/components/ui/button"; // Para o botão de logout
import { Link } from "react-router-dom";

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

  // Renderização condicional durante o carregamento ou erro
  if (isLoading) {
    return (
        <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
          <AnnouncementBar />
          <Header onCartClick={() => setIsCartOpen(true)} />
          <main className="flex-grow flex items-center justify-center">
            <div>Loading profile...</div>
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
               <p className="text-red-600 font-semibold">Error loading profile:</p>
               <p className="text-red-500">{error}</p>
               <Button onClick={() => navigate('/login')} className="mt-4">Go to Login</Button>
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
            <div>No profile data available.</div>
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

      <main className="flex-grow bg-[#f7f7f7] py-12 sm:py-16">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8 md:flex md:items-start md:gap-8">
              
              {/* Coluna do Avatar */}
              <div className="flex-shrink-0 flex flex-col items-center text-center md:w-1/3">
                <div className="relative">
                  {userData.photo && (
                    <img
                      src={userData.photo}
                      alt="User profile"
                      className="w-32 h-32 rounded-full object-cover ring-4 ring-offset-2 ring-indigo-500"
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  {!userData.photo && (
                     <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-5xl font-bold ring-4 ring-offset-2 ring-gray-300">
                        {userData.name ? userData.name.charAt(0).toUpperCase() : '?'}
                     </div>
                  )}
                </div>
                <h1 className="mt-4 text-2xl font-bold text-gray-900">{userData.name}</h1>
                {userData.auth_provider && (
                  <p className="text-sm text-gray-500">
                    Logged in with {userData.auth_provider}
                  </p>
                )}
              </div>

              {/* Coluna de Detalhes e Ações */}
              <div className="mt-8 md:mt-0 flex-grow border-t border-gray-200 md:border-t-0 md:border-l md:pl-8 pt-8 md:pt-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Information</h2>
                <dl className="space-y-5">
                  
                  {/* Chave-Valor: Email */}
                  <div className="flex">
                    <dt className="w-1/3 font-medium text-gray-500">Email Address</dt>
                    <dd className="w-2/3 text-gray-900 break-words">{userData.email}</dd>
                  </div>

                  {/* Chave-Valor: Status */}
                  <div className="flex">
                    <dt className="w-1/3 font-medium text-gray-500">Account Status</dt>
                    <dd className="w-2/3">
                       <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Active
                       </span>
                    </dd>
                  </div>
                  
                  {/* Adicione outros campos aqui se necessário */}

                </dl>

                {/* Botões de Ação */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-x-3 gap-y-3">
                  <Button
                    variant="outline"
                    onClick={handleGoToMyOrders}
                    className="w-full sm:w-auto"
                  >
                    My Orders
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="w-full sm:w-auto"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
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