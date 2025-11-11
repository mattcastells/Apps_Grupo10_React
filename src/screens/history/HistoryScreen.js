import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
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
        <View style={styles.cardHeader}>
          <Text style={styles.disciplineText}>{item.discipline}</Text>
          <Text style={styles.timeText}>{formattedTime}</Text>
        </View>
        <View style={styles.cardDivider} />
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Profesor:</Text>
            <Text style={styles.infoValue}>{item.teacher}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sede:</Text>
            <Text style={styles.infoValue}>{item.site}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha:</Text>
            <Text style={styles.infoValue}>{formattedDate}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Historial</Text>
        <Text style={styles.subtitle}>Último mes</Text>
        <Text style={styles.description}>
          Tus clases asistidas en los últimos 30 días
        </Text>
      </View>
      <View style={styles.contentContainer}>
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
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
    backgroundColor: COLORS.BEIGE,
  },
  header: {
    backgroundColor: COLORS.BEIGE,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.ORANGE,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.DARK,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: COLORS.GRAY,
    lineHeight: 20,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  historyCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHTGRAY,
  },
  disciplineText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.DARK,
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.WHITE,
    backgroundColor: COLORS.ORANGE,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.LIGHTGRAY,
    marginBottom: 12,
  },
  cardBody: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.GRAY,
    width: 85,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.DARK,
    flex: 1,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.GRAY,
    textAlign: 'center',
  },
});

export default HistoryScreen;
