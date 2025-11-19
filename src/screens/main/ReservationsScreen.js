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
import { useTheme } from '../../context/ThemeContext';
import { useAxios } from '../../hooks/useAxios';
import BookingCard from '../../components/BookingCard';

const ReservationsScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const axiosInstance = useAxios();
  const bookingService = createBookingService(axiosInstance);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las reservas.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: theme.backgroundSecondary }]}>
        <Text style={[styles.title, { color: theme.primary }]}>Mis Reservas</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>Próximas clases</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Tus reservas confirmadas
        </Text>
      </View>
      <View style={[styles.contentContainer, { backgroundColor: theme.container, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.bookingId}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {loading ? 'Cargando...' : 'No tenés reservas'}
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
});

export default ReservationsScreen;
