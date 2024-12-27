import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from './context/AuthContext';
import { AnnouncementProvider } from './contexts/AnnouncementContext';
import AnnouncementBar from './components/AnnouncementBar';
import { HomePage } from "./components/home-page";
import { AccountPage } from "./components/account-page";
import { CheckoutComponent } from "./components/checkout";
import FormWithValidation from "./components/FormWithValidation";
import { ContactPage } from './components/ContactPage';
import { LoginComponent } from './components/LoginComponent';
import { ProductPage } from './components/ProductPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AnnouncementProvider>
          <ToastContainer />
          <AnnouncementBar />
          <Routes>
            <Route path="/homepage" element={<HomePage />} />
            <Route path="/checkout" element={<CheckoutComponent />} />
            <Route path="/account/login" element={<AccountPage />} />
            <Route path="/form" element={<FormWithValidation />} />
            <Route path="/" element={<Navigate to="/homepage" replace />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginComponent />} />
            <Route path="/product/:id" element={<ProductPage />} />
          </Routes>
        </AnnouncementProvider>
      </AuthProvider>
    </Router>
  )
}
