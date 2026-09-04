import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationToast from './components/NotificationToast';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import FacilitiesPage from './pages/FacilitiesPage';
import ServicesPage from './pages/ServicesPage';
import StatusPage from './pages/StatusPage';
import CareRequestsPage from './pages/CareRequestsPage';

// Error Boundary Component to prevent full blank screens
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Safe Care caught an unexpected view error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="p-8 max-w-md w-full bg-white rounded-3xl border border-rose-200 shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-2xl font-black">
              !
            </div>
            <h2 className="text-xl font-bold text-slate-900">An unexpected display error occurred</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              We encountered an issue rendering this section. Click below to reload cleanly.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition"
              >
                Reload Page
              </button>
              <a
                href="/"
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition inline-flex items-center justify-center"
              >
                Return Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected Route Component: Requires login to explore facilities, services, live status, care requests, and dashboard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold text-slate-400">Verifying Safe Care Authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname,
          message: 'Please sign in or register to explore healthcare facilities, services, and live availability.'
        }}
        replace
      />
    );
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <ErrorBoundary>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Modules (Require Registration / Login to Explore & Operate) */}
                <Route
                  path="/facilities"
                  element={
                    <ProtectedRoute>
                      <FacilitiesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/services"
                  element={
                    <ProtectedRoute>
                      <ServicesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/status"
                  element={
                    <ProtectedRoute>
                      <StatusPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/care-requests"
                  element={
                    <ProtectedRoute>
                      <CareRequestsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>
          <Footer />
          <NotificationToast />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
