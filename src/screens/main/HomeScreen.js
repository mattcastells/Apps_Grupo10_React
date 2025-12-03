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
import { COLORS, DISCIPLINES } from '../../utils/constants';
import createScheduleService from '../../services/scheduleService';
import createBookingService from '../../services/bookingService';
import createLocationService from '../../services/locationService';
import { useAxios } from '../../hooks/useAxios';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

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

  const loadLocations = async () => {
    try {
      console.log('📍 Cargando ubicaciones desde el backend...');
      const data = await locationService.getAllLocations();
      console.log('✅ Ubicaciones cargadas:', data);
      setLocations(data);
    } catch (error) {
      console.error('⚠️ Error loading locations:', error);
      // No es crítico, continuar sin ubicaciones dinámicas
      setLocations([]);
    }
  };

  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔄 Cargando clases desde el backend...');
      const data = await scheduleService.getWeeklySchedule();
      console.log('✅ Clases cargadas del backend:', JSON.stringify(data, null, 2));
      console.log('📊 Total de clases recibidas:', data.length);

      // Debug: Verificar estructura de cada clase
      if (data.length > 0) {
        console.log('� Primera clase (ejemplo):', JSON.stringify(data[0], null, 2));
      }

      setClasses(data);

      // Cargar IDs de clases ya reservadas
      try {
        const bookedIds = await bookingService.getBookedClassIds();
        console.log('✅ IDs de clases reservadas:', bookedIds);
        setBookedClassIds(bookedIds);
      } catch (error) {
        console.error('⚠️ Error loading booked class IDs:', error);
        // No es crítico, continuar sin marcar clases
        setBookedClassIds([]);
      }
    } catch (error) {
      console.error('❌ Error loading classes:', error);
      console.error('❌ Error details:', error.response?.data);
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
    console.log('[HomeScreen] Autenticación biométrica exitosa');
    loadClasses();
  };

  const handleBiometricFailure = async (reason) => {
    // Autenticación fallida o sin enrolamiento, desloguear y redirigir a login
    console.log('[HomeScreen] Autenticación biométrica fallida. Razón:', reason);

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
    console.log('[HomeScreen] Autenticación biométrica cancelada');

    await logout();
    // La navegación al login se hace automáticamente por el AppNavigator
  };

  const getFilteredClasses = () => {
    return classes
      .filter((item) => {
        // Filtro por disciplina
        const matchDiscipline =
          selectedDiscipline === 'Todos' ||
          item.discipline === selectedDiscipline;

        // Filtro por ubicación/sede
        const matchLocation =
          selectedLocation === 'Todas' ||
          item.location === selectedLocation;

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
              {/* Filtro de Sede */}
              <View style={styles.filterWrapper}>
                <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Sede</Text>
                <View style={[styles.filterItem, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDarkMode ? 1 : 1 }]}>
                  <Picker
                    selectedValue={selectedLocation}
                    onValueChange={setSelectedLocation}
                    style={[styles.picker, { color: theme.text }]}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item key="todas" label="Todas" value="Todas" />
                    {Array.isArray(locations) && locations.map((location) => {
                      // Mostrar solo el nombre de la ciudad (ej: "Palermo") en lugar de "Sede Palermo"
                      const shortLabel = location?.name?.replace('Sede ', '') || location?.name || 'Sin nombre';
                      return <Picker.Item key={location.id} label={shortLabel} value={location.name} />;
                    })}
                  </Picker>
                </View>
              </View>

              {/* Filtro de Disciplina */}
              <View style={styles.filterWrapper}>
                <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Disciplina</Text>
                <View style={[styles.filterItem, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDarkMode ? 1 : 1 }]}>
                  <Picker
                    selectedValue={selectedDiscipline}
                    onValueChange={setSelectedDiscipline}
                    style={[styles.picker, { color: theme.text }]}
                    itemStyle={styles.pickerItem}
                  >
                    {DISCIPLINES.map((discipline) => (
                      <Picker.Item key={discipline} label={discipline} value={discipline} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Filtro de Fecha */}
              <View style={styles.filterWrapper}>
                <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Fecha</Text>
                <View style={[styles.filterItem, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDarkMode ? 1 : 1 }]}>
                  <Picker
                    selectedValue={selectedDate}
                    onValueChange={setSelectedDate}
                    style={[styles.picker, { color: theme.text }]}
                    itemStyle={styles.pickerItem}
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
    marginBottom: 16,
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterWrapper: {
    flex: 1,
    minWidth: 100,
    maxWidth: '32%',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
    textAlign: 'center',
  },
  filterItem: {
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 4,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    fontSize: 14,
    height: 50,
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
