import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const NewsScreen = () => {
  const { theme } = useTheme();
  const [news, setNews] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    try {
      // Mock noticias - mismas que en la app Android (Reemplazar cuando tengamos el backend)
      const mockNews = [
        {
          id: '1',
          date: '2025-09-07',
          title: '¡Nueva clase de Zumba!',
          content: 'Sumate este viernes a las 19hs en el salón principal.',
          image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80' // Imagen de Zumba
        },
        {
          id: '2',
          date: '2025-09-05',
          title: 'Cierre por mantenimiento',
          content: 'El gimnasio permanecerá cerrado el lunes 15/9 por tareas de mantenimiento.',
          image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' // Imagen de gym
        },
        {
          id: '3',
          date: '2025-09-01',
          title: 'Promo amigos',
          content: 'Traé un amigo y ambos obtienen un 20% de descuento en la próxima cuota.',
          image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80' // Imagen de gym amigos
        }
      ];
      setNews(mockNews);
    } catch (error) {
      console.error('Error loading news:', error);
      Alert.alert('Error', 'No se pudieron cargar las noticias');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const renderNewsItem = ({ item }) => (
    <View style={[styles.newsCard, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }]}>
      <Image source={{ uri: item.image }} style={styles.newsImage} />
      <View style={[styles.cardDivider, { backgroundColor: theme.divider }]} />
      <View style={styles.newsContent}>
        <Text style={[styles.newsDate, { color: theme.textSecondary }]}>{item.date}</Text>
        <Text style={[styles.newsTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.newsText, { color: theme.text }]}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: theme.backgroundSecondary }]}>
        <Text style={[styles.title, { color: theme.primary }]}>Noticias</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>Mantente informado</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Últimas noticias y novedades del gimnasio
        </Text>
      </View>
      
      <View style={[styles.contentContainer, { backgroundColor: theme.container, borderWidth: 1, borderColor: theme.border }]}>
        <FlatList
          data={news}
          renderItem={renderNewsItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.text }]}>No hay noticias disponibles</Text>
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
    paddingTop: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
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
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  listContent: {
    padding: 16,
  },
  newsCard: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
  },
  cardDivider: {
    height: 1,
  },
  newsContent: {
    padding: 16,
  },
  newsDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  newsText: {
    fontSize: 14,
    lineHeight: 20,
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

export default NewsScreen;
