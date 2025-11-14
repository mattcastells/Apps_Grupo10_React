const createLocationService = (axiosInstance) => ({
  /**
   * Get all locations/sedes
   * @returns {Promise<Array>} Array of location objects with id, name, address
   */
  getAllLocations: async () => {
    try {
      const response = await axiosInstance.get('/locations');
      return response.data;
    } catch (error) {
      console.error('Get all locations error:', error.response?.data || error.message);
      throw error;
    }
  },
});

export default createLocationService;
