import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from './context/AuthContext';
import { AnnouncementProvider } from './contexts/AnnouncementContext';
import AnnouncementBar from './components/AnnouncementBar';
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
              <Route path="/" element={
                <>
                  <AnnouncementBar />
                  <LockedPage />
                </>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnnouncementProvider>
        </AuthProvider>
      </Router>
    </CartProvider>
  )
}
