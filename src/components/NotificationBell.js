import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAxios } from '../hooks/useAxios';
import createNotificationService from '../services/notificationService';

/**
 * Componente de campanita de notificaciones con badge contador
 */
const NotificationBell = ({ onPress }) => {
  const { theme } = useTheme();
  const axiosInstance = useAxios();
  const notificationService = createNotificationService(axiosInstance);
  const [unreadCount, setUnreadCount] = useState(0);

  // Cargar contador al montar y cada 30 segundos
  useEffect(() => {
    loadUnreadCount();

    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      {/* Icono de campanita (usando texto Unicode) */}
      <Text style={[styles.bellIcon, { color: theme.text }]}>🔔</Text>

      {/* Badge contador */}
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: theme.primary }]}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NotificationBell;
