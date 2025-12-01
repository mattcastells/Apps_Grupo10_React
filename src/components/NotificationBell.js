import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      {/* Icono de campanita blanca */}
      <Ionicons name="notifications-outline" size={26} color="#FFFFFF" />

      {/* Badge contador ROJO */}
      {unreadCount > 0 && (
        <View style={styles.badge}>
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
    marginRight: 4,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF3B30', // Rojo iOS
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#F26A3E', // Borde color header para mejor contraste
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default NotificationBell;
