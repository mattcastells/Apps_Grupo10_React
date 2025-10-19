import { apiClientAuth } from './apiClient';
import { API_CONFIG } from '../utils/constants';
import { MOCK_USER } from './mockData';

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
        photoUrl,
      });
      return response.data;
    } catch (error) {
      console.error('Update photo error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Upload profile photo (FormData)
   * @param {number} id - User ID
   * @param {FormData} formData - Form data with photo file
   * @returns {Promise} Updated user data
   */
  uploadPhoto: async (id, formData) => {
    try {
      const response = await apiClientAuth.post(`/users/${id}/upload-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload photo error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Delete user account
   * @param {number} id - User ID
   * @returns {Promise} Deletion response
   */
  deleteUser: async (id) => {
    try {
      const response = await apiClientAuth.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Change user password
   * @param {number} id - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} Password change response
   */
  changePassword: async (id, currentPassword, newPassword) => {
    try {
      const response = await apiClientAuth.put(`/users/${id}/change-password`, {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error('Change password error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default userService;
