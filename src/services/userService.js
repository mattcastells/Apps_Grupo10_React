import { API_CONFIG } from '../utils/constants';
import { MOCK_USER } from './mockData';
import { apiClientAuth } from "./apiClient";

/**
 * User Service
 */
const userService = {
  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise} User data
   */
  getUser: async (id) => {
    try {
      // Mock mode
      if (API_CONFIG.USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_USER;
      }

      const response = await apiClientAuth.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get user error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update user data
   * @param {number} id - User ID
   * @param {Object} data - User data to update
   * @returns {Promise} Updated user data
   */
  updateUser: async (id, data) => {
    try {
      // Mock mode
      if (API_CONFIG.USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          ...MOCK_USER,
          ...data,
        };
      }

      const response = await apiClientAuth.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update user profile photo
   * @param {number} id - User ID
   * @param {string} photoUrl - Photo URL or base64
   * @returns {Promise} Updated user data
   */
  updatePhoto: async (id, photoUrl) => {
    try {
      // Mock mode
      if (API_CONFIG.USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          success: true,
          message: 'Foto actualizada exitosamente',
          photoUrl: photoUrl,
        };
      }

      const response = await apiClientAuth.put(`/users/${id}/photo`, {
        profilePicture: photoUrl,
      });
      return response.data;
    } catch (error) {
      console.error('Update photo error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default userService;
