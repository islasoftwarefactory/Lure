import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface GoogleLoginButtonProps {
  className?: string;
  redirectTo?: string;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ className, redirectTo = '/' }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      // Processar login com o token recebido
      login(credentialResponse.credential);
      // Redirecionar para a página desejada
      navigate(redirectTo);
    }
  };
  
  const handleError = () => {
    console.error('Login com Google falhou');
  };
  
  return (
    <div className={className}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme="outline"
        size="large"
        text="continue_with"
        shape="pill"
      />
    </div>
  );
};

export default GoogleLoginButton; 