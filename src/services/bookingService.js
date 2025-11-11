const createBookingService = (axiosInstance) => ({
  getMyBookings: async () => {
    try {
      const response = await axiosInstance.get('/booking/my-bookings');
      return response.data;
    } catch (error) {
      console.error('Get bookings error:', error.response?.data || error.message);
      throw error;
    }
  },

  getBooking: async (bookingId) => {
    try {
      const response = await axiosInstance.get(`/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Get booking error:', error.response?.data || error.message);
      throw error;
    }
  },

  createBooking: async (scheduledClassId) => {
    try {
      const response = await axiosInstance.post('/booking', {
        scheduledClassId,
      });
      return response.data;
    } catch (error) {
      console.error('Create booking error:', error.response?.data || error.message);
      throw error;
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      const response = await axiosInstance.delete(`/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Cancel booking error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get upcoming bookings
   * @returns {Promise} List of upcoming bookings
   */
  getUpcomingBookings: async () => {
    try {
      const response = await axiosInstance.get('/booking/my-bookings', {
        params: {
          upcoming: true,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Get upcoming bookings error:', error.response?.data || error.message);
      throw error;
    }
  },

  getPastBookings: async () => {
    try {
      const response = await axiosInstance.get('/booking/my-bookings', {
        params: {
          past: true,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Get past bookings error:', error.response?.data || error.message);
      throw error;
    }
  },

  checkAvailability: async (scheduledClassId) => {
    try {
      const response = await axiosInstance.get(`/booking/check-availability/${scheduledClassId}`);
      return response.data;
    } catch (error) {
      console.error('Check availability error:', error.response?.data || error.message);
      throw error;
    }
  },
});

export default createBookingService;
