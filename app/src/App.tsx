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
import { ProfilePage } from './components/ProfilePage';
import { CheckoutComponent } from './components/checkout';
import { OrderPage } from './components/OrderPage';
import { MyOrdersPage } from './components/MyOrdersPage';
import { AddressesPage } from './components/AddressesPage';
import { FavoritesPage } from './components/FavoritesPage';
import { ContactPage } from './components/ContactPage';
import { AnnouncementProvider } from './contexts/AnnouncementContext';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Home from './components/page';
import { LockProvider } from './context/LockContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SalesDashboard } from './components/SalesDashboard';
import { WaitlistDashboard } from './components/WaitlistDashboard';
// Footer Pages
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsOfServicePage } from './components/TermsOfServicePage';
import { ShippingPolicyPage } from './components/ShippingPolicyPage';
import { AboutUsPage } from './components/AboutUsPage';

// Importe diretamente o AuthProvider do seu arquivo existente
// import { AuthProvider } from './context/AuthContext'; 

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
  /* if (loading) {d
    return <div>Verificando sessão...</div>; // Use um componente de Spinner se preferir
  } */

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  // Aninhamos os providers necessários para toda a aplicação
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <LockProvider>
          <AnnouncementProvider>
            <CartProvider>
              <Router>
                <ToastContainer />
                <Routes>
                  <Route path="/locked" element={<Home />} />
                  <Route path="/login" element={<LoginComponent />} />
                  
                  {/* Public Footer Pages - No authentication required */}
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                  <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                  <Route path="/about-us" element={<AboutUsPage />} />
                  
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/addresses" element={<AddressesPage />} />
                    <Route path="/checkout" element={<CheckoutComponent />} />
                    <Route path="/order-page/:id" element={<OrderPage />} />
                    <Route path="/my-orders-list" element={<MyOrdersPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/dashboard" element={<SalesDashboard />} />
                    <Route path="/waitlist-dashboard" element={<WaitlistDashboard />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/locked" replace />} />
                </Routes>
              </Router>
            </CartProvider>
          </AnnouncementProvider>
        </LockProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

