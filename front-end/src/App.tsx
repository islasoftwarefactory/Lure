import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from './context/AuthContext';
import { HomePage } from "./components/home-page";
import { AccountPage } from "./components/account-page";
import { CheckoutComponent } from "./components/checkout";
import FormWithValidation from "./components/FormWithValidation";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer />
        <Routes>
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/checkout" element={<CheckoutComponent />} />
          <Route path="/account/login" element={<AccountPage />} />
          <Route path="/form" element={<FormWithValidation />} />
          <Route path="/" element={<Navigate to="/homepage" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}
