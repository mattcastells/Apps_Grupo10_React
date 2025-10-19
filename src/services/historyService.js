import { apiClientAuth } from './apiClient';
import { API_CONFIG } from '../utils/constants';
import { MOCK_HISTORY, MOCK_HISTORY_DETAIL } from './mockData';

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
      // Mock mode
      if (API_CONFIG.USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_HISTORY;
      }

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
      // Mock mode
      if (API_CONFIG.USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const detail = MOCK_HISTORY_DETAIL[attendanceId];
        if (detail) {
          return detail;
        } else {
          throw new Error('Registro de asistencia no encontrado');
        }
      }

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
