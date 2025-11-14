import React, { useState, useEffect, useCallback } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import Card from '../../components/Card';
import BiometricPrompt from '../../components/BiometricPrompt';
import { COLORS } from '../../utils/constants';
import createScheduleService from '../../services/scheduleService';
import createLocationService from '../../services/locationService';
import createBookingService from '../../services/bookingService';
import { useAxios } from '../../hooks/useAxios';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { needsBiometricAuth, logout } = useAuth();
  const [classes, setClasses] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState('Todos');
  const [selectedLocation, setSelectedLocation] = useState('Todas');
  const [selectedDate, setSelectedDate] = useState('Todas');
  const axiosInstance = useAxios();
  const scheduleService = createScheduleService(axiosInstance);
  const locationService = createLocationService(axiosInstance);
  const bookingService = createBookingService(axiosInstance);

  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);

  useEffect(() => {
    if (needsBiometricAuth()) {
      setShowBiometricPrompt(true);
    } else {
      loadClasses();
      loadLocations();
      loadDisciplines();
    }
  }, []);

  const loadLocations = useCallback(async () => {
    try {
      console.log('Loading locations from backend...');
      const data = await locationService.getAllLocations();
      console.log('Locations loaded:', data);
      const locationsWithAll = ['Todas', ...data.map(loc => loc.name)];
      setLocations(locationsWithAll);
    } catch (error) {
      console.error('Error loading locations:', error);
      setLocations(['Todas']);
    }
  }, []);

  const loadDisciplines = useCallback(async () => {
    try {
      console.log('Loading disciplines from backend...');
      const data = await scheduleService.getDisciplines();
      console.log('Disciplines loaded:', data);
      const mapped = Array.isArray(data)
        ? data
            .map((d) => (typeof d === 'string' ? d : d?.discipline ?? d?.name ?? ''))
            .filter(Boolean)
        : [];
      const disciplinesWithAll = ['Todos', ...mapped];
      setDisciplines(disciplinesWithAll);
    } catch (error) {
      console.error('Error loading disciplines:', error);
      setDisciplines(['Todos']);
    }
  }, []);

  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Loading classes from backend...');
      const data = await scheduleService.getWeeklySchedule();
      console.log('Classes loaded:', data);
      setClasses(data);
      
      // Load user bookings to check which classes are already booked
      await loadUserBookings();
    } catch (error) {
      console.error('Error loading classes:', error);
      Alert.alert('Error', 'Could not load classes. Please try again.');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserBookings = useCallback(async () => {
    try {
      console.log('Loading user bookings...');
      const bookings = await bookingService.getMyBookings();
      console.log('User bookings loaded:', bookings);
      setUserBookings(bookings);
    } catch (error) {
      console.error('Error loading user bookings:', error);
      // No mostrar error al usuario, solo no marcar clases como reservadas
      setUserBookings([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadClasses();
    }, [loadClasses])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClasses();
    setRefreshing(false);
  };

  const handleClassPress = (classItem) => {
    navigation.navigate('ClassDetail', { classId: classItem.id });
  };

  // 🔐 Callbacks para BiometricPrompt
  const handleBiometricSuccess = () => {
    console.log('[HomeScreen] Biometric authentication successful');
    loadClasses();
  };

  const handleBiometricFailure = async (reason) => {
    console.log('[HomeScreen] Biometric authentication failed. Reason:', reason);

    Alert.alert(
      'Authentication required',
      'Could not complete authentication. You will be redirected to login.',
      [
        {
          text: 'OK',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleBiometricCancel = async () => {
    console.log('[HomeScreen] Biometric authentication cancelled');
    await logout();
  };

  const getFilteredClasses = () => {
    return classes.filter((item) => {
      const matchDiscipline =
        selectedDiscipline === 'Todos' ||
        item.discipline === selectedDiscipline ||
        item.name?.includes(selectedDiscipline);

      const matchLocation =
        selectedLocation === 'Todas' ||
        item.location === selectedLocation ||
        item.site === selectedLocation;

      // Filter by date
      let matchDate = selectedDate === 'Todas';
      if (selectedDate !== 'Todas' && item.dateTime) {
        const classDate = new Date(item.dateTime);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate === 'Hoy') {
          const todayEnd = new Date(today);
          todayEnd.setHours(23, 59, 59, 999);
          matchDate = classDate >= today && classDate <= todayEnd;
        } else if (selectedDate === 'Mañana') {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowEnd = new Date(tomorrow);
          tomorrowEnd.setHours(23, 59, 59, 999);
          matchDate = classDate >= tomorrow && classDate <= tomorrowEnd;
        } else if (selectedDate === 'Semana') {
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          matchDate = classDate >= today && classDate <= weekEnd;
        }
      }

      return matchDiscipline && matchLocation && matchDate;
    });
  };

  // Check if a class is already booked by the user
  const isClassBooked = (classId) => {
    return userBookings.some(booking => 
      booking.scheduledClassId === classId || 
      // Also check by matching class details in case scheduledClassId is not exposed
      (booking.className === classId || booking.bookingId === classId)
    );
  };

  const renderClassItem = ({ item }) => {
    const isBooked = isClassBooked(item.id);
    
    return (
      <Card onPress={() => handleClassPress(item)} style={[styles.classCard, { backgroundColor: theme.card, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.className, { color: theme.text }]}>{item.name || item.discipline}</Text>
          <View style={styles.badgeContainer}>
            {isBooked && (
              <View style={[styles.bookedBadge, { backgroundColor: theme.success, marginRight: 8 }]}>
                <Text style={styles.badgeText}>✓ Reservada</Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
              <Text style={styles.badgeText}>{item.discipline}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>Instructor: {item.professor || item.teacher || 'N/A'}</Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>Sede: {item.location || item.site || 'N/A'}</Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Fecha: {item.dateTime ? new Date(item.dateTime).toLocaleDateString() : 'N/A'}
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Duración: {item.durationMinutes || 60} min
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Cupos: {item.availableSlots || 0}
          </Text>
        </View>
      </Card>
    );
  };

  const filteredClasses = getFilteredClasses();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      {/* 🔐 BiometricPrompt - Se muestra solo si showBiometricPrompt es true */}
      {showBiometricPrompt && (
        <BiometricPrompt
          onSuccess={handleBiometricSuccess}
          onFailure={handleBiometricFailure}
          onCancel={handleBiometricCancel}
          maxAttempts={2}
        />
      )}

      <FlatList
        data={filteredClasses}
        renderItem={renderClassItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            <View style={styles.logoContainer}>
              <View style={[styles.logoPlaceholder, { backgroundColor: theme.primary }]}>
                <Text style={styles.logoText}>RF</Text>
              </View>
            </View>

            <Text style={[styles.title, { color: theme.text }]}>¡Bienvenido a RitmoFit!</Text>

            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Tu espacio para entrenar, reservar clases y mantenerte informado.
            </Text>

            <Text style={[styles.catalogTitle, { color: theme.primary }]}>Catálogo de Clases y Turnos</Text>

            <View style={styles.filtersContainer}>
              <View style={styles.filterWrapper}>
                <Text style={[styles.filterLabel, { color: theme.text }]}>Sede</Text>
                <View style={[styles.filterItem, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDarkMode ? 1 : 1 }]}>
                  <Picker
                    selectedValue={selectedLocation}
                    onValueChange={setSelectedLocation}
                    style={[styles.picker, { color: isDarkMode ? COLORS.WHITE : theme.text }]}
                  >
                    {locations.map((location) => (
                      <Picker.Item key={location} label={location} value={location} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.filterWrapper}>
                <Text style={[styles.filterLabel, { color: theme.text }]}>Disciplina</Text>
                <View style={[styles.filterItem, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDarkMode ? 1 : 1 }]}>
                  <Picker
                    selectedValue={selectedDiscipline}
                    onValueChange={setSelectedDiscipline}
                    style={[styles.picker, { color: isDarkMode ? COLORS.WHITE : theme.text }]}
                  >
                    {disciplines.map((discipline) => (
                      <Picker.Item key={discipline} label={discipline} value={discipline} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.filterWrapper}>
                <Text style={[styles.filterLabel, { color: theme.text }]}>Fecha</Text>
                <View style={[styles.filterItem, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDarkMode ? 1 : 1 }]}>
                  <Picker
                    selectedValue={selectedDate}
                    onValueChange={setSelectedDate}
                    style={[styles.picker, { color: isDarkMode ? COLORS.WHITE : theme.text }]}
                  >
                    <Picker.Item label="Todas" value="Todas" />
                    <Picker.Item label="Hoy" value="Hoy" />
                    <Picker.Item label="Mañana" value="Mañana" />
                    <Picker.Item label="Esta semana" value="Semana" />
                  </Picker>
                </View>
              </View>
            </View>

            <Text style={[styles.classesListTitle, { color: theme.text }]}>Clases disponibles</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {loading ? 'Cargando clases...' : 'No hay clases disponibles'}
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
  },
  listContent: {
    padding: 24,
    paddingBottom: 80,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 24,
  },
  catalogTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 16,
    lineHeight: 28,
  },
  filtersContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  filterWrapper: {
    marginBottom: 12,
    width: '48%',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
  },
  filterItem: {
    borderWidth: 1,
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    height: 56,
    fontSize: 14,
    color: COLORS.WHITE,
    paddingHorizontal: 8,
  },
  classesListTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  classCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  className: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardContent: {
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 2,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;
