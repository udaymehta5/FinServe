import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('finToken') || null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Auto logout timer reference
  let logoutTimer;

  // Custom Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Decode JWT to extract expiration timestamp
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) {
      return null;
    }
  };

  // Start auto-logout timer based on token expiry
  const setAutoLogout = (expiryTime) => {
    if (logoutTimer) clearTimeout(logoutTimer);
    
    const timeRemaining = expiryTime * 1000 - Date.now();
    if (timeRemaining > 0) {
      logoutTimer = setTimeout(() => {
        logout();
        showToast('Session expired. Please log in again.', 'error');
      }, timeRemaining);
    } else {
      logout();
    }
  };

  // Check login state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('finToken');
      const storedUser = localStorage.getItem('finUser');

      if (storedToken && storedUser) {
        const decoded = parseJwt(storedToken);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setAutoLogout(decoded.exp);
        } else {
          // Token expired
          localStorage.removeItem('finToken');
          localStorage.removeItem('finUser');
        }
      }
      setLoading(false);
    };

    initializeAuth();
    
    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, []);

  // Register action
  const register = async (name, email, password, confirmPassword) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, confirmPassword });
      if (res.data.success) {
        const { token, user: userData } = res.data;
        localStorage.setItem('finToken', token);
        localStorage.setItem('finUser', JSON.stringify(userData));
        setToken(token);
        setUser(userData);
        
        const decoded = parseJwt(token);
        if (decoded) setAutoLogout(decoded.exp);

        showToast('Registration successful! Welcome to FinServe.');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  // Login action
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user: userData } = res.data;
        localStorage.setItem('finToken', token);
        localStorage.setItem('finUser', JSON.stringify(userData));
        setToken(token);
        setUser(userData);

        const decoded = parseJwt(token);
        if (decoded) setAutoLogout(decoded.exp);

        showToast(`Welcome back, ${userData.name}!`);
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid email or password';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  // Logout action
  const logout = () => {
    if (logoutTimer) clearTimeout(logoutTimer);
    localStorage.removeItem('finToken');
    localStorage.removeItem('finUser');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully.');
  };

  // Update profile action (e.g., incomes, financial goals, password)
  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/user', profileData);
      if (res.data.success) {
        const updatedUser = res.data.user;
        localStorage.setItem('finUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
        showToast('Profile settings updated successfully!');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Profile update failed';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        toast,
        showToast,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
