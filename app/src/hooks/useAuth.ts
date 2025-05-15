import { useState, useEffect } from 'react';

interface UseAuthReturn {
  token: string | null;
  setToken: (token: string | null) => void;
  refreshToken: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('jwt_token');
  });

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const { token: newToken } = await response.json();
        setToken(newToken);
        localStorage.setItem('jwt_token', newToken);
      } else {
        setToken(null);
        localStorage.removeItem('jwt_token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      setToken(null);
      localStorage.removeItem('jwt_token');
    }
  };

  useEffect(() => {
    if (token) {
      try {
        // Verifica se o token está no formato JWT (contém dois pontos)
        if (!token.includes('.')) {
          console.log('Token inválido, não está no formato JWT');
          return;
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
          console.log('Token inválido, formato JWT incorreto');
          return;
        }

        const decoded = JSON.parse(atob(parts[1]));
        const expirationTime = decoded.exp * 1000; // Convert to milliseconds
        const timeUntilExpiry = expirationTime - Date.now();

        if (timeUntilExpiry <= 0) {
          refreshToken();
        } else {
          const refreshTimer = setTimeout(refreshToken, timeUntilExpiry - 60000); // Refresh 1 minute before expiry
          return () => clearTimeout(refreshTimer);
        }
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
        // Não fazemos nada se o token for inválido
        // Isso permite que tokens temporários funcionem sem causar erros
      }
    }
  }, [token]);

  return { token, setToken, refreshToken };
} 