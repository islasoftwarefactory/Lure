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
// const stripePromise = loadStripe(import.meta.env.STRIPE_PUBLISHABLE_KEY)
const stripePromise = loadStripe("pk_test_51REHMcDClD4v1eQKQXawRtfdFesGdsmwEIcWyx0INLqS8IfMyDiqfo85zuLT3CT77Bst9uICCF0QD7OQYM7dPsCJ00Q7sMlzub")

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
