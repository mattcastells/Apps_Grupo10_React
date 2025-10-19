import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Image,
} from 'react-native';
import { COLORS } from '../../utils/constants';
import { MOCK_NEWS } from '../../services/mockData';

const NewsScreen = () => {
  const [news, setNews] = useState(MOCK_NEWS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderNewsItem = ({ item }) => (
    <View style={styles.newsCard}>
      <Image source={{ uri: item.image }} style={styles.newsImage} />
      <View style={styles.newsContent}>
        <Text style={styles.newsDate}>{item.date}</Text>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsText}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={news}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <Text style={styles.title}>Noticias</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay noticias disponibles</Text>
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
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 28,
  },
  newsCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.LIGHTGRAY,
  },
  newsContent: {
    padding: 16,
  },
  newsDate: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginBottom: 4,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.DARK,
    marginTop: 4,
    marginBottom: 8,
  },
  newsText: {
    fontSize: 14,
    color: COLORS.DARK,
    lineHeight: 20,
    marginTop: 8,
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

export default NewsScreen;
