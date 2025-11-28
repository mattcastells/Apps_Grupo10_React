const createBookingService = (axiosInstance) => ({
  getMyBookings: async () => {
    try {
      const response = await axiosInstance.get('/booking/my-bookings');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getBooking: async (bookingId) => {
    try {
      const response = await axiosInstance.get(`/booking/${bookingId}`);
      return response.data;
    } catch (error) {
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
      throw error;
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      const response = await axiosInstance.delete(`/booking/${bookingId}`);
      return response.data;
    } catch (error) {
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
      throw error;
    }
  },

  /**
   * Get booking history (past, cancelled, expired)
   * @returns {Promise} List of booking history
   */
  getBookingHistory: async () => {
    try {
      const response = await axiosInstance.get('/booking/history');
      return response.data;
    } catch (error) {
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
      throw error;
    }
  },

  checkAvailability: async (scheduledClassId) => {
    try {
      const response = await axiosInstance.get(`/booking/check-availability/${scheduledClassId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get IDs of classes that the user has already booked (confirmed and future)
   * @returns {Promise<string[]>} List of scheduled class IDs
   */
  getBookedClassIds: async () => {
    try {
      const response = await axiosInstance.get('/booking/booked-class-ids');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
});

export default createBookingService;
