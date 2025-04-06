import React from 'react';
import GoogleSignInButton from './Auth/GoogleSignInButton'; // Import the button

const LoginPage: React.FC = () => {
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