import React, { createContext, useContext, useState } from 'react';

// Interface que define o que estará disponível no contexto
interface AuthContextType {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  getAnonymousToken: () => Promise<string>;
}

// Criando o contexto com valores padrão
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  getAnonymousToken: async () => ""
});

// Hook personalizado para acessar o contexto
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider do contexto
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (newToken: string) => {
    // Simulação simplificada de login
    setToken(newToken);
    setIsAuthenticated(true);
    setUser({ id: '1', name: 'User', email: 'user@example.com' });
    console.log('Login realizado com token:', newToken);
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    console.log('Logout realizado');
  };

  const getAnonymousToken = async (): Promise<string> => {
    // Simulação de obtenção de token anônimo
    const anonymousToken = "anonymous-token-" + Math.random().toString(36).substring(2, 8);
    console.log('Token anônimo gerado:', anonymousToken);
    return anonymousToken;
  };

  const value = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    getAnonymousToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};