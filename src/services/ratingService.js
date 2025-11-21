const createRatingService = (axiosInstance) => ({
  createRating: async (bookingId, rating, comment) => {
    try {
      const response = await axiosInstance.post(`/ratings/booking/${bookingId}`, {
        rating,
        comment: comment || null,
      });
      return response.data;
    } catch (error) {
      console.error('Create rating error:', error.response?.data || error.message);
      throw error;
    }
  },

  getRatingByBookingId: async (bookingId) => {
    try {
      const response = await axiosInstance.get(`/ratings/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No rating found
      }
      console.error('Get rating error:', error.response?.data || error.message);
      throw error;
    }
  },
});

export default createRatingService;
