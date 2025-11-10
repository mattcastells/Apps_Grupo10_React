import SessionManager from '../utils/SessionManager';
import { API_CONFIG } from '../utils/constants';
import { MOCK_TOKEN, MOCK_OTP } from './mockData';
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
      console.log('📡 API Config:', API_CONFIG);
      console.log('🌐 Full URL:', `${API_CONFIG.BASE_URL}/auth/register`);
      
      // Mock mode
      if (API_CONFIG.USE_MOCK) {
        console.log('📱 Using MOCK mode');
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
          success: true,
          message: 'Usuario registrado exitosamente. Verifica tu email.',
          userId: '1',
        };
      }

      console.log('🌐 Making real API call...');
      const response = await apiClient.post('/auth/register', userRequest);
      console.log('✅ Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Registration error:', error.response?.data || error.message);
      console.error('📊 Error details:', error);
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
      // Mock mode
      if (API_CONFIG.USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));

        if (otp === MOCK_OTP) {
          const mockResponse = {
            token: MOCK_TOKEN,
            userId: '1',
            email: email,
            success: true,
            message: 'Email verificado exitosamente',
          };

          await SessionManager.setToken(mockResponse.token);
          return mockResponse;
        } else {
          throw new Error('Código OTP inválido');
        }
      }

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
