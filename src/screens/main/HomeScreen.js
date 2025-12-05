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
import Card from '../../components/Card';
import BiometricPrompt from '../../components/BiometricPrompt';
import FilterSelector from '../../components/FilterSelector';
import { COLORS, DISCIPLINES } from '../../utils/constants';
import createScheduleService from '../../services/scheduleService';
import createBookingService from '../../services/bookingService';
import createLocationService from '../../services/locationService';
import { useAxios } from '../../hooks/useAxios';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../../components/NotificationBell';
import NotificationDrawer from '../../components/NotificationDrawer';

const HomeScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { needsBiometricAuth, logout } = useAuth();
  const [classes, setClasses] = useState([]);
  const [bookedClassIds, setBookedClassIds] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState('Todos');
  const [selectedLocation, setSelectedLocation] = useState('Todas');
  const [selectedDate, setSelectedDate] = useState('Todas');
  const [nextClass, setNextClass] = useState(null);
  const axiosInstance = useAxios();
  const scheduleService = createScheduleService(axiosInstance);
  const bookingService = createBookingService(axiosInstance);
  const locationService = createLocationService(axiosInstance);

  // State to control whether to show the biometric prompt
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  useEffect(() => {
    // Load locations when component mounts
    loadLocations();

    // Check if biometric authentication is needed when entering Home
    if (needsBiometricAuth()) {
      // Needs authentication, show the prompt
      setShowBiometricPrompt(true);
    } else {
      // Already authenticated in this session, load classes normally
      loadClasses();
    }
  }, []);

  const loadLocations = async () => {
    try {
      const data = await locationService.getAllLocations();
      setLocations(data);
    } catch (error) {
      // Not critical, continue without dynamic locations
      setLocations([]);
    }
  };

  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await scheduleService.getWeeklySchedule();

      setClasses(data);

      // Load IDs of already booked classes
      try {
        const bookedIds = await bookingService.getBookedClassIds();
        setBookedClassIds(bookedIds);
      } catch (error) {
        // Not critical, continue without marking classes
        setBookedClassIds([]);
      }

      // Load the next confirmed class
      try {
        const bookings = await bookingService.getMyBookings();

        const now = new Date();
        const confirmedBookings = bookings.filter((booking) => {
          const classDate = new Date(booking.classDateTime);
          return booking.status === 'CONFIRMED' && classDate > now;
        });

        if (confirmedBookings.length > 0) {
          // Sort by date and take the closest one
          confirmedBookings.sort((a, b) =>
            new Date(a.classDateTime) - new Date(b.classDateTime)
          );

          // Map backend structure to what the component expects
          setNextClass({
            discipline: confirmedBookings[0].className,
            dateTime: confirmedBookings[0].classDateTime,
            location: confirmedBookings[0].location,
            professor: confirmedBookings[0].professor,
            durationMinutes: confirmedBookings[0].durationMinutes,
          });
        } else {
          setNextClass(null);
        }
      } catch (error) {
        // Not critical, continue without next class
        setNextClass(null);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las clases. Por favor intenta nuevamente.');
      setClasses([]);
    } finally {
      setLoading(false);
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

  const handleReserveClass = () => {
    // Navigate to Reservations tab
    navigation.navigate('Reservations');
  };

  const handleMyProfile = () => {
    navigation.navigate('Profile');
  };

  // Callbacks for BiometricPrompt
  const handleBiometricSuccess = () => {
    // Successful authentication, load classes and continue with flow
    loadClasses();
  };

  const handleBiometricFailure = async (reason) => {
    // Authentication failed or no enrollment, logout and redirect to login

    Alert.alert(
      'Autenticación requerida',
      'No se pudo completar la autenticación. Serás redirigido al login.',
      [
        {
          text: 'OK',
          onPress: async () => {
            await logout();
            // Navigation to login happens automatically via AppNavigator
          },
        },
      ]
    );
  };

  const handleBiometricCancel = async () => {
    // User cancelled authentication, logout and redirect to login

    await logout();
    // Navigation to login happens automatically via AppNavigator
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

  const getFilteredClasses = () => {
    return classes.filter((item) => {
      // Filter by discipline - improved
      const matchDiscipline = (() => {
        if (selectedDiscipline === 'Todos') return true;

        const itemDiscipline = item.discipline || item.name || item.className || '';

        // Case-insensitive comparison
        return itemDiscipline.toLowerCase().includes(selectedDiscipline.toLowerCase());
      })();

      // Filter by location/site - improved to handle different formats
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

          if (!item.dateTime) return false;

          const classDate = new Date(item.dateTime);
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
      })
      .sort((a, b) => {
        // Sort by date (closest first)
        const dateA = a.dateTime ? new Date(a.dateTime).getTime() : Infinity;
        const dateB = b.dateTime ? new Date(b.dateTime).getTime() : Infinity;
        return dateA - dateB;
      });
  };

  const renderClassItem = ({ item }) => {
    const isBooked = bookedClassIds.includes(item.id);

    return (
      <Card onPress={() => handleClassPress(item)} style={[styles.classCard, { backgroundColor: theme.card, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.className, { color: theme.text }]}>{item.discipline}</Text>
          <View style={[styles.badge, { backgroundColor: isBooked ? theme.success : theme.primary }]}>
            <Text style={styles.badgeText}>{isBooked ? '✓ Reservada' : item.discipline}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>Instructor: {item.professor}</Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>Sede: {item.location}</Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Fecha: {item.dateTime ? new Date(item.dateTime).toLocaleDateString('es-AR', { 
              weekday: 'short', 
              day: 'numeric', 
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'N/A'}
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Duración: {item.durationMinutes} min
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Cupos: {item.availableSlots}
          </Text>
        </View>
      </Card>
    );
  };

  const filteredClasses = getFilteredClasses();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      {/* BiometricPrompt - Shows only if showBiometricPrompt is true */}
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

            {nextClass && (() => {
              const now = new Date();
              const classDate = new Date(nextClass.dateTime);

              // Compare only dates (without time) to avoid UTC issues
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const classDay = new Date(classDate.getFullYear(), classDate.getMonth(), classDate.getDate());

              const diffTime = classDay - today;
              const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

              let headerText = '';
              if (diffDays === 0) {
                headerText = '¡Hoy tienes clase!';
              } else if (diffDays === 1) {
                headerText = '¡Mañana tienes clase!';
              } else {
                headerText = `Próxima clase en ${diffDays} días`;
              }

              return (
                <Card style={[styles.featuredCard, { backgroundColor: theme.card, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
                  <View style={[styles.featuredCardHeader, { backgroundColor: theme.primary }]}>
                    <Text style={styles.featuredCardBadge}>{headerText}</Text>
                  </View>
                  <View style={styles.featuredCardBody}>
                    <Text style={[styles.featuredClassName, { color: theme.primary }]}>{nextClass.discipline}</Text>
                    <View style={[styles.featuredInfoRow, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(242, 106, 62, 0.08)' }]}>
                      <Text style={[styles.featuredInfoText, { color: theme.text }]}>
                        {new Date(nextClass.dateTime).toLocaleDateString('es-AR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        }).replace(/^\w/, (c) => c.toUpperCase())} • {
                          new Date(nextClass.dateTime).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        }
                      </Text>
                    </View>
                    <View style={[styles.featuredInfoRow, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(242, 106, 62, 0.08)' }]}>
                      <Text style={[styles.featuredInfoText, { color: theme.text }]}>{nextClass.location}</Text>
                    </View>
                    <View style={[styles.featuredInfoRow, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(242, 106, 62, 0.08)' }]}>
                      <Text style={[styles.featuredInfoText, { color: theme.text }]}>{nextClass.professor}</Text>
                    </View>
                  </View>
                </Card>
              );
            })()}

            <Text style={[styles.catalogTitle, { color: theme.primary }]}>Catálogo de Clases y Turnos</Text>

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

      {/* Notification Drawer - Handled in MainTabs */}
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
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 130,
    height: 130,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  quickButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    marginHorizontal: 4,
  },
  quickButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featuredCard: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    padding: 0,
    marginTop: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  featuredCardHeader: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  featuredCardBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredCardBody: {
    padding: 20,
  },
  featuredClassName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuredInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  featuredInfoIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  featuredInfoText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  catalogTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 30,
    lineHeight: 28,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  classesListTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  classCard: {
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  badge: {
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
