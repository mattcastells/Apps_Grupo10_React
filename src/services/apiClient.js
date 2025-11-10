import axios from 'axios';
import { API_CONFIG } from '../utils/constants';
import SessionManager from '../utils/SessionManager';

/**
 * Base API client without authentication
 */
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('🌐 API Request:', {
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
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
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

/**
 * API client with authentication (includes Bearer token)
 */
export const apiClientAuth = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClientAuth.interceptors.request.use(
  async (config) => {
    try {
      const token = await SessionManager.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error adding auth token to request:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClientAuth.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid - clear session
      await SessionManager.clear();
      // You might want to navigate to login screen here
    }
    return Promise.reject(error);
  }
);

// Response interceptor for base client
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
