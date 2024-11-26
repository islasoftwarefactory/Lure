import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Adicionar interceptors para melhor logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 Requisição sendo enviada:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullUrl: config.baseURL + config.url
    });
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta recebida:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Erro na resposta:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      }
    });
    return Promise.reject(error);
  }
);

export default api;
