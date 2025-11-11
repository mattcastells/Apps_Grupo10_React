import SessionManager from '../utils/SessionManager';
import { apiClient } from "./apiClient";

const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      if (response.data.token)
        await SessionManager.setToken(response.data.token);

      return response;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  register: async (userRequest) => {
    try {
      console.log('🚀 Registering user:', userRequest);
      const response = await apiClient.post('/auth/register', userRequest);
      console.log('✅ Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Registration error:', error.response?.data || error.message);
      throw error;
    }
  },

  verifyEmail: async (email, otp) => {
    try {
      const response = await apiClient.post('/auth/verify-email', {
        email,
        otp,
      });

      // Save auth data after successful verification
      if (response.data.token) {
        await SessionManager.setToken(response.data.token, email, response.data.userId);
      }

      return response.data;
    } catch (error) {
      console.error('Email verification error:', error.response?.data || error.message);
      throw error;
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error.response?.data || error.message);
      throw error;
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error('Password reset error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default authService;
