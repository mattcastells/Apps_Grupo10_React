import { API_CONFIG } from '../utils/constants';
import { apiClientAuth } from './apiClient';

/**
 * Cloudinary Configuration
 * IMPORTANTE: Reemplaza estos valores con tus datos reales de Cloudinary
 */
const CLOUDINARY_CONFIG = {
  // TODO: Reemplazar con el nombre de tu nube de Cloudinary
  // Lo encuentras en: Cloudinary Dashboard > Account Details > Cloud name
  CLOUD_NAME: 'do7lo4pkj',

  // TODO: Reemplazar con tu upload preset
  // Lo creas en: Cloudinary Dashboard > Settings > Upload > Upload presets
  // Debe ser "unsigned" para poder usarlo desde el cliente
  UPLOAD_PRESET: 'ritmofit_unisgned',

  // URL base de Cloudinary (no modificar)
  BASE_URL: 'https://api.cloudinary.com/v1_1',
};

/**
 * Backend Endpoints Configuration
 * Este endpoint debe coincidir con tu controller de Spring Boot
 */
const BACKEND_ENDPOINTS = {
  // Endpoint del backend: PUT /{id}/photo
  // Se reemplaza {id} dinámicamente con el userId
  SAVE_PHOTO_URL: (userId) => `/${userId}/photo`,
};

/**
 * Cloudinary Service
 * Maneja la subida de im�genes a Cloudinary y la comunicaci�n con el backend
 */
const cloudinaryService = {
  /**
   * Sube una imagen a Cloudinary
   * @param {Object} imageData - Datos de la imagen desde react-native-image-picker
   * @param {string} imageData.uri - URI de la imagen
   * @param {string} imageData.type - Tipo MIME de la imagen (ej: image/jpeg)
   * @param {string} imageData.fileName - Nombre del archivo
   * @returns {Promise<Object>} - Respuesta de Cloudinary con la URL de la imagen
   */
  uploadToCloudinary: async (imageData) => {
    try {
      // Crear FormData para enviar a Cloudinary
      const formData = new FormData();

      // Agregar la imagen
      formData.append('file', {
        uri: imageData.uri,
        type: imageData.type || 'image/jpeg',
        name: imageData.fileName || 'photo.jpg',
      });

      // Agregar el upload preset (necesario para uploads unsigned)
      formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);

      // Construcci�n de la URL de Cloudinary
      const cloudinaryUrl = `${CLOUDINARY_CONFIG.BASE_URL}/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`;

      console.log('Subiendo imagen a Cloudinary...');

      // Realizar el upload a Cloudinary
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Error al subir imagen a Cloudinary');
      }

      const data = await response.json();

      console.log('Imagen subida exitosamente a Cloudinary');

      return {
        success: true,
        url: data.secure_url, // URL segura (https) de la imagen
        publicId: data.public_id, // ID p�blico en Cloudinary (�til para eliminar despu�s)
        format: data.format, // Formato de la imagen
        width: data.width,
        height: data.height,
        cloudinaryResponse: data, // Respuesta completa por si necesitas m�s datos
      };
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('No se pudo subir la imagen a Cloudinary: ' + error.message);
    }
  },

  /**
   * Guarda la URL de la imagen en el backend
   * @param {string} userId - ID del usuario (se pasa como path param)
   * @param {string} imageUrl - URL de la imagen en Cloudinary
   * @returns {Promise<Object>} - Respuesta del backend
   */
  saveImageUrlToBackend: async (userId, imageUrl) => {
    try {
      // Mock mode
      if (API_CONFIG.USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          success: true,
          message: 'URL de foto guardada exitosamente (MOCK)',
          photoUrl: imageUrl,
        };
      }

      console.log(`Guardando URL en el backend para usuario ${userId}...`);

      // Construir el endpoint con el userId en el path
      const endpoint = BACKEND_ENDPOINTS.SAVE_PHOTO_URL(userId);

      // Body según tu UpdatePhotoRequest del backend
      const requestBody = {
        photoUrl: imageUrl,
      };

      // Enviar al backend: PUT /{id}/photo con body { photoUrl: "..." }
      await apiClientAuth.put(endpoint, requestBody);

      console.log('URL guardada en el backend exitosamente');

      // Tu backend retorna ResponseEntity.ok().build(), así que no hay data en la respuesta
      return {
        success: true,
        photoUrl: imageUrl,
      };
    } catch (error) {
      console.error('Error saving image URL to backend:', error.response?.data || error.message);

      // Manejar errores específicos del backend
      if (error.response?.status === 400) {
        throw new Error('Solicitud inválida: ' + (error.response?.data || 'Verifica los datos enviados'));
      } else if (error.response?.status === 404) {
        throw new Error('Usuario no encontrado: ' + (error.response?.data || 'El usuario no existe'));
      }

      throw new Error('No se pudo guardar la URL en el backend: ' + (error.response?.data || error.message));
    }
  },

  /**
   * Proceso completo: Sube imagen a Cloudinary y guarda la URL en el backend
   * @param {number} userId - ID del usuario
   * @param {Object} imageData - Datos de la imagen desde react-native-image-picker
   * @returns {Promise<Object>} - Objeto con la URL de la imagen y la respuesta del backend
   */
  uploadAndSaveProfilePhoto: async (userId, imageData) => {
    try {
      // Paso 1: Subir a Cloudinary
      console.log('Iniciando proceso de subida de imagen...');
      const cloudinaryResult = await cloudinaryService.uploadToCloudinary(imageData);

      if (!cloudinaryResult.success) {
        throw new Error('Error al subir imagen a Cloudinary');
      }

      // Paso 2: Guardar URL en el backend
      const backendResult = await cloudinaryService.saveImageUrlToBackend(userId, cloudinaryResult.url);

      return {
        success: true,
        photoUrl: cloudinaryResult.url,
        cloudinaryData: cloudinaryResult,
        backendResponse: backendResult,
      };
    } catch (error) {
      console.error('Error en proceso completo de subida:', error);
      throw error;
    }
  },

  /**
   * Elimina una imagen de Cloudinary (opcional)
   * Requiere configuraci�n adicional con API Key y API Secret en el backend
   * @param {string} publicId - Public ID de la imagen en Cloudinary
   * @returns {Promise<Object>} - Respuesta del backend
   */
  deleteFromCloudinary: async (publicId) => {
    try {
      // Esta operaci�n debe hacerse desde el backend por seguridad
      // No se puede hacer directamente desde el cliente sin exponer credenciales

      const response = await apiClientAuth.delete('/eliminarFotoCloudinary', {
        data: { publicId }
      });

      return response.data;
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default cloudinaryService;
export { CLOUDINARY_CONFIG, BACKEND_ENDPOINTS };
