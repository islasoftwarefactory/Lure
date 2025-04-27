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

      {/* Conteúdo Principal com flex-grow e padding */}
      <main className="flex-grow flex items-center justify-center px-4 py-16 md:py-24">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-extrabold font-aleo mb-6 text-center">My Profile</h1>

          <div className="flex flex-col items-center space-y-4">
            {/* Foto do Perfil */}
            {userData.photo && (
              <img
                src={userData.photo}
                alt="User profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                onError={(e) => (e.currentTarget.style.display = 'none')} // Esconde se a imagem falhar
              />
            )}
            {!userData.photo && (
               <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-4xl font-bold">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : '?'}
               </div>
            )}


            {/* Informações do Usuário */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold">{userData.name}</h2>
              <p className="text-gray-600">{userData.email}</p>
              {userData.auth_provider && (
                 <p className="text-sm text-gray-500 mt-1">Logged in via: {userData.auth_provider}</p>
              )}
            </div>

            {/* Outras informações ou seções podem ser adicionadas aqui */}
            {/* Exemplo: <p>User ID: {userData.id}</p> */}

            {/* Botão de Logout */}
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="mt-6"
            >
              Logout
            </Button>

            {/* --- EDIT 2: Adicionar onClick ao botão "My Orders" --- */}
            <Button
              variant="outline"
              className="mt-2"
              onClick={handleGoToMyOrders} // Chama o handler de navegação
            >
              My Orders
            </Button>
             {/* --- FIM EDIT 2 --- */}

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