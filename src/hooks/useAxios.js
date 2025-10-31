// src/hooks/useAxios.js
import { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import { useNavigation } from '@react-navigation/native';

export const useAxios = () => {
  const { authState, logout } = useContext(AuthContext);
  const navigation = useNavigation();

  // Usamos useRef para mantener la misma instancia de interceptores
  const apiRef = useRef(apiClient);

  useEffect(() => {
    // Interceptor de Petición (Request)
    // Se ejecuta ANTES de que salga cada petición
    const requestInterceptor = apiRef.current.interceptors.request.use(
      (config) => {
        if (authState.token) {
          config.headers.Authorization = `Bearer ${authState.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor de Respuesta (Response)
    // Se ejecuta CUANDO vuelve una respuesta (exitosa o error)
    const responseInterceptor = apiRef.current.interceptors.response.use(
      (response) => response, // Si es exitosa (2xx), solo la deja pasar
      async (error) => {
        const originalRequest = error.config;

        // Si el error es 401 (No autorizado) Y no es un reintento
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true; // Marcamos como reintento

          console.warn('Token expired or invalid. Logging out.');
          await logout();

          // Reseteamos la navegación al stack de Auth
          navigation.reset({
            index: 0,
            routes: [{ name: 'AuthStack' }], // Asegúrese que 'AuthStack' sea el nombre correcto en su Root
          });
        }
        return Promise.reject(error);
      }
    );

    // Limpieza al desmontar el componente (o al cambiar authState)
    return () => {
      apiRef.current.interceptors.request.eject(requestInterceptor);
      apiRef.current.interceptors.response.eject(responseInterceptor);
    };
  }, [authState.token, logout, navigation]); // Depende del token

  return apiRef.current; // Devolvemos la instancia de Axios configurada
};