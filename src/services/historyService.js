const createHistoryService = (axiosInstance) => ({
  getMyHistory: async (from, to) => {
    try {
      const response = await axiosInstance.get('/history/me', {
        params: {
          from,
          to,
        },
      });
      // Map backend response to match BookingCard expectations
      return response.data.map(item => ({
        id: item.id,
        className: item.discipline,
        classDateTime: item.startDateTime,
        professor: item.teacher,
        location: item.site || item.location,
        discipline: item.discipline,
        durationMinutes: item.durationMinutes,
        status: 'CONFIRMED', // History items are always confirmed attended classes
      }));
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
