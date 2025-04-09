import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { LockedPage } from './components/LockedPage';
import { CartProvider } from './context/CartContext';
// import { Session } from '@supabase/supabase-js';
// import { supabase } from './lib/supabaseClient'; // Import client
// import LoginPage from './components/LoginPage'; // Importe a nova página de login
import { HomePage } from './components/home-page';
import { ProductPage } from './components/ProductPage';
import { LoginComponent } from './components/LoginComponent';
import { AnnouncementProvider } from './contexts/AnnouncementContext';

// Importe diretamente o AuthProvider do seu arquivo existente
import { AuthProvider } from './context/AuthContext'; 

export default function App() {
  // const [session, setSession] = useState<Session | null>(null);
  // const [loading, setLoading] = useState(true); // Adiciona estado de carregamento

  /* useEffect(() => {
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
  }, []); */

  /* const handleLogout = async () => {
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
  }; */

  // Mostra um indicador enquanto a sessão está sendo verificada
  /* if (loading) {
    return <div>Verificando sessão...</div>; // Use um componente de Spinner se preferir
  } */

  // Aninhamos os providers necessários para toda a aplicação
  return (
    <AuthProvider>
      <AnnouncementProvider>
        <CartProvider>
          <Router>
            <ToastContainer />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/login" element={<LoginComponent />} />
              
              {/* Rota catch-all redireciona para a raiz */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </CartProvider>
      </AnnouncementProvider>
    </AuthProvider>
  );
}

