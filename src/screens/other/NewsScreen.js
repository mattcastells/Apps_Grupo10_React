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
import { useAxios } from '../../hooks/useAxios';
import createNewsService from '../../services/newsService';
import NotificationBell from '../../components/NotificationBell';
import NotificationDrawer from '../../components/NotificationDrawer';
import { useNavigation } from '@react-navigation/native';
import ProfileButton from '../../components/ProfileButton';

const NewsScreen = () => {
  const { theme } = useTheme();
  const [news, setNews] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  const axiosInstance = useAxios();
  const newsService = createNewsService(axiosInstance);
  const navigation = useNavigation();

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <ProfileButton />,
      headerLeft: () => (
        <NotificationBell 
          onPress={() => setShowNotificationDrawer(true)} 
          style={{ marginLeft: 10 }}
        />
      ),
    });
  }, [navigation]);



  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await newsService.getAllNews();
      setNews(data);
    } catch (error) {
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

  const renderNewsItem = ({ item }) => {
    return (
      <View style={[styles.newsCard, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }]}>
        {item.image ? (
          <Image
            key={item.id}
            source={{ uri: item.image }}
            style={styles.newsImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.newsImage, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#999' }}>Sin imagen</Text>
          </View>
        )}
        <View style={[styles.cardDivider, { backgroundColor: theme.divider }]} />
        <View style={styles.newsContent}>
          <Text style={[styles.newsTitle, { color: theme.text }]}>{item.title}</Text>
          <Text style={[styles.newsDate, { color: theme.textSecondary }]}>{item.date}</Text>
          <Text style={[styles.newsText, { color: theme.text }]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
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
