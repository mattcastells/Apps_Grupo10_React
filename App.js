import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { BACKGROUND_NOTIFICATION_TASK } from './src/services/backgroundTask';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function AppContent() {
  const { isDarkMode } = useTheme();
  
  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </>
  );
}

export default function App() {
  const navigationRef = useRef(null);

  useEffect(() => {
    // Setup notifications and background task
    const setupNotificationsAndBackgroundTask = async () => {
      try {
        // Request notification permissions
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          return;
        }

        // Configure notification channel for Android
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Recordatorios de Turnos',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }

        // Check if background task is already registered
        const isRegistered = await TaskManager.isTaskRegisteredAsync(
          BACKGROUND_NOTIFICATION_TASK
        );

        if (!isRegistered) {
          // Register background task with 15 minute interval
          await BackgroundTask.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
            intervalMinutes: 15, // Minimum interval is 15 minutes
          });
        }
      } catch (error) {
        // Error setting up notifications/background task
      }
    };

    setupNotificationsAndBackgroundTask();

    // Handle notification tap when app is running or in background
    const notificationResponseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        // Handle BOOKING_REMINDER notifications
        if (data.type === 'BOOKING_REMINDER' && data.scheduledClassId) {
          // Navigate to ClassDetail screen
          if (navigationRef.current?.isReady()) {
            try {
              navigationRef.current.navigate('Home', {
                screen: 'ClassDetail',
                params: { classId: data.scheduledClassId },
              });
            } catch (error) {
              // Navigation error
            }
          }
        }
      }
    );

    // Cleanup listener on unmount
    return () => {
      notificationResponseListener.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer ref={navigationRef}>
          <AppContent />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}