import React, { useState, useEffect } from 'react';
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
import Button from '../../components/Button';
import { COLORS, DISCIPLINES, LOCATIONS } from '../../utils/constants';
import scheduleService from '../../services/scheduleService';
import { formatDate, formatTime } from '../../utils/helpers';

const HomeScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState('Todos');
  const [selectedLocation, setSelectedLocation] = useState('Todas');
  const [selectedDate, setSelectedDate] = useState('Todas');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      console.log('🔄 Cargando clases desde el backend...');
      const data = await scheduleService.getWeeklySchedule();
      console.log('✅ Clases cargadas:', data);
      setClasses(data);
    } catch (error) {
      console.error('❌ Error loading classes:', error);
      Alert.alert('Error', 'No se pudieron cargar las clases. Por favor intenta nuevamente.');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClasses();
    setRefreshing(false);
  };

  const handleClassPress = (classItem) => {
    navigation.navigate('ClassDetail', { classId: classItem.id });
  };

  const handleReserveClass = () => {
    // Navigate to filtered classes or bookings
    Alert.alert('Reservar clase', 'Navegar a reservas');
  };

  const handleMyProfile = () => {
    navigation.navigate('Profile');
  };

  const getFilteredClasses = () => {
    return classes.filter((item) => {
      // Filtro por disciplina
      const matchDiscipline =
        selectedDiscipline === 'Todos' || 
        item.discipline === selectedDiscipline ||
        item.name?.includes(selectedDiscipline);
      
      // Filtro por ubicación/sede
      const matchLocation = 
        selectedLocation === 'Todas' || 
        item.location === selectedLocation ||
        item.site === selectedLocation;
      
      return matchDiscipline && matchLocation;
    });
  };

  const renderClassItem = ({ item }) => (
    <Card onPress={() => handleClassPress(item)} style={styles.classCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.className}>{item.name || item.discipline}</Text>
        <View style={[styles.badge, { backgroundColor: COLORS.ORANGE }]}>
          <Text style={styles.badgeText}>{item.discipline}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.infoText}>Instructor: {item.professor || item.teacher || 'N/A'}</Text>
        <Text style={styles.infoText}>Sede: {item.location || item.site || 'N/A'}</Text>
        <Text style={styles.infoText}>
          Fecha: {item.dateTime ? new Date(item.dateTime).toLocaleDateString() : 'N/A'}
        </Text>
        <Text style={styles.infoText}>
          Duración: {item.durationMinutes || 60} min
        </Text>
        <Text style={styles.infoText}>
          Cupos: {item.availableSlots || 0}
        </Text>
      </View>
    </Card>
  );

  const filteredClasses = getFilteredClasses();

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredClasses}
        renderItem={renderClassItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>RF</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>¡Bienvenido a RitmoFit!</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Tu espacio para entrenar, reservar clases y mantenerte informado.
            </Text>

            {/* Quick Access Section */}
            <Text style={styles.sectionTitle}>Accesos rápidos</Text>

            {/* Quick Access Buttons */}
            <View style={styles.quickAccessContainer}>
              <TouchableOpacity
                style={[styles.quickButton, styles.quickButtonOrange]}
                onPress={handleReserveClass}
              >
                <Text style={styles.quickButtonText}>Reservar clase</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickButton, styles.quickButtonDark]}
                onPress={handleMyProfile}
              >
                <Text style={styles.quickButtonText}>Mi perfil</Text>
              </TouchableOpacity>
            </View>

            {/* Featured Card */}
            <Card style={styles.featuredCard}>
              <View style={styles.featuredCardContent}>
                <View style={styles.featuredIcon}>
                  <Text style={styles.featuredIconText}>📅</Text>
                </View>
                <View style={styles.featuredTextContainer}>
                  <Text style={styles.featuredTitle}>Próxima clase: Yoga - 10:00</Text>
                  <Text style={styles.featuredSubtitle}>¡No olvides tu clase!</Text>
                </View>
              </View>
            </Card>

            {/* Catalog Title */}
            <Text style={styles.catalogTitle}>Catálogo de Clases y Turnos</Text>

            {/* Filters */}
            <View style={styles.filtersContainer}>
              {/* Location Picker */}
              <View style={styles.filterItem}>
                <Picker
                  selectedValue={selectedLocation}
                  onValueChange={setSelectedLocation}
                  style={styles.picker}
                >
                  {LOCATIONS.map((location) => (
                    <Picker.Item key={location} label={location} value={location} />
                  ))}
                </Picker>
              </View>

              {/* Discipline Picker */}
              <View style={styles.filterItem}>
                <Picker
                  selectedValue={selectedDiscipline}
                  onValueChange={setSelectedDiscipline}
                  style={styles.picker}
                >
                  {DISCIPLINES.map((discipline) => (
                    <Picker.Item key={discipline} label={discipline} value={discipline} />
                  ))}
                </Picker>
              </View>

              {/* Date Picker */}
              <View style={styles.filterItem}>
                <Picker
                  selectedValue={selectedDate}
                  onValueChange={setSelectedDate}
                  style={styles.picker}
                >
                  <Picker.Item label="Todas" value="Todas" />
                  <Picker.Item label="Hoy" value="Hoy" />
                  <Picker.Item label="Mañana" value="Mañana" />
                  <Picker.Item label="Esta semana" value="Semana" />
                </Picker>
              </View>
            </View>

            {/* Classes List Title */}
            <Text style={styles.classesListTitle}>Clases disponibles</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
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
    backgroundColor: COLORS.BEIGE,
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
    backgroundColor: COLORS.ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.ORANGE,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: COLORS.DARK,
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.DARK,
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
  quickButtonOrange: {
    backgroundColor: COLORS.ORANGE,
  },
  quickButtonDark: {
    backgroundColor: COLORS.DARK,
  },
  quickButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
  featuredCard: {
    backgroundColor: COLORS.WHITE,
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
    color: COLORS.ORANGE,
    marginBottom: 6,
    lineHeight: 22,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
  catalogTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.ORANGE,
    marginTop: 16,
    marginBottom: 16,
    lineHeight: 28,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-between',
    gap: 8,
  },
  filterItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
    borderRadius: 8,
    backgroundColor: COLORS.WHITE,
    height: 56,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    height: 56,
    color: COLORS.DARK,
    fontSize: 14,
  },
  classesListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.DARK,
    marginTop: 16,
    marginBottom: 12,
  },
  classCard: {
    marginBottom: 12,
    backgroundColor: COLORS.WHITE,
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
    color: COLORS.DARK,
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
    color: COLORS.WHITE,
  },
  cardContent: {
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginBottom: 2,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.GRAY,
    textAlign: 'center',
  },
});

export default HomeScreen;
