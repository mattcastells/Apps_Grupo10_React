const createHistoryService = (axiosInstance) => ({
  getMyHistory: async (from, to) => {
    try {
      const response = await axiosInstance.get('/history/me', {
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

  getAttendanceDetail: async (attendanceId) => {
    try {
      const response = await axiosInstance.get(`/history/${attendanceId}`);
      return response.data;
    } catch (error) {
      console.error('Get attendance detail error:', error.response?.data || error.message);
      throw error;
    }
  }

});

export default createHistoryService;
