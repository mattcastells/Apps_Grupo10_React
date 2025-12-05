import React, { useState, useCallback, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import createHistoryService from '../../services/historyService';
import { useTheme } from '../../context/ThemeContext';
import { useAxios } from '../../hooks/useAxios';
import { AuthContext } from '../../context/AuthContext';
import { DISCIPLINES } from '../../utils/constants';
import BookingCard from '../../components/BookingCard';
import FilterSelector from '../../components/FilterSelector';
import NotificationBell from '../../components/NotificationBell';

const HistoryScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState('Todos');
  const [selectedDate, setSelectedDate] = useState('Todas');
  const axiosInstance = useAxios();
  const historyService = createHistoryService(axiosInstance);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await historyService.getMyHistory();
      setHistory(data);
    } catch (error) {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleHistoryItemPress = (item) => {
    navigation.navigate('HistoryDetail', { attendanceId: item.id });
  };

  // Opciones para los filtros
  const dateOptions = [
    { label: 'Todas', value: 'Todas' },
    { label: 'Última semana', value: 'Semana' },
    { label: 'Último mes', value: 'Mes' },
    { label: 'Últimos 3 meses', value: 'TresMeses' },
  ];

  const disciplineOptions = DISCIPLINES.map(d => ({ label: d, value: d }));

  const getFilteredHistory = () => {
    return history.filter((item) => {
      // Filtro por disciplina - mejorado
      const matchDiscipline = (() => {
        if (selectedDiscipline === 'Todos') return true;
        
        const itemDiscipline = item.className || item.discipline || item.name || '';
        
        // Comparar case-insensitive
        return itemDiscipline.toLowerCase().includes(selectedDiscipline.toLowerCase());
      })();

      // Filtro por fecha
      const matchDate = (() => {
        if (selectedDate === 'Todas') return true;

        if (!item.classDateTime && !item.attendanceDate) return false;

        const itemDate = new Date(item.classDateTime || item.attendanceDate);
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        if (selectedDate === 'Semana') {
          return itemDate >= weekAgo && itemDate <= today;
        } else if (selectedDate === 'Mes') {
          return itemDate >= monthAgo && itemDate <= today;
        } else if (selectedDate === 'TresMeses') {
          return itemDate >= threeMonthsAgo && itemDate <= today;
        }

        return true;
      })();

      return matchDiscipline && matchDate;
    });
  };

  const renderHistoryItem = ({ item }) => (
    <BookingCard 
      item={item} 
      onPress={handleHistoryItemPress}
    />
  );

  const filteredHistory = getFilteredHistory();


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <View style={[styles.contentContainer, { backgroundColor: theme.container, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
        <FlatList
          data={filteredHistory}
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
            </View>
          }
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {loading ? 'Cargando...' : 'No hay historial de asistencias'}
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
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
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

export default HistoryScreen;

