/**
 * Location Service
 * Servicio para manejar operaciones relacionadas con ubicaciones/sedes
 */

const createLocationService = (axiosInstance) => ({
  /**
   * Obtener todas las ubicaciones
   * @returns {Promise<Array>} Lista de ubicaciones
   */
  getAllLocations: async () => {
    try {
      const response = await axiosInstance.get('/locations');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener una ubicación específica por ID
   * @param {string} locationId - ID de la ubicación
   * @returns {Promise<Object>} Datos de la ubicación
   */
  getLocationById: async (locationId) => {
    try {
      const response = await axiosInstance.get(`/locations/${locationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
});

export default createLocationService;
