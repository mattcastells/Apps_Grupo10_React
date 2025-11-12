import React, { createContext, useState, useEffect, useContext } from 'react';
import SessionManager from '../utils/SessionManager';
import createAuthService from '../services/authService';
import createUserService from '../services/userService';
import { extractUserIdFromToken } from '../utils/helpers';
import axios from 'axios';
import { API_CONFIG } from '../utils/constants';
import { createApiClient } from '../services/apiClient';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);

  // 🔐 Estado en memoria para tracking de autenticación biométrica
  const [hasBiometricAuthenticated, setHasBiometricAuthenticated] = useState(false);

  const apiClient = createApiClient();
  const authService = createAuthService(apiClient);

  const axiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  axiosInstance.interceptors.request.use(
    async (config) => {
      const token = await SessionManager.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  const userService = createUserService(axiosInstance);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const authenticated = await SessionManager.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const token = await SessionManager.getToken();
        if (token) {
          await loadUserData(token);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async (token) => {
    try {
      const userId = extractUserIdFromToken(token);
      const user = await userService.getUser(userId);
      setUser(user);
    } catch (error) {
      console.error('Load user data error:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { token } = response.data;

      await SessionManager.setToken(token);
      await loadUserData(token);

      setIsAuthenticated(true);
      setTokenState(token);

      // 🔐 Cuando el usuario se loguea manualmente, marcarlo como autenticado biométricamente
      setHasBiometricAuthenticated(true);

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userRequest) => {
    try {
      const response = await authService.register(userRequest);
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const verifyEmail = async (email, otp) => {
    try {
      const response = await authService.verifyEmail(email, otp);
      setIsAuthenticated(true);

      // 🔐 Al verificar email en registro, marcarlo como autenticado biométricamente
      setHasBiometricAuthenticated(true);

      if (response.userId) {
        await loadUserData(response.userId);
      }

      return response;
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SessionManager.clear();
      setIsAuthenticated(false);
      setTokenState(null);
      setUser(null);
      setHasBiometricAuthenticated(false); // 🔐 Resetear autenticación biométrica
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // 🔐 Marcar que el usuario se autenticó exitosamente con biometría en esta sesión
  const markBiometricAuthenticated = () => {
    setHasBiometricAuthenticated(true);
  };

  // 🔐 Verificar si ya se autenticó con biometría en esta sesión
  const needsBiometricAuth = () => {
    return !hasBiometricAuthenticated;
  };

  const updateUser = async (userData) => {
    try {
      setUser(userData);
    } catch (error) {
      console.error('Update user context error:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const token = await SessionManager.getToken();
      if (token) {
        await loadUserData(token);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    register,
    verifyEmail,
    logout,
    updateUser,
    refreshUser,
    // 🔐 Funciones para manejo de autenticación biométrica
    markBiometricAuthenticated,
    needsBiometricAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
