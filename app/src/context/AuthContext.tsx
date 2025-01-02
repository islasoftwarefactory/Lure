import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  login: () => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  getAnonymousToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Inicializa com token anônimo se não houver token salvo
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    } else {
      getAnonymousToken();
    }
  }, []);

  const getAnonymousToken = async () => {
    try {
      const response = await axios.get('/api/user/anonymous-token');
      const newToken = response.data.token;
      
      localStorage.setItem('anonymous_token', newToken);
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error) {
      console.error('Failed to get anonymous token:', error);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post('/api/user/refresh-token');
      const newToken = response.data.token;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // Se falhar o refresh, volta para token anônimo
      await getAnonymousToken();
    }
  };

  const login = async () => {
    setIsLoggedIn(true);
    // Aqui você pode adicionar a lógica de login com credenciais
    // Por enquanto, vamos apenas atualizar o estado
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    getAnonymousToken(); // Obtém um token anônimo após logout
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      token, 
      login, 
      logout,
      refreshToken,
      getAnonymousToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};