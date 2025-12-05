import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAxios } from '../hooks/useAxios';
import createNotificationService from '../services/notificationService';
import { useNavigation } from '@react-navigation/native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Modal/Drawer de Notificaciones que se desliza desde arriba
 */
const NotificationDrawer = ({ visible, onClose, onNotificationsRead }) => {
  const { theme, isDarkMode } = useTheme();
  const axiosInstance = useAxios();
  const navigation = useNavigation();
  const notificationService = createNotificationService(axiosInstance);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-SCREEN_HEIGHT));

  useEffect(() => {
    if (visible) {
      loadNotifications();
      // Animación de deslizamiento hacia abajo
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      // Animación de deslizamiento hacia arriba
      Animated.timing(slideAnim, {
        toValue: -SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getSentNotifications();
      setNotifications(data);
    } catch (error) {
      // Error loading notifications
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = async (notification) => {
    // Si la notificación es un recordatorio, navegar al detalle de la clase
    if (notification.type === 'BOOKING_REMINDER' && notification.scheduledClassId) {
      navigation.navigate('Home', {
        screen: 'ClassDetail',
        params: { classId: notification.scheduledClassId },
      });
      onClose(); // Cerrar el drawer de notificaciones

      // Marcar como leída
      if (notification.status === 'ENVIADA') {
        try {
          await notificationService.markAsRead(notification.id);
          if (onNotificationsRead) {
            onNotificationsRead();
          }
        } catch (error) {
          // Error marking notification as read
        }
      }
      return;
    }

    // Si la notificación es un cambio de clase, navegar a la pantalla de confirmación
    if (notification.type === 'CLASS_CHANGED') {
      // Navegación anidada: Ir a la PESTAÑA 'Home', y DENTRO de ella, a la PANTALLA 'ClassChangeConfirmation'
      navigation.navigate('Home', {
        screen: 'ClassChangeConfirmation',
        params: { notification },
      });
      onClose(); // Cerrar el drawer de notificaciones
      return;
    }

    // Comportamiento por defecto: marcar como leída
    if (notification.status === 'ENVIADA') {
      try {
        await notificationService.markAsRead(notification.id);
        await loadNotifications();
        if (onNotificationsRead) {
          onNotificationsRead();
        }
      } catch (error) {
        // Error marking notification as read
      }
    }
  };

  const renderNotification = ({ item }) => {
    const isUnread = item.status === 'ENVIADA';

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          {
            backgroundColor: isUnread ? theme.backgroundSecondary : theme.container,
            borderLeftColor: isUnread ? theme.primary : 'transparent',
          },
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, { color: theme.text }]}>
            {item.title}
          </Text>
          {isUnread && (
            <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
          )}
        </View>
        <Text style={[styles.notificationMessage, { color: theme.textSecondary }]}>
          {item.message}
        </Text>
        <Text style={[styles.notificationTime, { color: theme.textSecondary }]}>
          {formatDate(item.createdAt)}
        </Text>
      </TouchableOpacity>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Fondo oscuro clickeable para cerrar */}
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

        {/* Drawer que se desliza desde arriba */}
        <Animated.View
          style={[
            styles.drawer,
            {
              backgroundColor: theme.background,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Notificaciones
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: theme.primary }]}>
                  Cerrar
                </Text>
              </TouchableOpacity>
            </View>

            {/* Lista de notificaciones */}
            <FlatList
              data={notifications}
              renderItem={renderNotification}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    {loading ? 'Cargando...' : 'No tienes notificaciones'}
                  </Text>
                </View>
              }
            />
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    minHeight: 280, // Altura mínima para mostrar contenido
    maxHeight: SCREEN_HEIGHT * 0.5, // Más compacto: solo 50% de la pantalla
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    borderLeftWidth: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '500',
  },
});

export default NotificationDrawer;
