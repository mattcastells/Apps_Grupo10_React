import { useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import SessionManager from '../utils/SessionManager';
import { API_CONFIG } from '../utils/constants';

export const useAxios = () => {
  const { logout } = useContext(AuthContext);
  const navigation = useNavigation();

  const axiosInstance = useRef(
    axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  );

  useEffect(() => {
    const instance = axiosInstance.current;

    const requestInterceptor = instance.interceptors.request.use(
      async (config) => {
        const token = await SessionManager.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        console.log('Axios Request Interceptor:', {
          url: config.url,
          headers: config.headers,
          params: config.params,
        });

        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = instance.interceptors.response.use(
      (res) => res,
      async (err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.warn('Error 401/403 detectado por useAxios. Deslogueando...');
          await logout();
          // The AppNavigator will handle the redirection automatically
        }
        return Promise.reject(err);
      }
    );

    // Cleanup function
    return () => {
      instance.interceptors.request.eject(requestInterceptor);
      instance.interceptors.response.eject(responseInterceptor);
    };
  }, [logout, navigation]);

  return axiosInstance.current;
};
