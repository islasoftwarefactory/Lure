// @ts-nocheck
import { StrictMode }   from "react";
import App              from "./App";
import { createRoot }   from "react-dom/client";
import { 
  QueryClient, 
  QueryClientProvider } from '@tanstack/react-query';
import "./index.css";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const queryClient = new QueryClient();

// Initialize stripe with the publishable key directly
const stripePromise = loadStripe("pk_test_51REHMUDzEsgxQFt5rH0fgwO12lzFX4ItkUZ9iFuU5ZbevLg6RMRiiIf9w9eaDspG4ISYH5kAONOlDobLjxQ8G1vE00EQWfY2O8");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Elements stripe={stripePromise}>
      <App />
      </Elements>
    </QueryClientProvider>
  </StrictMode>
);
