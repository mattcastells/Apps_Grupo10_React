import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { COLORS } from '../../utils/constants';
import createScheduleService from '../../services/scheduleService';
import createBookingService from '../../services/bookingService';
import notificationService from '../../services/notificationService';
import { useAxios } from '../../hooks/useAxios';
import { useTheme } from '../../context/ThemeContext';
import { formatDate, formatTime } from '../../utils/helpers';

const ClassDetailScreen = ({ route, navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { classId } = route.params;
  const [classDetail, setClassDetail] = useState(null);
  const [isBooked, setIsBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const axiosInstance = useAxios();
  const scheduleService = createScheduleService(axiosInstance);
  const bookingService = createBookingService(axiosInstance);

  useEffect(() => {
    loadClassDetail();
    checkIfBooked();
  }, [classId]);

  const loadClassDetail = async () => {
    setLoading(true);
    try {
      const data = await scheduleService.getClassDetail(classId);
      setClassDetail(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la información de la clase', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const checkIfBooked = async () => {
    try {
      const bookedIds = await bookingService.getBookedClassIds();
      setIsBooked(bookedIds.includes(classId));
    } catch (error) {
      // If there's an error, assume not booked to allow user to try
      setIsBooked(false);
    }
  };

  const handleBookClass = async () => {
    // Si ya está reservada, no hacer nada
    if (isBooked) {
      return;
    }

    Alert.alert(
      'Confirmar Reserva',
      '¿Estás seguro de que querés reservar esta clase?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reservar',
          onPress: async () => {
            setLoading(true);
            try {
              const booking = await bookingService.createBooking(classId);
              setIsBooked(true); // Update local state

              // Schedule notification 1 hour before the class
              const notificationId = await notificationService.scheduleBookingReminder(booking);
              if (notificationId) {
                console.log('✅ Notification scheduled for booking:', booking._id);
              }

              Alert.alert('Éxito', 'Clase reservada correctamente. Recibirás una notificación 1 hora antes.', [
                {
                  text: 'OK',
                  onPress: () => {
                    // Navigate to reservations screen to see the new booking
                    navigation.navigate('Reservations');
                  }
                },
              ]);
            } catch (error) {
              const errorMessage = error.response?.data?.message || 'No se pudo reservar la clase';
              Alert.alert('Error', errorMessage);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleViewMap = () => {
    const locationQuery = classDetail?.locationAddress || classDetail?.location || 'RitmoFit';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      locationQuery
    )}`;
    Linking.openURL(url);
  };

  if (!classDetail) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const date = new Date(classDetail.dateTime);
  const formattedDate = formatDate(classDetail.dateTime);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const formattedTime = `${hours}:${minutes}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.mainCard, { backgroundColor: theme.card, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
          <Text style={[styles.classTitle, { color: theme.primary }]}>{classDetail.name}</Text>

          <View style={styles.infoContainer}>
            <Text style={[styles.infoText, { color: theme.text }]}>👨‍🏫   Profesor: {classDetail.professor}</Text>
            <Text style={[styles.infoText, { color: theme.text }]}>📅   Fecha: {formattedDate}</Text>
            <Text style={[styles.infoText, { color: theme.text }]}>🕐   Horario: {formattedTime}</Text>
            <Text style={[styles.infoText, { color: theme.text }]}>⏱️   Duración: {classDetail.durationMinutes} min</Text>
            <Text style={[styles.infoText, { color: theme.text }]}>📍   Ubicación: {classDetail.location}</Text>
            <Text style={[styles.infoText, { color: theme.text }]}>👥   Cupos disponibles: {classDetail.availableSlots}</Text>
          </View>
        </View>

        <View style={[styles.descriptionCard, { backgroundColor: theme.card, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>Descripción</Text>
          <Text style={[styles.descriptionText, { color: theme.text }]}>
            {classDetail.description || 'Sin descripción disponible.'}
          </Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.card, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>Información importante</Text>
          <Text style={[styles.bulletText, { color: theme.text }]}>• Llegá 10 minutos antes del inicio de la clase</Text>
          <Text style={[styles.bulletText, { color: theme.text }]}>• Traé tu botella de agua y toalla</Text>
          <Text style={[styles.bulletText, { color: theme.text }]}>• Usá ropa cómoda para entrenar</Text>
          <Text style={[styles.bulletText, { color: theme.text }]}>• Si cancelás, hacelo con 2 horas de anticipación</Text>
        </View>

        <TouchableOpacity style={[styles.mapButton, { backgroundColor: theme.card, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]} onPress={handleViewMap}>
          <Text style={[styles.mapButtonText, { color: theme.primary }]}>Ver Mapa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.reserveButton,
            { backgroundColor: isBooked ? theme.success : theme.primary },
            isBooked && styles.bookedButton
          ]}
          onPress={handleBookClass}
          disabled={loading || isBooked || classDetail?.availableSlots === 0}
          activeOpacity={isBooked ? 1 : 0.7}
        >
          <Text style={styles.reserveButtonText}>
            {loading ? 'Reservando...' : isBooked ? '✓ Clase reservada' : classDetail?.availableSlots === 0 ? 'Sin cupos disponibles' : 'Reservar'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 80,
  },
  mainCard: {
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  classTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoContainer: {
    gap: 8,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 8,
  },
  descriptionCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bulletText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
  mapButton: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mapButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reserveButton: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bookedButton: {
    opacity: 0.9,
  },
  reserveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  alreadyBookedContainer: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  alreadyBookedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default ClassDetailScreen;
