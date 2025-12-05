import SessionManager from '../utils/SessionManager';

const createAuthService = (apiClient) => ({
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
      throw error;
    }
  },

  register: async (userRequest) => {
    try {
      const response = await apiClient.post('/auth/register', userRequest);
      return response.data;
    } catch (error) {
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
      throw error;
    }
  },

  resendOtp: async (email) => {
    try {
      const response = await apiClient.post('/auth/resend-otp', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
});

export default createAuthService;
