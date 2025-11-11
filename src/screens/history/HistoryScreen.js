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
import historyService from '../../services/historyService';
import { formatDate } from '../../utils/helpers';

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await historyService.getMyHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Error', 'No se pudo cargar el historial.');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleHistoryItemPress = (item) => {
    navigation.navigate('HistoryDetail', { attendanceId: item.id });
  };

  const renderHistoryItem = ({ item }) => {
    const date = new Date(item.startDateTime);
    const formattedDate = formatDate(item.startDateTime);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;

    return (
      <TouchableOpacity
        style={styles.historyCard}
        onPress={() => handleHistoryItemPress(item)}
      >
        <Text style={styles.disciplineText}>{item.discipline}</Text>
        <Text style={styles.infoText}>Profesor: {item.teacher}</Text>
        <Text style={styles.infoText}>Sede: {item.site}</Text>
        <Text style={styles.infoText}>
          {formattedDate} - {formattedTime}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Mi Historial</Text>
            <Text style={styles.subtitle}>Historial de asistencias</Text>
            <Text style={styles.sectionTitle}>Último mes</Text>
            <Text style={styles.sectionSubtitle}>
              Estas son tus clases asistidas en los últimos 30 días.
            </Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Cargando...' : 'No hay historial de asistencias'}
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.DARK,
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.DARK,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.DARK,
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disciplineText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.DARK,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.DARK,
    marginBottom: 4,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.DARK,
    textAlign: 'center',
  },
});

export default HistoryScreen;
