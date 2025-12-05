/**
 * Servicio de Notificaciones - Frontend
 * Maneja la comunicación con el backend de notificaciones y expo-notifications
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const createNotificationService = (axiosInstance) => ({
  /**
   * Obtener todas las notificaciones del usuario autenticado
   */
  getMyNotifications: async () => {
    try {
      const response = await axiosInstance.get('/notifications');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener solo notificaciones enviadas (no leídas)
   */
  getSentNotifications: async () => {
    try {
      const response = await axiosInstance.get('/notifications/sent');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener contador de notificaciones no leídas (para el badge)
   */
  getUnreadCount: async () => {
    try {
      const response = await axiosInstance.get('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Marcar notificación como leída (usuario hizo click)
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await axiosInstance.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Configurar permisos de notificaciones push
   */
  requestPermissions: async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Recordatorios de Turnos',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Mostrar notificación local (desde el backend)
   */
  showLocalNotification: async (notification) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.message,
          data: {
            notificationId: notification.id,
            bookingId: notification.bookingId,
            scheduledClassId: notification.scheduledClassId,
            type: notification.type,
          },
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      // Error showing local notification
    }
  },

  // ELIMINADO: createBookingNotification
  // El backend ahora crea automáticamente las notificaciones cuando se hace una reserva
  // No es necesario que el frontend las cree manualmente

  /**
   * Procesar notificaciones pendientes desde el backend
   * Este método se llama periódicamente (cada 15 min o al abrir la app)
   */
  processPendingNotifications: async (axiosInstance) => {
    try {
      // Obtener notificaciones enviadas desde el backend
      const response = await axiosInstance.get('/notifications/sent');
      const sentNotifications = response.data;

      // Mostrar cada notificación localmente
      for (const notification of sentNotifications) {
        await createNotificationService(axiosInstance).showLocalNotification(notification);
      }

      return sentNotifications.length;
    } catch (error) {
      return 0;
    }
  },
});

export default createNotificationService;
