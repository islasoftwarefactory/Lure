import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:60123',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Adicionar interceptors para melhor logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');

    console.log('API Interceptor: Token from localStorage("authToken"):', token ? token.substring(0, 10) + '...' : 'None');

    if (token && token !== 'undefined') {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('API Interceptor: Added Authorization header.');
    } else {
      console.log('API Interceptor: No valid token found, header not added.');
      delete config.headers['Authorization'];
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
    console.error('❌ Erro na configuração da requisição:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta recebida:', {
      status: response.status,
    });
    return response;
  },
  (error) => {
    console.error('❌ Erro na resposta:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      request_url: error.config?.url,
      request_method: error.config?.method,
    });
    return Promise.reject(error);
  }
);

export default api;
