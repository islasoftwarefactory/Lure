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

// Initialize stripe with the publishable key directly
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
