const createScheduleService = (axiosInstance) => ({
  getWeeklySchedule: async () => {
    try {
      const response = await axiosInstance.get('/schedule/weekly');
      return response.data;
    } catch (error) {
      console.error('Get weekly schedule error:', error.response?.data || error.message);
      throw error;
    }
  },

  getScheduleByDateRange: async (startDate, endDate) => {
    try {
      const response = await axiosInstance.get('/schedule', {
        params: {
          startDate,
          endDate,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Get schedule by date range error:', error.response?.data || error.message);
      throw error;
    }
  },

  getClassDetail: async (classId) => {
    try {
      const response = await axiosInstance.get(`/schedule/${classId}`);
      return response.data;
    } catch (error) {
      console.error('Get class detail error:', error.response?.data || error.message);
      throw error;
    }
  },

  getScheduleByDiscipline: async (discipline) => {
    try {
      const response = await axiosInstance.get('/schedule', {
        params: {
          discipline,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Get schedule by discipline error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get schedule by location
   * @param {string} location - Location name
   * @returns {Promise} Schedule data filtered by location
   */
  getScheduleByLocation: async (location) => {
    try {
      const response = await axiosInstance.get('/schedule', {
        params: {
          location,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Get schedule by location error:', error.response?.data || error.message);
      throw error;
    }
  },

  searchSchedule: async (filters) => {
    try {
      const response = await axiosInstance.get('/schedule', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Search schedule error:', error.response?.data || error.message);
      throw error;
    }
  },
});

export default createScheduleService;
