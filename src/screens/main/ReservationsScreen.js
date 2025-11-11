import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../utils/constants';
import bookingService from '../../services/bookingService';
import { formatDate } from '../../utils/helpers';

const ReservationsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [])
  );

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'No se pudieron cargar las reservas.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

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

  const renderBookingItem = ({ item }) => {
    const date = new Date(item.classDateTime);
    const formattedDate = formatDate(item.classDateTime);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;

    return (
      <View style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.className}>{item.className}</Text>
          {item.status === 'CONFIRMED' && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Confirmada</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.professorText}>Profesor: {item.professor}</Text>
        <Text style={styles.dateText}>{formattedDate} - {formattedTime}</Text>
        <Text style={styles.locationText}>{item.location}</Text>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelBooking(item.bookingId)}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.bookingId}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Reservas</Text>
            <Text style={styles.subtitle}>Mis Reservas</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Cargando...' : 'No tenés reservas'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BEIGE,
  },
  listContent: {
    padding: 24,
    paddingBottom: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.ORANGE,
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.DARK,
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.DARK,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  bookingCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  className: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.DARK,
    flex: 1,
    marginRight: 8,
  },
  professorText: {
    fontSize: 16,
    color: COLORS.DARK,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.DARK,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.DARK,
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: COLORS.ORANGE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  cancelButton: {
    backgroundColor: COLORS.GRAY,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
});

export default ReservationsScreen;
