import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../utils/constants';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

// Helper to try fetching from multiple URLs
const fetchWithFallback = async (endpoint, token) => {
  const urls = API_CONFIG.POSSIBLE_URLS;

  for (let i = 0; i < urls.length; i++) {
    const baseUrl = urls[i];
    try {
      const response = await axios.get(`${baseUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      return response;
    } catch (error) {
      if (i === urls.length - 1) throw error; // Re-throw on last attempt
    }
  }
};

// Define the background task - Poll backend for notifications
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  try {
    // Get auth token from AsyncStorage
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    // Fetch PENDING notifications that are ready to be sent from backend
    // El backend debe devolver solo las que tienen:
    // - status: "PENDING"
    // - scheduledFor <= now
    const response = await fetchWithFallback('/notifications/pending', token);

    const notifications = response.data;

    // Show each notification locally and mark as RECEIVED
    for (const notification of notifications) {
      try {
        // Mostrar notificación local
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

        // Marcar como RECEIVED en el backend
        await axios.put(
          `${response.config.baseURL}/notifications/${notification.id}/received`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          }
        );
      } catch (notifError) {
        // Error processing notification
      }
    }

    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export { BACKGROUND_NOTIFICATION_TASK };
