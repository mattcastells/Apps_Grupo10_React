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
import { useTheme } from '../../context/ThemeContext';
import scheduleService from '../../services/scheduleService';
import { formatDate, formatTime } from '../../utils/helpers';

const HomeScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
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
    <Card onPress={() => handleClassPress(item)} style={[styles.classCard, { backgroundColor: theme.card, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.className, { color: theme.text }]}>{item.name || item.discipline}</Text>
        <View style={[styles.badge, { backgroundColor: theme.primary }]}>
          <Text style={styles.badgeText}>{item.discipline}</Text>
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

  const filteredClasses = getFilteredClasses();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
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

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Accesos rápidos</Text>

            <View style={styles.quickAccessContainer}>
              <TouchableOpacity
                style={[styles.quickButton, { backgroundColor: theme.primary }]}
                onPress={handleReserveClass}
              >
                <Text style={styles.quickButtonText}>Reservar clase</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickButton, { backgroundColor: theme.card, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}
                onPress={handleMyProfile}
              >
                <Text style={[styles.quickButtonText, { color: theme.text }]}>Mi perfil</Text>
              </TouchableOpacity>
            </View>

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
              <View style={[styles.filterItem, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDarkMode ? 1 : 1 }]}>
                <Picker
                  selectedValue={selectedLocation}
                  onValueChange={setSelectedLocation}
                  style={[styles.picker, { color: isDarkMode ? COLORS.WHITE : theme.text }]}
                >
                  {LOCATIONS.map((location) => (
                    <Picker.Item key={location} label={location} value={location} />
                  ))}
                </Picker>
              </View>

              <View style={[styles.filterItem, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: isDarkMode ? 1 : 1 }]}>
                <Picker
                  selectedValue={selectedDiscipline}
                  onValueChange={setSelectedDiscipline}
                  style={[styles.picker, { color: isDarkMode ? COLORS.WHITE : theme.text }]}
                >
                  {DISCIPLINES.map((discipline) => (
                    <Picker.Item key={discipline} label={discipline} value={discipline} />
                  ))}
                </Picker>
              </View>

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
  },
  filterItem: {
    flex: 1,
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
