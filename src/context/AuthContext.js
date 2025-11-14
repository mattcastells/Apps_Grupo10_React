import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from 'react';
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
  const [user, setUser] = useState(null);
  const [hasBiometricAuthenticated, setHasBiometricAuthenticated] = useState(false);

  const { apiClient, authService, userService } = useMemo(() => {
    const client = createApiClient();
    const auth = createAuthService(client);
    const userAxios = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
    });

    userAxios.interceptors.request.use(
      async (config) => {
        const token = await SessionManager.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const user = createUserService(userAxios);

    return { apiClient: client, authService: auth, userService: user };
  }, []);

  const loadUserData = useCallback(
    async (token) => {
      try {
        const userId = extractUserIdFromToken(token);
        const userData = await userService.getUser(userId);
        setUser(userData);
      } catch (error) {
        console.error('Load user data error:', error);
      }
    },
    [userService]
  );

  const checkAuth = useCallback(async () => {
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
    } finally {
      setIsLoading(false);
    }
  }, [loadUserData]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(
    async (email, password) => {
      try {
        const response = await authService.login(email, password);
        const { token } = response.data;
        await SessionManager.setToken(token);
        await loadUserData(token);
        setIsAuthenticated(true);
        setHasBiometricAuthenticated(true);
        return response;
      } catch (error) {
        console.error('Login error:', error);
        // IMPORTANTE: Asegurarse de que el estado de autenticación NO se setee en caso de error
        setIsAuthenticated(false);
        setUser(null);
        setHasBiometricAuthenticated(false);
        throw error;
      }
    },
    [authService, loadUserData]
  );

  const register = useCallback(
    async (userRequest) => {
      return await authService.register(userRequest);
    },
    [authService]
  );

  const verifyEmail = useCallback(
    async (email, otp) => {
      return await authService.verifyEmail(email, otp);
    },
    [authService]
  );

  const resendOtp = useCallback(
    async (email) => {
      return await authService.resendOtp(email);
    },
    [authService]
  );

  const logout = useCallback(async () => {
    await SessionManager.clear();
    setIsAuthenticated(false);
    setUser(null);
    setHasBiometricAuthenticated(false);
  }, []);

  const markBiometricAuthenticated = useCallback(() => {
    setHasBiometricAuthenticated(true);
  }, []);

  const needsBiometricAuth = useCallback(() => {
    return !hasBiometricAuthenticated;
  }, [hasBiometricAuthenticated]);

  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = await SessionManager.getToken();
    if (token) {
      await loadUserData(token);
    }
  }, [loadUserData]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      isLoading,
      login,
      register,
      verifyEmail,
      resendOtp,
      logout,
      updateUser,
      refreshUser,
      markBiometricAuthenticated,
      needsBiometricAuth,
    }),
    [
      isAuthenticated,
      user,
      isLoading,
      login,
      register,
      verifyEmail,
      resendOtp,
      logout,
      updateUser,
      refreshUser,
      markBiometricAuthenticated,
      needsBiometricAuth,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
