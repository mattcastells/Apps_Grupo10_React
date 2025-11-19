const createCheckInService = (axiosInstance) => ({
  /**
   * Check in to a scheduled class using QR code
   * @param {string} scheduledClassId - The ID of the scheduled class
   * @returns {Promise} Check-in response with class details
   */
  checkIn: async (scheduledClassId) => {
    try {
      const response = await axiosInstance.post('/checkin', {
        scheduledClassId,
      });
      return response.data;
    } catch (error) {
      console.error('Check-in error:', error.response?.data || error.message);
      throw error;
    }
  },
});

export default createCheckInService;
