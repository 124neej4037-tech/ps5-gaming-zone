import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import GamesCatalogue from './pages/GamesCatalogue';
import AIAssistant from './pages/AIAssistant';
import BookingPage from './pages/BookingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route for Authenticated Users
function ProtectedUserRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Protected Route for Admin Users
function ProtectedAdminRoute({ children }) {
  const { currentUser, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" state={{ accessDeniedMessage: 'Access Denied: Administrator account (admin@gmail.com) is required to access the Admin Hub.' }} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/games" element={<GamesCatalogue />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected User Dashboard */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedUserRoute>
                    <UserDashboard />
                  </ProtectedUserRoute>
                } 
              />

              {/* Protected Admin Operations Hub */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } 
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
