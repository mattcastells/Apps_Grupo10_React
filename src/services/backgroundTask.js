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
      console.log(`[BACKGROUND TASK] Trying ${baseUrl}${endpoint}...`);
      const response = await axios.get(`${baseUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      console.log(`[BACKGROUND TASK] ✅ Success with ${baseUrl}`);
      return response;
    } catch (error) {
      console.log(`[BACKGROUND TASK] ❌ Failed with ${baseUrl}: ${error.message}`);
      if (i === urls.length - 1) throw error; // Re-throw on last attempt
    }
  }
};

// Define the background task - Poll backend for notifications
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  try {
    console.log('[BACKGROUND TASK] Polling for notifications...');

    // Get auth token from AsyncStorage
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      console.log('[BACKGROUND TASK] No auth token found');
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    // Fetch notifications from backend with fallback URLs
    const response = await fetchWithFallback('/notifications/sent', token);

    const notifications = response.data;
    console.log(`[BACKGROUND TASK] Found ${notifications.length} notifications`);

    // Show each notification locally
    for (const notification of notifications) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.message,
          data: {
            notificationId: notification.id,
            bookingId: notification.bookingId,
          },
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    }

    console.log('[BACKGROUND TASK] Notifications sent successfully');
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.error('[BACKGROUND TASK] Error:', error.message);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export { BACKGROUND_NOTIFICATION_TASK };
