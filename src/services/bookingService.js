import { apiClientAuth } from './apiClient';

/**
 * Booking Service
 */
const bookingService = {
  /**
   * Get all user bookings
   * @returns {Promise} List of user bookings
   */
  getMyBookings: async () => {
    try {
      const response = await apiClientAuth.get('/booking/my-bookings');
      return response.data;
    } catch (error) {
      console.error('Get bookings error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get booking by ID
   * @param {number} bookingId - Booking ID
   * @returns {Promise} Booking details
   */
  getBooking: async (bookingId) => {
    try {
      const response = await apiClientAuth.get(`/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Get booking error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Create new booking
   * @param {number} scheduledClassId - Scheduled class ID
   * @returns {Promise} Created booking data
   */
  createBooking: async (scheduledClassId) => {
    try {
      const response = await apiClientAuth.post('/booking', {
        scheduledClassId,
      });
      return response.data;
    } catch (error) {
      console.error('Create booking error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Cancel booking
   * @param {number} bookingId - Booking ID
   * @returns {Promise} Cancellation response
   */
  cancelBooking: async (bookingId) => {
    try {
      const response = await apiClientAuth.delete(`/booking/${bookingId}`);
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
      const response = await apiClientAuth.get('/booking/my-bookings', {
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

  /**
   * Get past bookings
   * @returns {Promise} List of past bookings
   */
  getPastBookings: async () => {
    try {
      const response = await apiClientAuth.get('/booking/my-bookings', {
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

  /**
   * Check if class is bookable
   * @param {number} scheduledClassId - Scheduled class ID
   * @returns {Promise} Availability status
   */
  checkAvailability: async (scheduledClassId) => {
    try {
      const response = await apiClientAuth.get(`/booking/check-availability/${scheduledClassId}`);
      return response.data;
    } catch (error) {
      console.error('Check availability error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default bookingService;
