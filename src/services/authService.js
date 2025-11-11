import SessionManager from '../utils/SessionManager';
import { apiClient } from "./apiClient";

/**
 * Authentication Service
 */
const authService = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Login response with token
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      // Save token
      if (response.data.token)
        await SessionManager.setToken(response.data.token);

      return response;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Register new user
   * @param {Object} userRequest - User registration data
   * @returns {Promise} Registration response
   */
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

  /**
   * Verify email with OTP
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @returns {Promise} Verification response with token
   */
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


  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} Password reset response
   */
  requestPasswordReset: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise} Password reset response
   */
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
