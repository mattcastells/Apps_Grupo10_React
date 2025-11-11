import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS } from '../../utils/constants';
import createHistoryService from '../../services/historyService';
import { formatDate } from '../../utils/helpers';
import { useAxios } from '../../hooks/useAxios';

const HistoryDetailScreen = ({ route, navigation }) => {
  const { attendanceId } = route.params;
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const axiosInstance = useAxios();
  const historyService = createHistoryService(axiosInstance);

  useEffect(() => {
    loadAttendanceDetail();
  }, [attendanceId]);

  const loadAttendanceDetail = async () => {
    setLoading(true);
    try {
      const data = await historyService.getAttendanceDetail(attendanceId);
      setAttendance(data);
    } catch (error) {
      console.error('Error loading attendance detail:', error);
      Alert.alert('Error', 'No se pudo cargar el detalle', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !attendance) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const date = new Date(attendance.startDateTime);
  const formattedDate = formatDate(attendance.startDateTime);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const formattedTime = `${hours}:${minutes}`;
  const endHour = date.getHours() + Math.floor(attendance.durationMinutes / 60);
  const endMinute = date.getMinutes() + (attendance.durationMinutes % 60);
  const formattedEndTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (i < rating ? '⭐' : '☆')).join(' ');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Detalle asistencia</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Class Info */}
        <Text style={styles.boldText}>Sede: {attendance.site}</Text>
        <Text style={styles.infoText}>Fecha: {formattedDate}</Text>
        <Text style={styles.infoText}>Hora: {formattedTime} - {formattedEndTime}</Text>
        <Text style={styles.infoText}>Duración: {attendance.durationMinutes} min</Text>

        <Text style={styles.boldText}>Disciplina: {attendance.discipline}</Text>
        <Text style={styles.infoText}>Instructor: {attendance.teacher}</Text>
        <Text style={styles.infoText}>
          Estado: {attendance.attendanceStatus === 'PRESENT' ? 'Presente' : 'Ausente'}
        </Text>

        {/* Review Section */}
        {attendance.userReview ? (
          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Tu reseña</Text>
            <View style={styles.starsContainer}>
              <Text style={styles.starsText}>{renderStars(attendance.userReview.rating)}</Text>
            </View>
            <Text style={styles.commentText}>{attendance.userReview.comment}</Text>
          </View>
        ) : (
          <View style={styles.reviewSection}>
            <Text style={styles.noReviewText}>
              No realizaste comentarios sobre esta clase
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BEIGE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.DARK,
  },
  banner: {
    backgroundColor: COLORS.ORANGE,
    padding: 16,
  },
  bannerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 80,
  },
  boldText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.DARK,
    marginTop: 8,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.DARK,
    marginTop: 8,
  },
  reviewSection: {
    marginTop: 16,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.DARK,
    marginTop: 16,
  },
  starsContainer: {
    marginTop: 8,
  },
  starsText: {
    fontSize: 24,
    letterSpacing: 4,
  },
  commentText: {
    fontSize: 16,
    color: COLORS.DARK,
    marginTop: 8,
    lineHeight: 24,
  },
  noReviewText: {
    fontSize: 16,
    color: COLORS.DARK,
    fontStyle: 'italic',
  },
});

export default HistoryDetailScreen;
