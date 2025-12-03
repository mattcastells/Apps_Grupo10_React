import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import createBookingService from '../../services/bookingService';
import createScheduleService from '../../services/scheduleService';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAxios } from '../../hooks/useAxios';
import BookingCard from '../../components/BookingCard';

const ReservationsScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [professorClasses, setProfessorClasses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const axiosInstance = useAxios();
  const bookingService = createBookingService(axiosInstance);
  const scheduleService = createScheduleService(axiosInstance);

  const isProfessor = user?.role === 'PROFESSOR';

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      if (isProfessor) {
        // Load professor's assigned classes
        const classes = await scheduleService.getClassesByProfessor(user.name);
        setProfessorClasses(classes);
      } else {
        // Load user's bookings
        const data = await bookingService.getMyBookings();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', isProfessor ? 'No se pudieron cargar las clases.' : 'No se pudieron cargar las reservas.');
      if (isProfessor) {
        setProfessorClasses([]);
      } else {
        setBookings([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isProfessor, user]);

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      'Cancelar Reserva',
      '¿Estás seguro de que querés cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingService.cancelBooking(bookingId);
              Alert.alert('Éxito', 'Reserva cancelada correctamente');
              loadBookings();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar la reserva');
            }
          },
        },
      ]
    );
  };

  const renderBookingItem = ({ item }) => (
    <BookingCard 
      item={item} 
      onCancel={handleCancelBooking}
    />
  );

  const renderProfessorClassItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.classCard, { backgroundColor: theme.background }]}
      onPress={() => navigation.navigate('EditClass', { classId: item.id })}
    >
      <Text style={[styles.className, { color: theme.text }]}>{item.discipline}</Text>
      <Text style={[styles.classInfo, { color: theme.textSecondary }]}>
        {new Date(item.dateTime).toLocaleDateString('es-AR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>
      <Text style={[styles.classInfo, { color: theme.textSecondary }]}>
        📍 {item.location}
      </Text>
      <Text style={[styles.classInfo, { color: theme.textSecondary }]}>
        👨‍� {item.professor} • {item.durationMinutes} min
      </Text>
      <Text style={[styles.classInfo, { color: theme.textSecondary }]}>
        👥 {item.availableSlots} cupos disponibles
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: theme.backgroundSecondary }]}>
        <Text style={[styles.title, { color: theme.primary }]}>
          {isProfessor ? 'Mis Clases' : 'Mis Reservas'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>
          {isProfessor ? 'Clases asignadas' : 'Próximas clases'}
        </Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {isProfessor ? 'Tus clases programadas' : 'Tus reservas confirmadas'}
        </Text>
      </View>
      
      {isProfessor && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('CreateClass')}
          >
            <Text style={styles.createButtonText}>+ Crear Clase</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={[styles.contentContainer, { backgroundColor: theme.container, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
        <FlatList
          data={isProfessor ? professorClasses : bookings}
          renderItem={isProfessor ? renderProfessorClassItem : renderBookingItem}
          keyExtractor={(item) => isProfessor ? item.id : item.bookingId}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {loading ? 'Cargando...' : (isProfessor ? 'No tenés clases asignadas' : 'No tenés reservas')}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  contentContainer: {
    flex: 1,
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    paddingTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  createButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  classCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  classInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
});

export default ReservationsScreen;
