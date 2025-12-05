import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAxios } from '../../hooks/useAxios';
import createBookingService from '../../services/bookingService';
import createNotificationService from '../../services/notificationService';
import Button from '../../components/Button';

const ClassChangeConfirmationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { notification } = route.params;
  const { theme } = useTheme();
  const axiosInstance = useAxios();
  const bookingService = createBookingService(axiosInstance);
  const notificationService = createNotificationService(axiosInstance);

  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      // Al aceptar, solo marcamos la notificación como leída para que desaparezca
      await notificationService.markAsRead(notification.id);
      Alert.alert('Cambio Aceptado', 'Has aceptado el cambio de la clase.');
      navigation.goBack();
    } catch (error) {
      console.error('Error al aceptar el cambio:', error);
      Alert.alert('Error', 'No se pudo procesar tu solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      // Al rechazar, cancelamos la reserva y marcamos la notificación como leída
      if (notification.bookingId) {
        await bookingService.cancelBooking(notification.bookingId);
      }
      Alert.alert('Cambio Rechazado', 'Has rechazado el cambio y la reserva ha sido cancelada.');
      navigation.goBack();
    } catch (error) {
      console.error('Error al rechazar el cambio:', error);
      Alert.alert('Error', 'No se pudo procesar tu solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{notification.title}</Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>{notification.message}</Text>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} />
      ) : (
        <View style={styles.buttonContainer}>
          <Button title="Aceptar Cambio" onPress={handleAccept} style={styles.acceptButton} />
          <Button title="Rechazar y Cancelar Reserva" onPress={handleReject} style={styles.rejectButton} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
  },
  acceptButton: {
    marginBottom: 15,
  },
  rejectButton: {
    backgroundColor: '#D32F2F',
  },
});

export default ClassChangeConfirmationScreen;
