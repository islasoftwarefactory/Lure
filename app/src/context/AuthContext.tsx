import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '@/config';
import axios from 'axios';

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
  login: () => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  getAnonymousToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const getAnonymousToken = async () => {
    try {
      const url = `${API_URL}/user/anonymous-token`;
      const response = await axios.get(url);
      const newToken = response.data.token;
      
      setToken(newToken);
      localStorage.setItem('jwt_token', newToken);
    } catch (error) {
      // Handle error silently
    }
  };

  useEffect(() => {
    getAnonymousToken();
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsLoggedIn(true);
    }
  }, [token]);

  const refreshToken = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/refresh-token`);
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('jwt_token', newToken);
    } catch (error) {
      await getAnonymousToken();
    }
  };

  const login = async () => {
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setIsLoggedIn(false);
    setToken(null);
  };

  const contextValue: AuthContextType = {
    isLoggedIn,
    token,
    setToken,
    login,
    logout,
    refreshToken,
    getAnonymousToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
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