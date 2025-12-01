import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import createBookingService from '../../services/bookingService';
import createCheckInService from '../../services/checkInService';
import createLocationService from '../../services/locationService';
import { useTheme } from '../../context/ThemeContext';
import { useAxios } from '../../hooks/useAxios';
import { DISCIPLINES } from '../../utils/constants';
import BookingCard from '../../components/BookingCard';
import FilterSelector from '../../components/FilterSelector';

const ReservationsScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Todas');
  const [selectedDiscipline, setSelectedDiscipline] = useState('Todos');
  const [selectedDate, setSelectedDate] = useState('Todas');
  const axiosInstance = useAxios();
  const bookingService = createBookingService(axiosInstance);
  const checkInService = createCheckInService(axiosInstance);
  const locationService = createLocationService(axiosInstance);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingService.getMyBookings();
      console.log('Bookings data:', JSON.stringify(data, null, 2));
      // Filtrar solo las reservas CONFIRMED (futuras, no asistidas)
      const confirmedBookings = data.filter(booking => booking.status === 'CONFIRMED');
      setBookings(confirmedBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLocations = useCallback(async () => {
    try {
      const data = await locationService.getAllLocations();
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
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
      // Filtro por disciplina
      const matchDiscipline =
        selectedDiscipline === 'Todos' ||
        item.className === selectedDiscipline ||
        item.discipline === selectedDiscipline;

      // Filtro por sede
      const matchLocation =
        selectedLocation === 'Todas' ||
        item.location === selectedLocation ||
        item.site === selectedLocation;

      // Filtro por fecha
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
              loadBookings(); // Recarga la lista para eliminar la reserva cancelada
            } catch (error) {
              console.error('Error cancelling booking:', error);
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

  // Opciones para los filtros
  const dateOptions = [
    { label: 'Todas', value: 'Todas' },
    { label: 'Hoy', value: 'Hoy' },
    { label: 'Mañana', value: 'Mañana' },
    { label: 'Esta semana', value: 'Semana' },
  ];

  const disciplineOptions = DISCIPLINES.map(d => ({ label: d, value: d }));

  const locationOptions = [
    { label: 'Todas', value: 'Todas' },
    ...locations.map((location) => ({
      label: location?.name?.replace('Sede ', '') || location?.name || 'Sin nombre',
      value: location.name,
    })),
  ];

  const getLocationLabel = () => {
    if (selectedLocation === 'Todas') return 'Todas';
    const location = locations.find(loc => loc.name === selectedLocation);
    return location?.name?.replace('Sede ', '') || selectedLocation;
  };


  const renderBookingItem = ({ item }) => (
    <BookingCard
      item={item}
      onCancel={handleCancelBooking}
      onCheckIn={handleCheckIn}
      onPress={handleViewDetail}
    />
  );

  const filteredBookings = getFilteredBookings();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <View style={[styles.contentContainer, { backgroundColor: theme.container, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
        <FlatList
          data={filteredBookings}
          ListHeaderComponent={
            <View style={styles.filtersContainer}>
              <FilterSelector
                label="Fecha"
                value={selectedDate}
                options={dateOptions}
                onSelect={setSelectedDate}
              />
              <FilterSelector
                label="Disciplina"
                value={selectedDiscipline}
                options={disciplineOptions}
                onSelect={setSelectedDiscipline}
              />
              <FilterSelector
                label="Sede"
                value={getLocationLabel()}
                options={locationOptions}
                onSelect={setSelectedLocation}
              />
            </View>
          }
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.bookingId || item.scheduledClassId}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {loading ? 'Cargando...' : 'No tenés reservas confirmadas'}
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
});

export default ReservationsScreen;
