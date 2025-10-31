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

      const response = await apiClientAuth.get(`/history/users/${userId}`, {
        params: {
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

      const response = await apiClientAuth.get(`/history/attendances/${attendanceId}`);
      return response.data;
    } catch (error) {
      console.error('Get attendance detail error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default historyService;
