import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('safecare_token'));
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const loadUser = async () => {
    const storedToken = localStorage.getItem('safecare_token');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authAPI.getMe();
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      localStorage.removeItem('safecare_token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      if (res.data.success) {
        localStorage.setItem('safecare_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        showNotification(`Welcome back, ${res.data.user.name}!`, 'success');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      showNotification(message, 'error');
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authAPI.register(userData);
      if (res.data.success) {
        localStorage.setItem('safecare_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        showNotification('Registration successful! Welcome to Safe Care.', 'success');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please check your details.';
      showNotification(message, 'error');
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('safecare_token');
    setToken(null);
    setUser(null);
    showNotification('Logged out successfully.', 'info');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isStaff: user?.role === 'staff',
    isPatient: user?.role === 'patient',
    login,
    register,
    logout,
    notification,
    showNotification
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
