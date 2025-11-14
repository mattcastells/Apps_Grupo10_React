/**
 * Cloudinary Configuration
 */
const CLOUDINARY_CONFIG = {
  CLOUD_NAME: 'dtjbknm5h',
  UPLOAD_PRESET: 'ml_default',
  BASE_URL: 'https://api.cloudinary.com/v1_1',
};

/**
 * Cloudinary Service Factory
 * Creates a service to handle image uploads to Cloudinary and backend communication
 * @param {Object} axiosInstance - Authenticated axios instance (from useAxios hook)
 */
const createCloudinaryService = (axiosInstance) => ({
  /**
   * Uploads an image to Cloudinary
   * @param {Object} imageData - Image data from react-native-image-picker
   * @param {string} imageData.uri - Image URI
   * @param {string} imageData.type - Image MIME type (e.g. image/jpeg)
   * @param {string} imageData.fileName - File name
   * @returns {Promise<Object>} - Cloudinary response with image URL
   */
  uploadToCloudinary: async (imageData) => {
    try {
      const formData = new FormData();

      formData.append('file', {
        uri: imageData.uri,
        type: imageData.type || 'image/jpeg',
        name: imageData.fileName || 'photo.jpg',
      });

      formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);

      const cloudinaryUrl = `${CLOUDINARY_CONFIG.BASE_URL}/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`;

      console.log('Subiendo imagen a Cloudinary con url ' + cloudinaryUrl)

      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        // Log the detailed error from Cloudinary
        console.error('Error response from Cloudinary:', data);
        throw new Error(data.error?.message || 'Error al subir imagen a Cloudinary');
      }

      console.log('Imagen subida exitosamente a Cloudinary');

      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        width: data.width,
        height: data.height,
        cloudinaryResponse: data,
      };
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('No se pudo subir la imagen a Cloudinary: ' + error.message);
    }
  },

  /**
   * Saves image URL to backend
   * @param {string} imageUrl - Image URL from Cloudinary
   * @returns {Promise<Object>} - Backend response
   */
  saveImageUrlToBackend: async (imageUrl) => {
    try {
      console.log(`Guardando URL en el backend para usuario...`);

      const endpoint = '/users/my-photo';

      const requestBody = {
        photoUrl: imageUrl,
      };

      await axiosInstance.put(endpoint, requestBody);
      console.log('URL guardada en el backend exitosamente');

      return { success: true, photoUrl: imageUrl };
    } catch (error) {
      console.error('Error saving image URL to backend:', error.response?.data || error.message);

      if (error.response?.status === 400) {
        throw new Error('Solicitud inválida: ' + (error.response?.data || 'Verifica los datos enviados'));
      } else if (error.response?.status === 404) {
        throw new Error('Usuario no encontrado: ' + (error.response?.data || 'El usuario no existe'));
      }

      throw new Error('No se pudo guardar la URL en el backend: ' + (error.response?.data || error.message));
    }
  },

  /**
   * Complete process: Upload image to Cloudinary and save URL to backend
   * @param {Object} imageData - Image data from react-native-image-picker
   * @returns {Promise<Object>} - Object with image URL and backend response
   */
  uploadAndSaveProfilePhoto: async function (imageData) {
    try {
      console.log('Iniciando proceso de subida de imagen...');
      const cloudinaryResult = await this.uploadToCloudinary(imageData);

      if (!cloudinaryResult.success) {
        throw new Error('Error al subir imagen a Cloudinary');
      }

      const backendResult = await this.saveImageUrlToBackend(cloudinaryResult.url);

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
   * Deletes an image from Cloudinary (optional)
   * @param {string} publicId - Public ID of image in Cloudinary
   * @returns {Promise<Object>} - Backend response
   */
  deleteFromCloudinary: async (publicId) => {
    try {
      const response = await axiosInstance.delete('/eliminarFotoCloudinary', {
        data: { publicId },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error.response?.data || error.message);
      throw error;
    }
  },
});

export default createCloudinaryService;
export { CLOUDINARY_CONFIG };
