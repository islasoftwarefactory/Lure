import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LockedPage } from './components/LockedPage';
import { CartProvider } from './context/CartContext';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient'; // Import client
import LoginPage from './components/LoginPage'; // Importe a nova página de login

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // Adiciona estado de carregamento

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      console.log("Initial session:", session);
      setLoading(false); // Termina o carregamento após a verificação inicial
    }).catch((error) => {
        console.error("Error getting session:", error);
        setLoading(false); // Garante que o carregamento pare em caso de erro
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Atualiza a sessão em qualquer mudança de autenticação
      setSession(session);
      console.log("Auth state changed:", _event, session);
      // Garante que o carregamento termine se a mudança não for a inicial
      if (_event !== 'INITIAL_SESSION') {
         setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLoading(true); // Opcional: mostrar carregando durante logout
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
      setLoading(false); // Parar carregando em caso de erro
    } else {
      console.log('Successfully logged out');
      // O estado da sessão será atualizado pelo listener,
      // e o estado de carregamento já foi tratado pelo listener também.
      // Se o listener não setar loading para false em logout, descomente a linha abaixo
      // setLoading(false);
    }
  };

  // Mostra um indicador enquanto a sessão está sendo verificada
  if (loading) {
    return <div>Verificando sessão...</div>; // Use um componente de Spinner se preferir
  }

  // O CartProvider pode envolver tudo, mas AuthProvider/AnnouncementProvider
  // podem ser necessários dentro das rotas ou em componentes específicos.
  return (
    <CartProvider>
      <Router>
          <ToastContainer />
          <Routes>
            <Route
              path="/"
              element={
                session ? (
                  // Usuário LOGADO na raiz: Mostra a página principal/protegida
                  <>
                    <LockedPage />
                    <button
                      onClick={handleLogout}
                      style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000, padding: '8px 12px', cursor: 'pointer' }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  // Usuário NÃO LOGADO na raiz: Redireciona para /auth
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route
              path="/auth"
              element={
                session ? (
                  // Usuário LOGADO tenta acessar /auth: Redireciona para a raiz
                  <Navigate to="/" replace />
                ) : (
                  // Usuário NÃO LOGADO acessa /auth: Mostra a página de login
                  <LoginPage />
                )
              }
            />

            {/* Adicione outras rotas protegidas aqui, se necessário */}
            {/* Exemplo: <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/auth" />} /> */}

            {/* Rota catch-all pode redirecionar para a raiz ou para /auth se preferir */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
      </Router>
    </CartProvider>
  );
}

