import { apiClientAuth } from './apiClient';

const historyService = {
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

  getAttendanceDetail: async (attendanceId) => {
    try {
      const response = await apiClientAuth.get(`/attendance/${attendanceId}`);
      return response.data;
    } catch (error) {
      console.error('Get attendance detail error:', error.response?.data || error.message);
      throw error;
    }
  },

  getAllHistory: async () => {
    try {
      const response = await apiClientAuth.get('/attendance/my-history');
      return response.data;
    } catch (error) {
      console.error('Get all history error:', error.response?.data || error.message);
      throw error;
    }
  },

  getStatistics: async (userId) => {
    try {
      const response = await apiClientAuth.get(`/attendance/statistics/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get statistics error:', error.response?.data || error.message);
      throw error;
    }
  },

  submitReview: async (attendanceId, reviewData) => {
    try {
      const response = await apiClientAuth.post(`/attendance/${attendanceId}/review`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Submit review error:', error.response?.data || error.message);
      throw error;
    }
  },

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
