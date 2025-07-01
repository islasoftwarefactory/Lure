"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { X } from "lucide-react"
import api from '@/services/api';

interface WaitlistFormProps {
  className?: string
}

interface ScrapingResponse {
  data: {
    id: number;
    contact_value: string;
    contact_type_id: number;
    created_at: string;
  };
  message: string;
}

interface ApiError {
  error: string;
  details?: string;
}

export default function WaitlistForm({ className }: WaitlistFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateFullName = (name: string): boolean => {
    return name.trim().includes(' '); // Verifica se tem pelo menos um espaço
  };

  const testConnectivity = async () => {
    console.log('=== TESTE DE CONECTIVIDADE COMPLETO ===');
    
    // Teste 1: Health Check (está configurado diretamente no nginx)
    try {
      console.log('🏥 TESTE 1: Health Check...');
      const healthUrl = `${import.meta.env.VITE_API_BASE_URL || 'https://locked.lureclo.com'}/health`;
      console.log('URL de health:', healthUrl);
      
      const healthResponse = await fetch(healthUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      console.log('✅ HEALTH CHECK SUCESSO:', {
        status: healthResponse.status,
        statusText: healthResponse.statusText,
        headers: Object.fromEntries(healthResponse.headers.entries())
      });
      
      const healthData = await healthResponse.text();
      console.log('Health data:', healthData);
      
    } catch (error) {
      console.error('❌ HEALTH CHECK FALHOU:', error);
    }
    
    // Teste 2: API Contact Types (via proxy /api/)
    try {
      console.log('📞 TESTE 2: API Contact Types...');
      const testUrl = `${import.meta.env.VITE_API_BASE_URL || 'https://locked.lureclo.com'}/api/scraping/contact-types`;
      console.log('URL de teste API:', testUrl);
      
      const fetchResponse = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ API CONTACT TYPES SUCESSO:', {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers: Object.fromEntries(fetchResponse.headers.entries())
      });
      
      const apiData = await fetchResponse.text();
      console.log('API data:', apiData);
      
    } catch (error) {
      console.error('❌ API CONTACT TYPES FALHOU:', error);
    }
    
    // Teste 3: Axios (usando baseURL configurado)
    try {
      console.log('⚡ TESTE 3: Axios com baseURL...');
      const axiosResponse = await api.get('scraping/contact-types');
      console.log('✅ AXIOS SUCESSO:', axiosResponse);
      
    } catch (error) {
      console.error('❌ AXIOS FALHOU:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== INICIO DO HANDLESUBMIT ===');
    
    // Executar teste de conectividade primeiro
    await testConnectivity();
    
    setLoading(true);
    setError(null);

    console.log('Estado inicial:', {
      email,
      fullName,
      loading,
      error,
      timestamp: new Date().toISOString()
    });

    console.log('Variáveis de ambiente disponíveis:', {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_API_URL: import.meta.env.VITE_API_URL,
      NODE_ENV: import.meta.env.NODE_ENV,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD
    });

    if (!validateFullName(fullName)) {
      console.log('❌ Validação de nome falhou:', {
        fullName,
        hasSpace: fullName.includes(' '),
        trimmedLength: fullName.trim().length
      });
      setError('Please enter your full name (Name and Last Name)');
      setLoading(false);
      return;
    }

    const requestData = {
      full_name: fullName,
      contact_value: email,
      contact_type_id: 1
    };

    console.log('=== PREPARAÇÃO DA REQUISIÇÃO ===');
    console.log('Dados da requisição:', requestData);
    console.log('JSON stringified:', JSON.stringify(requestData));
    
    // Validação adicional dos dados
    console.log('Validações dos dados:', {
      emailValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      fullNameValid: fullName.trim().includes(' '),
      contactTypeValid: typeof requestData.contact_type_id === 'number'
    });

    try {
      console.log('=== ENVIANDO REQUISIÇÃO PRINCIPAL ===');
      console.log('Timestamp da requisição:', new Date().toISOString());
      
      // Headers explícitos
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest' // Para ajudar com CORS
      };
      
      console.log('Headers da requisição:', headers);
      
      const response = await api.post<ScrapingResponse>('scraping/create', requestData, {
        headers,
        timeout: 20000, // 20 segundos
        validateStatus: function (status) {
          console.log('Validando status da resposta:', status);
          return status >= 200 && status < 300;
        }
      });
      
      console.log('=== RESPOSTA RECEBIDA COM SUCESSO ===');
      console.log('Status:', response.status);
      console.log('Headers da resposta:', response.headers);
      console.log('Dados da resposta:', response.data);
      console.log('Timestamp da resposta:', new Date().toISOString());

      setSuccess(true);
      setEmail('');
      setFullName('');
      console.log('✅ FORMULÁRIO RESETADO COM SUCESSO');
      
    } catch (error: any) {
      console.log('=== ERRO CAPTURADO NO CATCH ===');
      console.log('Timestamp do erro:', new Date().toISOString());
      console.error('Objeto de erro completo:', error);
      
      // Análise detalhada do erro
      console.log('=== ANÁLISE DETALHADA DO ERRO ===');
      console.log('Tipo:', typeof error);
      console.log('Constructor:', error.constructor.name);
      console.log('Message:', error.message);
      console.log('Name:', error.name);
      console.log('Stack:', error.stack);
      
      // Propriedades específicas do Axios
      if (error.isAxiosError) {
        console.log('=== AXIOS ERROR DETAILS ===');
        console.log('Código:', error.code);
        console.log('Config:', error.config);
        
        if (error.response) {
          console.log('=== RESPOSTA DO SERVIDOR (ERRO) ===');
          console.log('Status:', error.response.status);
          console.log('Status Text:', error.response.statusText);
          console.log('Headers:', error.response.headers);
          console.log('Data:', error.response.data);
        } else if (error.request) {
          console.log('=== REQUEST SEM RESPOSTA ===');
          console.log('Request readyState:', error.request.readyState);
          console.log('Request status:', error.request.status);
          console.log('Request response:', error.request.response);
          console.log('Request responseText:', error.request.responseText);
          console.log('Request responseURL:', error.request.responseURL);
        } else {
          console.log('=== ERRO DE CONFIGURAÇÃO ===');
          console.log('Erro ao configurar requisição');
        }
      }
      
      // Análise específica para ERR_FAIL
      if (error.message && error.message.includes('ERR_FAIL')) {
        console.log('=== DIAGNÓSTICO ERR_FAIL ===');
        console.log('Este erro geralmente indica:');
        console.log('1. Servidor não está respondendo');
        console.log('2. Problema de CORS');
        console.log('3. SSL/certificado inválido');
        console.log('4. Firewall/proxy bloqueando');
        console.log('5. URL incorreta');
        
        // Sugestões de troubleshooting
        console.log('=== TROUBLESHOOTING SUGERIDO ===');
        console.log('1. Verificar se a URL está correta');
        console.log('2. Testar a URL diretamente no navegador');
        console.log('3. Verificar logs do servidor');
        console.log('4. Verificar configurações de CORS');
        console.log('5. Verificar certificado SSL');
      }
      
      // Tratamento de erro para o usuário
      const apiError = error.response?.data as ApiError;
      let errorMessage = 'Failed to join waitlist. Please try again.';
      
      if (apiError?.error) {
        errorMessage = apiError.error;
      } else if (error.message) {
        errorMessage = `Network error: ${error.message}`;
      }
      
      console.log('=== ERRO FINAL PARA O USUÁRIO ===');
      console.log('Mensagem:', errorMessage);
      
      setError(errorMessage);
    } finally {
      console.log('=== LIMPEZA FINAL ===');
      console.log('Definindo loading como false');
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      {/* Join Waitlist Button - Full width primary button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-white text-black hover:bg-gray-100 border border-gray-200 font-medium py-6 text-lg shadow-md transition-all duration-200 hover:shadow-lg font-recoleta w-full"
      >
        Join Waitlist
      </Button>

      {/* Waitlist Form Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md backdrop-blur-md bg-white/90 border border-white/20 shadow-lg font-recoleta">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold font-recoleta">Secure Your Early Access</DialogTitle>
            <DialogDescription className="text-base font-recoleta">
              Enter your details below to join our waitlist.
            </DialogDescription>
          </DialogHeader>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          {success ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-4 rounded-full bg-green-100 p-3">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 font-recoleta">Thank you!</h3>
              <p className="mt-2 text-gray-500 font-recoleta">You've been added to our waitlist.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="fullName" className="font-recoleta">
                  Full Name (Name and Last Name)
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Ex: Phil Knigh"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full font-recoleta py-6"
                  disabled={loading}
                />
              </div>

              <div className="grid w-full items-center gap-2">
                <Label htmlFor="email" className="font-recoleta">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full font-recoleta py-6"
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full font-recoleta py-6 mt-4" disabled={loading}>
                {loading ? 'Joining...' : 'Join Waitlist'}
              </Button>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
