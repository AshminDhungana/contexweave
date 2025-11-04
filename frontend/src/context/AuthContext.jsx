import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user on app load
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]); // ✅ Fixed: Add token to dependencies

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
      setError('Session expired');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/auth/signup', {
        email,
        username,
        password
      });
      
      const { access_token } = response.data;
      localStorage.setItem('authToken', access_token);
      setToken(access_token);
      await fetchCurrentUser();
      
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Signup failed';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/auth/login', {
        email,
        password
      });
      
      const { access_token } = response.data;
      localStorage.setItem('authToken', access_token);
      setToken(access_token);
      await fetchCurrentUser();
      
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Login failed';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated,
        signup,
        login,
        logout,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
