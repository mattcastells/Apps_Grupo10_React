import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';
import SessionManager from '../utils/SessionManager';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check if user is authenticated
   */
  const checkAuth = async () => {
    try {
      setLoading(true);
      const authenticated = await SessionManager.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        // Load user data
        const userId = await SessionManager.getUserId();
        if (userId) {
          await loadUserData(userId);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load user data from API
   */
  const loadUserData = async (userId) => {
    try {
      const userData = await userService.getUser(userId);
      setUser(userData);
      await SessionManager.saveUserData(userData);
    } catch (error) {
      console.error('Load user data error:', error);
    }
  };

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setIsAuthenticated(true);

      // Load user data
      if (response.userId) {
        await loadUserData(response.userId);
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  /**
   * Register new user
   */
  const register = async (userRequest) => {
    try {
      const response = await authService.register(userRequest);
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  /**
   * Verify email with OTP
   */
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

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  /**
   * Update user data in context
   */
  const updateUser = async (userData) => {
    try {
      setUser(userData);
      await SessionManager.saveUserData(userData);
    } catch (error) {
      console.error('Update user context error:', error);
    }
  };

  /**
   * Refresh user data
   */
  const refreshUser = async () => {
    try {
      const userId = await SessionManager.getUserId();
      if (userId) {
        await loadUserData(userId);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    verifyEmail,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
