import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api'; // Importar o serviço da API

// GA4 gtag declaration
declare global {
  function gtag(...args: any[]): void;
}

// Interface que define o que estará disponível no contexto
interface AuthContextType {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, userData?: any) => void; // Ajustado para aceitar dados do usuário
  logout: () => void;
  getAnonymousToken: () => Promise<void>; // Mudança: não precisa retornar, apenas define o estado
}

// Criando o contexto com valores padrão
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  getAnonymousToken: async () => {}
});

// Hook personalizado para acessar o contexto
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider do contexto
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  // Tenta inicializar o token do localStorage
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  // Define isAuthenticated com base na existência inicial do token (simplificação)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token && token !== 'undefined'); // Verifica se token existe e não é a string 'undefined'

  // Efeito para sincronizar localStorage quando o token muda
  useEffect(() => {
    if (token && token !== 'undefined') {
      localStorage.setItem('authToken', token);
      setIsAuthenticated(true);
      // Idealmente, você buscaria os dados do usuário aqui se o token for real
      // Ex: if (token is not anonymous) fetchUserData(token);
    } else {
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [token]);


  const login = (newToken: string, userData: any = null) => {
    setToken(newToken);
    // setUser(userData || { id: 'simulated', name: 'User' }); // Define o usuário recebido ou um simulado
    
    // Fire GA4 login event as backup (if not already fired in GoogleSignInButton)
    if (typeof gtag !== 'undefined' && newToken && !newToken.includes('anonymous')) {
      // Only fire if this is not an anonymous token
      gtag('event', 'login', {
        method: 'Context_Backup' // Different method to distinguish from GoogleSignInButton events
      });
      
      console.log('GA4 login event fired from AuthContext:', {
        method: 'Context_Backup',
        token_preview: newToken.substring(0,10) + '...'
      });
    }
    
    console.log('Login realizado com token:', newToken ? newToken.substring(0,10) + '...' : 'None');
  };

  const logout = () => {
    setToken(null); // Isso vai disparar o useEffect para limpar localStorage e isAuthenticated
    // Remove legacy auth token key if present
    localStorage.removeItem('auth_token');
    console.log('Logout realizado');
  };

  // Função corrigida para buscar o token anônimo REAL da API
  const getAnonymousToken = async (): Promise<void> => {
    // Log inicial: a função foi chamada
    console.log("AuthContext: getAnonymousToken function called.");
    try {
      // Log antes da chamada da API
      console.log("AuthContext: >>> Sending request to API: GET /user/anonymous-token");
      const response = await api.get('/user/anonymous-token');
      // Log após receber a resposta da API com sucesso
      console.log("AuthContext: <<< Received response from API: GET /user/anonymous-token", response.status, response.data);

      const realAnonymousToken = response.data.token;
      if (realAnonymousToken) {
        console.log('AuthContext: Real anonymous token received:', realAnonymousToken ? realAnonymousToken.substring(0,10) + '...' : 'None');
        setToken(realAnonymousToken);
      } else {
         // Log se a resposta não contiver o token esperado
         console.error('AuthContext: API response successful, but token field missing in data:', response.data);
         setToken(null); // Garante que o estado fique nulo
      }
    } catch (error: any) { // Tipagem 'any' ou 'unknown' para erro
      // Log se a chamada da API falhar (erro de rede, erro 500, etc.)
      console.error("AuthContext: XXX API call failed: GET /user/anonymous-token", error.response?.status, error.message, error.response?.data);
      setToken(null);
    }
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