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
import { formatDate } from '../../utils/helpers';
import { useAxios } from '../../hooks/useAxios';

const ClassDetailScreen = ({ route, navigation }) => {
  const { classId } = route.params;
  const [classDetail, setClassDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const axiosInstance = useAxios();
  const scheduleService = createScheduleService(axiosInstance);
  const bookingService = createBookingService(axiosInstance);

  useEffect(() => {
    loadClassDetail();
  }, [classId]);

  const loadClassDetail = async () => {
    setLoading(true);
    try {
      const data = await scheduleService.getClassDetail(classId);
      setClassDetail(data);
    } catch (error) {
      console.error('Error loading class detail:', error);
      Alert.alert('Error', 'No se pudo cargar la información de la clase', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClass = async () => {
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
              await bookingService.createBooking(classId);
              Alert.alert('Éxito', 'Clase reservada correctamente', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert('Error', 'No se pudo reservar la clase');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleViewMap = () => {
    const locationQuery = classDetail?.location || 'RitmoFit';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      locationQuery
    )}`;
    Linking.openURL(url);
  };

  if (!classDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Clase</Text>
        </View>

        {/* Main Card */}
        <View style={styles.mainCard}>
          <Text style={styles.classTitle}>{classDetail.name}</Text>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              👨‍🏫 Profesor: {classDetail.professor}
            </Text>
            <Text style={styles.infoText}>📅 Fecha: {formattedDate}</Text>
            <Text style={styles.infoText}>🕐 Horario: {formattedTime}</Text>
            <Text style={styles.infoText}>
              ⏱️ Duración: {classDetail.durationMinutes} min
            </Text>
            <Text style={styles.infoText}>
              📍 Ubicación: {classDetail.location}
            </Text>
            <Text style={styles.infoText}>
              👥 Cupos disponibles: {classDetail.availableSlots}
            </Text>
          </View>
        </View>

        {/* Description Card */}
        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.descriptionText}>
            {classDetail.description || 'Sin descripción disponible.'}
          </Text>
        </View>

        {/* Important Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Información importante</Text>
          <Text style={styles.bulletText}>
            • Llegá 10 minutos antes del inicio de la clase
          </Text>
          <Text style={styles.bulletText}>• Traé tu botella de agua y toalla</Text>
          <Text style={styles.bulletText}>• Usá ropa cómoda para entrenar</Text>
          <Text style={styles.bulletText}>
            • Si cancelás, hacelo con 2 horas de anticipación
          </Text>
        </View>

        {/* View Map Button */}
        <TouchableOpacity style={styles.mapButton} onPress={handleViewMap}>
          <Text style={styles.mapButtonText}>Ver Mapa</Text>
        </TouchableOpacity>

        {/* Reserve Button */}
        <TouchableOpacity
          style={styles.reserveButton}
          onPress={handleBookClass}
          disabled={loading}
        >
          <Text style={styles.reserveButtonText}>
            {loading ? 'Reservando...' : 'Reservar'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BEIGE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.DARK,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.ORANGE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 20,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.DARK,
    flex: 1,
    textAlign: 'center',
  },
  mainCard: {
    backgroundColor: COLORS.WHITE,
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
    color: COLORS.ORANGE,
    textAlign: 'center',
    marginBottom: 20,
  },
  infoContainer: {
    gap: 8,
  },
  infoText: {
    fontSize: 18,
    color: COLORS.DARK,
    marginBottom: 8,
  },
  descriptionCard: {
    backgroundColor: COLORS.WHITE,
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
    color: COLORS.ORANGE,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: COLORS.DARK,
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: COLORS.WHITE,
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
    color: COLORS.DARK,
    lineHeight: 24,
    marginBottom: 4,
  },
  mapButton: {
    backgroundColor: COLORS.WHITE,
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
    color: COLORS.ORANGE,
  },
  reserveButton: {
    backgroundColor: COLORS.ORANGE,
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
  reserveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
});

export default ClassDetailScreen;
