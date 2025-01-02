import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
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
import { SoonPage } from './components/SoonPage';
import { LockedPage } from './components/LockedPage';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <CartProvider>
      <Router>
        <AuthProvider>
          <AnnouncementProvider>
            <ToastContainer />
            <Routes>
              <Route path="/locked" element={
                <>
                  <AnnouncementBar />
                  <LockedPage />
                </>
              } />
              
              <Route element={
                <>
                  <AnnouncementBar />
                  <Outlet />
                </>
              }>
                <Route path="/homepage" element={<HomePage />} />
                <Route path="/checkout" element={<CheckoutComponent />} />
                <Route path="/account/login" element={<AccountPage />} />
                <Route path="/form" element={<FormWithValidation />} />
                <Route path="/" element={<Navigate to="/homepage" replace />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginComponent />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/soon" element={<SoonPage />} />
              </Route>
            </Routes>
          </AnnouncementProvider>
        </AuthProvider>
      </Router>
    </CartProvider>
  )
}
