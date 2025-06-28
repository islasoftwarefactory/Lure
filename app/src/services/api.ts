import axios from 'axios';

// Adicionar log detalhado das variáveis de ambiente
console.log('=== CONFIGURAÇÃO DA API ===');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('NODE_ENV:', import.meta.env.NODE_ENV);
console.log('Todas as vars de ambiente VITE_:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));

const api = axios.create({
  baseURL: 'http://api.locked.lureclo.com',
  timeout: 15000, // Aumentar timeout para 15 segundos
  headers: {
    'Content-Type': 'application/json',
  }
});

console.log('API configurada com baseURL:', api.defaults.baseURL);

// Adicionar interceptors para melhor logging
api.interceptors.request.use(
  (config) => {
    console.log('=== INTERCEPTOR DE REQUEST ===');
    console.log('Config completa:', config);
    console.log('URL final:', config.url?.startsWith('http') ? config.url : `${config.baseURL}${config.url?.startsWith('/') ? config.url : '/' + config.url}`);
    
    const token = localStorage.getItem('authToken');
    console.log('Token do storage:', token ? `${token.substring(0, 15)}...` : 'none');

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

      console.log('Authorization header aplicado:', `${finalToken.substring(0, 20)}...`);
    } else {
      console.warn('Nenhum token válido encontrado');
    }

    console.log('🚀 Enviando requisição:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullUrl: config.url?.startsWith('http') ? config.url : `${config.baseURL}${config.url?.startsWith('/') ? config.url : '/' + config.url}`,
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Erro no interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Adicionar interceptor de resposta para debug
api.interceptors.response.use(
  (response) => {
    console.log('=== INTERCEPTOR DE RESPONSE (SUCESSO) ===');
    console.log('✅ Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.log('=== INTERCEPTOR DE RESPONSE (ERRO) ===');
    console.error('❌ Erro na resposta:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      responseData: error.response?.data,
      isAxiosError: error.isAxiosError,
      isNetworkError: !error.response,
      stack: error.stack
    });
    
    if (error.response?.status === 429) {
      console.warn('🛡️ DDOS Protection ativada');
      return Promise.reject(new Error('Too many requests. Please try again later.'));
    }
    
    // Log específico para ERR_FAIL
    if (error.code === 'ERR_NETWORK' || error.message.includes('ERR_FAIL')) {
      console.error('🔥 ERRO DE REDE DETECTADO:', {
        possibleCauses: [
          'Servidor offline',
          'Problema de CORS',
          'SSL/HTTPS issues',
          'Firewall/DDOS protection',
          'DNS resolution issues'
        ],
        troubleshooting: {
          checkServer: 'Verificar se o servidor está online',
          checkCORS: 'Verificar configurações de CORS',
          checkSSL: 'Verificar certificado SSL',
          checkURL: 'Verificar se a URL está correta'
        }
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;