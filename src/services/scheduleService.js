import { apiClientAuth } from './apiClient';

/**
 * Schedule Service
 */
const scheduleService = {
  /**
   * Get weekly schedule (all classes for the week)
   * @returns {Promise} Weekly schedule data
   */
  getWeeklySchedule: async () => {
    try {
      const response = await apiClientAuth.get('/schedule/weekly');
      return response.data;
    } catch (error) {
      console.error('Get weekly schedule error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get schedule by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise} Schedule data
   */
  getScheduleByDateRange: async (startDate, endDate) => {
    try {
      const response = await apiClientAuth.get('/schedule', {
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

  /**
   * Get class detail by scheduled class ID
   * @param {number} classId - Scheduled class ID
   * @returns {Promise} Class detail data
   */
  getClassDetail: async (classId) => {
    try {
      const response = await apiClientAuth.get(`/schedule/${classId}`);
      return response.data;
    } catch (error) {
      console.error('Get class detail error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get schedule by discipline
   * @param {string} discipline - Discipline name
   * @returns {Promise} Schedule data filtered by discipline
   */
  getScheduleByDiscipline: async (discipline) => {
    try {
      const response = await apiClientAuth.get('/schedule', {
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
      const response = await apiClientAuth.get('/schedule', {
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

  /**
   * Search schedule with filters
   * @param {Object} filters - Filter object (discipline, location, date, etc.)
   * @returns {Promise} Filtered schedule data
   */
  searchSchedule: async (filters) => {
    try {
      const response = await apiClientAuth.get('/schedule', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Search schedule error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default scheduleService;
