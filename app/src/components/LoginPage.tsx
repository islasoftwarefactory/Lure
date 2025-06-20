import React, { useEffect } from 'react';
import GoogleSignInButton from './Auth/GoogleSignInButton'; // Import the button

// GA4 gtag declaration
declare global {
  function gtag(...args: any[]): void;
}

const LoginPage: React.FC = () => {
  // Fire GA4 page_view event for login page
  useEffect(() => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: 'Login',
        page_location: window.location.href,
        page_path: '/login'
      });

      console.log('GA4 page_view event fired for login page:', {
        page_title: 'Login',
        page_location: window.location.href,
        page_path: '/login'
      });
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>Bem-vindo!</h1>
      <p>Por favor, faça login para continuar:</p>
      <GoogleSignInButton />
      {/* Pode adicionar outros elementos visuais aqui */}
    </div>
  );
};

export default LoginPage; 