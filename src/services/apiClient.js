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

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response) => {

      return response;
    },
    (error) => {

      return Promise.reject(error);
    }
  );

  return apiClient;
};
