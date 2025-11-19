const createUserService = (axiosInstance) => ({
  getUser: async (id) => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      const userData = response.data;

      // Map backend field 'profilePicture' to frontend field 'photoUrl'
      if (userData.profilePicture) {
        userData.photoUrl = userData.profilePicture;
      }

      return userData;
    } catch (error) {
      throw error;
    }
  },

  updateUser: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
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
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await axiosInstance.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
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
      throw error;
    }
  },
});

export default createUserService;
