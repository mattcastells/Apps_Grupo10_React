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
  const axiosInstance = useAxios();
  const scheduleService = createScheduleService(axiosInstance);
  const bookingService = createBookingService(axiosInstance);
  const locationService = createLocationService(axiosInstance);

  // 🔐 Estado para controlar si debe mostrar el prompt biométrico
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  useEffect(() => {
    // Cargar ubicaciones al montar el componente
    loadLocations();

    // 🔐 Verificar si necesita autenticación biométrica al entrar al Home
    if (needsBiometricAuth()) {
      // Necesita autenticarse, mostrar el prompt
      setShowBiometricPrompt(true);
    } else {
      // Ya se autenticó en esta sesión, cargar clases normalmente
      loadClasses();
    }
  }, []);

  // Separar el useEffect para configurar el header de notificaciones
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <NotificationBell 
          onPress={() => setShowNotificationDrawer(true)} 
        />
      ),
    });
  }, [navigation]);

  const loadLocations = async () => {
    try {
      const data = await locationService.getAllLocations();
      setLocations(data);
    } catch (error) {
      // No es crítico, continuar sin ubicaciones dinámicas
      setLocations([]);
    }
  };

  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await scheduleService.getWeeklySchedule();

      setClasses(data);

      // Cargar IDs de clases ya reservadas
      try {
        const bookedIds = await bookingService.getBookedClassIds();
        setBookedClassIds(bookedIds);
      } catch (error) {
        // No es crítico, continuar sin marcar clases
        setBookedClassIds([]);
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
    // Navegar al tab de Reservas
    navigation.navigate('Reservations');
  };

  const handleMyProfile = () => {
    navigation.navigate('Profile');
  };

  // 🔐 Callbacks para BiometricPrompt
  const handleBiometricSuccess = () => {
    // Autenticación exitosa, cargar las clases y continuar con el flujo
    loadClasses();
  };

  const handleBiometricFailure = async (reason) => {
    // Autenticación fallida o sin enrolamiento, desloguear y redirigir a login

    Alert.alert(
      'Autenticación requerida',
      'No se pudo completar la autenticación. Serás redirigido al login.',
      [
        {
          text: 'OK',
          onPress: async () => {
            await logout();
            // La navegación al login se hace automáticamente por el AppNavigator
          },
        },
      ]
    );
  };

  const handleBiometricCancel = async () => {
    // Usuario canceló la autenticación, desloguear y redirigir a login

    await logout();
    // La navegación al login se hace automáticamente por el AppNavigator
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

  const getFilteredClasses = () => {
    return classes.filter((item) => {
      // Filtro por disciplina - mejorado
      const matchDiscipline = (() => {
        if (selectedDiscipline === 'Todos') return true;

        const itemDiscipline = item.discipline || item.name || item.className || '';

        // Comparar case-insensitive
        return itemDiscipline.toLowerCase().includes(selectedDiscipline.toLowerCase());
      })();

      // Filtro por ubicación/sede - mejorado para manejar diferentes formatos
      const matchLocation = (() => {
        if (selectedLocation === 'Todas') return true;

        const itemLocation = item.location || item.site || '';

        // Comparar directamente (case-insensitive)
        if (itemLocation.toLowerCase() === selectedLocation.toLowerCase()) return true;

        // Comparar sin "Sede " en ambos lados (case-insensitive)
        const normalizedSelected = selectedLocation.replace(/Sede /i, '').toLowerCase();
        const normalizedItem = itemLocation.replace(/Sede /i, '').toLowerCase();

        return normalizedSelected === normalizedItem;
      })();

      // Filtro por fecha
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
        // Ordenar por fecha (más cercana primero)
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

            <Card style={[styles.featuredCard, { backgroundColor: theme.card, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
              <View style={styles.featuredCardContent}>
                <View style={styles.featuredIcon}>
                  <Text style={styles.featuredIconText}>📅</Text>
                </View>
                <View style={styles.featuredTextContainer}>
                  <Text style={[styles.featuredTitle, { color: theme.primary }]}>Próxima clase: Yoga - 10:00</Text>
                  <Text style={[styles.featuredSubtitle, { color: theme.textSecondary }]}>¡No olvides tu clase!</Text>
                </View>
              </View>
            </Card>

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

      {/* Notification Drawer */}
      <NotificationDrawer
        visible={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
        onNotificationsRead={() => {
          // Opcional: recargar algo si es necesario
        }}
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
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    minHeight: 80,
  },
  featuredCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredIcon: {
    width: 40,
    height: 40,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredIconText: {
    fontSize: 32,
  },
  featuredTextContainer: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 22,
  },
  featuredSubtitle: {
    fontSize: 14,
  },
  catalogTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 16,
    lineHeight: 28,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
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
