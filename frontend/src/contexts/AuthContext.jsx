import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import { AuthContext } from '../hooks/useAuth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        const isValid = await authService.verifyToken();
        
        if (isValid && currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Token inválido, limpiar datos
          authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const { user: userData } = await authService.login(username, password);
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasRole = (role) => {
    return user && user.rol === role;
  };

  const hasAnyRole = (roles) => {
    return user && roles.includes(user.rol);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    hasRole,
    hasAnyRole,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
