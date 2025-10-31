import React, { createContext, useState, useEffect, useContext } from 'react';
import SessionManager, { saveToken, removeToken, getToken } from '../utils/SessionManager';
import authService, { requestOtp, validateOtp } from '../services/authService';
import userService from "../services/userService";
import { extractUserIdFromToken } from "../utils/helpers";

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
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const authenticated = await SessionManager.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        // Load user data
        const token = await SessionManager.getToken();
        if (token) {
          await loadUserData(token);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setToken(null);
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

  // Login User
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setIsAuthenticated(true);
      setToken(response.data.token);

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register new user
  const register = async (userRequest) => {
    try {
      const response = await authService.register(userRequest);
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  // Verify email with OTP
  const verifyEmail = async (email, otp) => {
    try {
      const response = await authService.verifyEmail(email, otp);
      setIsAuthenticated(true);

      // Load user data
      if (response.userId) {
        await loadUserData(response.userId);
      }

      return response;
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  };

  // TODO: Update user data in context
  const logout = async () => {
    try {
      await SessionManager.clear();
      setIsAuthenticated(false);
      setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // TODO: Update user data in context
  const updateUser = async (userData) => {
    try {
      setUser(userData);
      await SessionManager.saveUserData(userData);
    } catch (error) {
      console.error('Update user context error:', error);
    }
  };

  // TODO: Update user data in context
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};