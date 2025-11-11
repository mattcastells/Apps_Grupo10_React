import { apiClientAuth } from './apiClient';

/**
 * History Service (Attendance tracking)
 */
const historyService = {
  /**
   * Get user attendance history
   * @param {number} userId - User ID
   * @param {string} from - Start date (YYYY-MM-DD)
   * @param {string} to - End date (YYYY-MM-DD)
   * @returns {Promise} List of attendance records
   */
  getMyHistory: async (userId, from, to) => {
    try {
      const response = await apiClientAuth.get('/attendance/my-history', {
        params: {
          userId,
          from,
          to,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Get history error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get attendance detail by ID
   * @param {number} attendanceId - Attendance record ID
   * @returns {Promise} Attendance detail data
   */
  getAttendanceDetail: async (attendanceId) => {
    try {
      const response = await apiClientAuth.get(`/attendance/${attendanceId}`);
      return response.data;
    } catch (error) {
      console.error('Get attendance detail error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get all user attendance (without date filter)
   * @returns {Promise} List of all attendance records
   */
  getAllHistory: async () => {
    try {
      const response = await apiClientAuth.get('/attendance/my-history');
      return response.data;
    } catch (error) {
      console.error('Get all history error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get attendance statistics
   * @param {number} userId - User ID
   * @returns {Promise} Attendance statistics
   */
  getStatistics: async (userId) => {
    try {
      const response = await apiClientAuth.get(`/attendance/statistics/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get statistics error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Submit review for attended class
   * @param {number} attendanceId - Attendance record ID
   * @param {Object} reviewData - Review data (rating, comment)
   * @returns {Promise} Review submission response
   */
  submitReview: async (attendanceId, reviewData) => {
    try {
      const response = await apiClientAuth.post(`/attendance/${attendanceId}/review`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Submit review error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Record attendance via QR scan
   * @param {string} qrData - QR code data
   * @returns {Promise} Attendance record response
   */
  recordAttendance: async (qrData) => {
    try {
      const response = await apiClientAuth.post('/attendance/check-in', {
        qrData,
      });
      return response.data;
    } catch (error) {
      console.error('Record attendance error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default historyService;
