const createNewsService = (axiosInstance) => ({
  /**
   * Get all news
   * @returns {Promise} List of news
   */
  getAllNews: async () => {
    try {
      const response = await axiosInstance.get('/news');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
});

export default createNewsService;
