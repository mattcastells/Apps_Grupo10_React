import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import createBookingService from '../../services/bookingService';
import createScheduleService from '../../services/scheduleService';
import createCheckInService from '../../services/checkInService';
import createLocationService from '../../services/locationService';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAxios } from '../../hooks/useAxios';
import { DISCIPLINES } from '../../utils/constants';
import BookingCard from '../../components/BookingCard';
import FilterSelector from '../../components/FilterSelector';
import NotificationBell from '../../components/NotificationBell';
import NotificationDrawer from '../../components/NotificationDrawer';
import ProfileButton from '../../components/ProfileButton';

const ReservationsScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [professorClasses, setProfessorClasses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Todas');
  const [selectedDiscipline, setSelectedDiscipline] = useState('Todos');
  const [selectedDate, setSelectedDate] = useState('Todas');
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const axiosInstance = useAxios();
  const bookingService = createBookingService(axiosInstance);
  const scheduleService = createScheduleService(axiosInstance);
  const checkInService = createCheckInService(axiosInstance);
  const locationService = createLocationService(axiosInstance);

  const isProfessor = user?.role === 'PROFESSOR';

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      if (isProfessor) {
        const classes = await scheduleService.getClassesByProfessor(user.name);
        setProfessorClasses(classes);

        const userBookings = await bookingService.getMyBookings();
        const confirmedBookings = userBookings.filter(booking => booking.status === 'CONFIRMED');
        setBookings(confirmedBookings);
      } else {
        const data = await bookingService.getMyBookings();
        const confirmedBookings = data.filter(booking => booking.status === 'CONFIRMED');
        setBookings(confirmedBookings);
      }
    } catch (error) {
      Alert.alert('Error', isProfessor ? 'No se pudieron cargar las clases.' : 'No se pudieron cargar las reservas.');
      if (isProfessor) {
        setProfessorClasses([]);
      }
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [isProfessor, user]);

  const loadLocations = useCallback(async () => {
    try {
      const data = await locationService.getAllLocations();
      setLocations(data);
    } catch (error) {
      setLocations([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookings();
      loadLocations();
    }, [loadBookings, loadLocations])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const getFilteredBookings = () => {
    return bookings.filter((item) => {
      // Filter by discipline - improved
      const matchDiscipline = (() => {
        if (selectedDiscipline === 'Todos') return true;
        
        const itemDiscipline = item.className || item.discipline || item.name || '';
        
        // Case-insensitive comparison
        return itemDiscipline.toLowerCase().includes(selectedDiscipline.toLowerCase());
      })();

      // Filter by site - improved to handle different formats
      const matchLocation = (() => {
        if (selectedLocation === 'Todas') return true;
        
        const itemLocation = item.location || item.site || '';
        
        // Direct comparison (case-insensitive)
        if (itemLocation.toLowerCase() === selectedLocation.toLowerCase()) return true;
        
        // Compare without "Sede " on both sides (case-insensitive)
        const normalizedSelected = selectedLocation.replace(/Sede /i, '').toLowerCase();
        const normalizedItem = itemLocation.replace(/Sede /i, '').toLowerCase();
        
        return normalizedSelected === normalizedItem;
      })();

      // Filter by date
      const matchDate = (() => {
        if (selectedDate === 'Todas') return true;

        if (!item.classDateTime) return false;

        const classDate = new Date(item.classDateTime);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const endOfWeek = new Date(today);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const classDayStart = new Date(classDate);
        classDayStart.setHours(0, 0, 0, 0);

        if (selectedDate === 'Hoy') {
          return classDayStart.getTime() === today.getTime();
        } else if (selectedDate === 'Mañana') {
          return classDayStart.getTime() === tomorrow.getTime();
        } else if (selectedDate === 'Semana') {
          return classDate >= today && classDate < endOfWeek;
        }

        return true;
      })();

      return matchDiscipline && matchLocation && matchDate;
    });
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

  const handleCheckIn = async (item) => {
    Alert.alert(
      'Confirmar Asistencia',
      `¿Confirmar tu asistencia a ${item.className}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await checkInService.checkIn(item.scheduledClassId);
              Alert.alert('¡Éxito!', 'Asistencia confirmada correctamente');
              loadBookings();
            } catch (error) {
              const errorMessage = error.response?.data?.message || 'No se pudo confirmar la asistencia';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleViewDetail = (item) => {
    navigation.navigate('ClassDetail', { classId: item.scheduledClassId });
  };

  // Options for filters
  const dateOptions = [
    { label: 'Todas', value: 'Todas' },
    { label: 'Hoy', value: 'Hoy' },
    { label: 'Mañana', value: 'Mañana' },
    { label: 'Esta semana', value: 'Semana' },
  ];

  const disciplineOptions = DISCIPLINES.map(d => ({ label: d, value: d }));

  const locationOptions = [
    { label: 'Todas', value: 'Todas' },
    ...locations.map((location) => {
      const shortName = location?.name?.replace('Sede ', '') || location?.name || 'Sin nombre';
      return {
        label: shortName,
        value: location.name, // Guardamos el nombre completo como value
      };
    }),
  ];

  const getLocationLabel = () => {
    if (selectedLocation === 'Todas') return 'Todas';
    const location = locations.find(loc => loc.name === selectedLocation);
    return location?.name?.replace('Sede ', '') || selectedLocation.replace('Sede ', '');
  };


  const renderBookingItem = ({ item }) => (
    <BookingCard
      item={item}
      onCancel={handleCancelBooking}
      onCheckIn={handleCheckIn}
      onPress={handleViewDetail}
    />
  );

  const renderProfessorClassItem = ({ item }) => {
    const date = new Date(item.dateTime);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    const formattedDate = date.toLocaleDateString('es-AR', { 
      weekday: 'long', 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return (
      <TouchableOpacity 
        style={[styles.classCard, { 
          backgroundColor: theme.card,
          borderWidth: isDarkMode ? 1 : 0,
          borderColor: theme.border
        }]}
        onPress={() => navigation.navigate('EditClass', { classId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardClassName, { color: theme.text }]}>
            {item.discipline}
          </Text>
          <View style={[styles.timeBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.timeText}>{formattedTime}</Text>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Profesor:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {item.professor}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Sede:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {item.location}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Fecha:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {formattedDate}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Duración:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {item.durationMinutes} minutos
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Cupos:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {item.availableSlots} disponibles
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <ProfileButton />,
      headerLeft: () => (
        <NotificationBell 
          onPress={() => setShowNotificationDrawer(true)} 
          style={{ marginLeft: 10 }}
        />
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Botón crear clase solo para profesores */}
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

        {/* Contenedor principal - Clases del profesor */}
        {isProfessor && (
          <View style={[styles.contentContainer, {
            backgroundColor: theme.container,
            borderWidth: isDarkMode ? 1 : 0,
            borderColor: theme.border
          }]}>
            {professorClasses.length > 0 ? (
              professorClasses.map((item) => (
                <View key={item.id}>
                  {renderProfessorClassItem({ item })}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  {loading ? 'Cargando...' : 'No tenés clases asignadas'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Sección de Mis Reservas para profesores */}
        {isProfessor && (
          <>
            <View style={styles.reservationsHeader}>
              <Text style={[styles.reservationsTitle, { color: theme.primary }]}>Mis Reservas</Text>
              <Text style={[styles.reservationsDescription, { color: theme.textSecondary }]}>
                Clases en las que participás como alumno
              </Text>
            </View>

            <View style={[styles.contentContainer, {
              backgroundColor: theme.container,
              borderWidth: isDarkMode ? 1 : 0,
              borderColor: theme.border
            }]}>
              {bookings.length > 0 ? (
                bookings.map((item) => (
                  <View key={item.bookingId}>
                    {renderBookingItem({ item })}
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    No tenés reservas como alumno
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* Contenedor para usuarios normales - Solo reservas */}
        {!isProfessor && (
          <View style={[styles.contentContainer, {
            backgroundColor: theme.container,
            borderWidth: isDarkMode ? 1 : 0,
            borderColor: theme.border
          }]}>
            {bookings.length > 0 ? (
              bookings.map((item) => (
                <View key={item.bookingId}>
                  {renderBookingItem({ item })}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  {loading ? 'Cargando...' : 'No tenés reservas'}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Notification Drawer */}
      <NotificationDrawer
        visible={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
      />
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  contentContainer: {
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  reservationsHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  reservationsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reservationsDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
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
    marginBottom: 8,
  },
  createButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.5,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos para las cards de clases del profesor (ahora consistentes con BookingCard)
  classCard: {
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardClassName: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  timeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardBody: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 85,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
});

export default ReservationsScreen;
