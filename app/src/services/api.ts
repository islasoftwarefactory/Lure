import axios from 'axios';

// Configurando a API para ambiente de produção
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://lureclo.com';
// Garantir que estamos sempre usando HTTPS
const secureBaseUrl = apiBaseUrl.replace('http://', 'https://');

const api = axios.create({
  baseURL: secureBaseUrl,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Adicionar interceptors para melhor logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    console.log('Original token from storage:', token ? `${token.substring(0, 15)}...` : 'none');

    if (token && token !== 'undefined') {
      // Remover 'Bearer ' se já existir
      const cleanToken = token.replace('Bearer ', '');
      // Adicionar 'Bearer ' novamente
      const finalToken = `Bearer ${cleanToken}`;
      
      // Definir o header
      config.headers = {
        ...config.headers,
        'Authorization': finalToken,
        'Content-Type': 'application/json'
      };

      console.log('Final Authorization header:', `${finalToken.substring(0, 20)}...`);
    } else {
      console.warn('No valid token found in localStorage');
    }

    console.log('🚀 Requisição sendo enviada:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullUrl: config.url?.startsWith('http') ? config.url : `${config.baseURL}${config.url}`
    });
    return config;
  },
  (error) => {
    console.error('Error in request interceptor:', error);
    return Promise.reject(error);
  }
);

// Adicionar interceptor de resposta para debug
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      url: response.config.url,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      headers: error.config?.headers
    });
    
    // Log detalhado para ajudar no diagnóstico
    console.error('Detalhes completos do erro:', {
      name: error.name,
      code: error.code,
      networkError: error.isAxiosError,
      corsError: error.message.includes('CORS') || error.message.includes('cross-origin'),
      mixedContent: error.message.includes('Mixed Content'),
      responseData: error.response?.data
    });
    
    if (error.response?.status === 429) {
      // DDOS Protection error
      return Promise.reject(new Error('Too many requests. Please try again later.'));
    }
    return Promise.reject(error);
  }
);

export default api;
