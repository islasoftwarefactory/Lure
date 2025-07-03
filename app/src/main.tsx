// @ts-nocheck
import { StrictMode }   from "react";
import App              from "./App";
import { createRoot }   from "react-dom/client";
import { 
  QueryClient, 
  QueryClientProvider } from '@tanstack/react-query';
import "./index.css";
import { loadStripe } from '@stripe/stripe-js';

const queryClient = new QueryClient();

// Carrega a chave pública da Stripe a partir das variáveis de ambiente (Vite)
// Esta é a forma segura e correta, evitando chaves no código
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
