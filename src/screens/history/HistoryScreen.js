import React, { useState, useCallback, useContext } from 'react';
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
import BookingCard from '../../components/BookingCard';

const HistoryScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  const renderHistoryItem = ({ item }) => (
    <BookingCard 
      item={item} 
      onPress={handleHistoryItemPress}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: theme.backgroundSecondary }]}>
        <Text style={[styles.title, { color: theme.primary }]}>Mi Historial</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>Último mes</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Tus clases asistidas en los últimos 30 días
        </Text>
      </View>
      <View style={[styles.contentContainer, { backgroundColor: theme.container, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
        <FlatList
          data={history}
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

export default HistoryScreen;
