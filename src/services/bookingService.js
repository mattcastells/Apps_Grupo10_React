import { apiClientAuth } from './apiClient';
import { API_CONFIG } from '../utils/constants';
import { MOCK_BOOKINGS } from './mockData';

// Simulated bookings array for mock mode
let mockBookingsArray = [...MOCK_BOOKINGS];

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
      // Mock mode
      if (API_CONFIG.USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockBookingsArray;
      }

      const response = await apiClientAuth.get('/bookings/my-bookings');
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
      // Mock mode
      if (API_CONFIG.USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const booking = mockBookingsArray.find(b => b.bookingId === bookingId.toString());
        if (booking) {
          return booking;
        } else {
          throw new Error('Reserva no encontrada');
        }
      }

      const response = await apiClientAuth.get(`/bookings/${bookingId}`);
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
      // Mock mode
      if (API_CONFIG.USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));

        const newBooking = {
          bookingId: `b${mockBookingsArray.length + 1}`,
          className: 'Clase Reservada',
          classDateTime: new Date().toISOString(),
          professor: 'Profesor Mock',
          status: 'CONFIRMED',
          location: 'Sede Centro',
          scheduledClassId: scheduledClassId,
        };

        mockBookingsArray.push(newBooking);
        return {
          success: true,
          message: 'Reserva creada exitosamente',
          booking: newBooking,
        };
      }

      const response = await apiClientAuth.post('/bookings', {
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
      // Mock mode
      if (API_CONFIG.USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));

        const index = mockBookingsArray.findIndex(b => b.bookingId === bookingId.toString());
        if (index !== -1) {
          mockBookingsArray.splice(index, 1);
          return {
            success: true,
            message: 'Reserva cancelada exitosamente',
          };
        } else {
          throw new Error('Reserva no encontrada');
        }
      }

      const response = await apiClientAuth.delete(`/bookings/${bookingId}`);
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
      const response = await apiClientAuth.get('/bookings/my-bookings', {
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
      const response = await apiClientAuth.get('/bookings/my-bookings', {
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
      const response = await apiClientAuth.get(`/bookings/check-availability/${scheduledClassId}`);
      return response.data;
    } catch (error) {
      console.error('Check availability error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default bookingService;
