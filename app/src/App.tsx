import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from './context/AuthContext';
import { AnnouncementProvider } from './contexts/AnnouncementContext';
import { LockedPage } from './components/LockedPage';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <CartProvider>
      <Router>
        <AuthProvider>
          <ToastContainer />
          <Routes>
            <Route path="/" element={
              <>
                <LockedPage />
              </>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </CartProvider>
  )
}

