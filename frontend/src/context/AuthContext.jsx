import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const clearSession = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await API.get('/admin/auth/me');
        setAdmin({ ...data, token });
      } catch (error) {
        console.error('Session restore failed:', error);
        clearSession();
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/admin/auth/login', { email, password });
    localStorage.setItem('adminToken', data.token);
    setAdmin(data);
    navigate('/admin/dashboard');
  };

  const logout = () => {
    clearSession();
    navigate('/admin/login');
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
