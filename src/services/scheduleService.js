const createScheduleService = (axiosInstance) => ({
  getWeeklySchedule: async () => {
    try {
      const response = await axiosInstance.get('/schedule/weekly');
      return response.data;
    } catch (error) {
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
      throw error;
    }
  },

  getClassDetail: async (classId) => {
    try {
      const response = await axiosInstance.get(`/schedule/${classId}`);
      return response.data;
    } catch (error) {
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
      throw error;
    }
  },

  getDisciplines: async () => {
    try {
      const response = await axiosInstance.get('/class-templates/disciplines');
      return response.data;
    } catch (error) {
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
      throw error;
    }
  },

  createScheduledClass: async (classData) => {
    try {
      const response = await axiosInstance.post('/schedule', classData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateScheduledClass: async (classId, classData) => {
    try {
      const response = await axiosInstance.put(`/schedule/${classId}`, classData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteScheduledClass: async (classId) => {
    try {
      await axiosInstance.delete(`/schedule/${classId}`);
    } catch (error) {
      throw error;
    }
  },

  getClassesByProfessor: async (professorName) => {
    try {
      const response = await axiosInstance.get(`/schedule/professor/${professorName}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
});

export default createScheduleService;
