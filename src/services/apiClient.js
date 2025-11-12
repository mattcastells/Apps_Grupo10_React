import axios from 'axios';
import { API_CONFIG } from '../utils/constants';

// Function to create a non-authenticated API client
export const createApiClient = () => {
  const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  apiClient.interceptors.request.use(
    (config) => {
      console.log('🌐 API Request (No Auth):', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        headers: config.headers,
        data: config.data,
      });
      return config;
    },
    (error) => {
      console.error('❌ Request Error (No Auth):', error);
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response) => {
      console.log('✅ API Response (No Auth):', {
        status: response.status,
        data: response.data,
        headers: response.headers,
      });
      return response;
    },
    (error) => {
      console.error('❌ API Response Error (No Auth):', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          method: error.config?.method,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
        },
      });
      return Promise.reject(error);
    }
  );

  return apiClient;
};
