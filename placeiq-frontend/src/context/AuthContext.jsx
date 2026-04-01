import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/api/auth/me/');
          setUser(res.data);
          setRole(res.data.role);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.clear();
          setToken(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login/', { email, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    setToken(res.data.access);
    
    // Fetch user details immediately
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
    const userRes = await api.get('/api/auth/me/');
    setUser(userRes.data);
    setRole(userRes.data.role);
    setIsAuthenticated(true);
    return userRes.data.role;
  };

  const register = async (userData) => {
    const res = await api.post('/api/auth/register/', userData);
    return res.data;
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, role, isAuthenticated, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
