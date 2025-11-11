const createUserService = (axiosInstance) => ({
  getUser: async (id) => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get user error:', error.response?.data || error.message);
      throw error;
    }
  },

  updateUser: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error.response?.data || error.message);
      throw error;
    }
  },

  updatePhoto: async (id, photoUrl) => {
    try {
      const response = await axiosInstance.put(`/users/${id}/photo`, {
        photoUrl,
      });
      return response.data;
    } catch (error) {
      console.error('Update photo error:', error.response?.data || error.message);
      throw error;
    }
  },

  uploadPhoto: async (id, formData) => {
    try {
      const response = await axiosInstance.post(`/users/${id}/upload-photo`, formData, {
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

  deleteUser: async (id) => {
    try {
      const response = await axiosInstance.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error.response?.data || error.message);
      throw error;
    }
  },

  changePassword: async (id, currentPassword, newPassword) => {
    try {
      const response = await axiosInstance.put(`/users/${id}/change-password`, {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error('Change password error:', error.response?.data || error.message);
      throw error;
    }
  },
});

export default createUserService;
