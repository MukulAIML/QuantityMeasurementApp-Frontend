import React, { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    return username && token ? { username, token } : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiLogin(username, password);
      const { token, username: uname } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', uname);
      setUser({ username: uname, token });
      return true;
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid credentials');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRegister(username, password);
      const { token, username: uname } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', uname);
      setUser({ username: uname, token });
      return true;
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed. Username may already exist.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
