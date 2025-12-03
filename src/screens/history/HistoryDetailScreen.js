import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import createHistoryService from '../../services/historyService';
import createRatingService from '../../services/ratingService';
import { formatDate } from '../../utils/helpers';
import { useAxios } from '../../hooks/useAxios';
import RatingModal from '../../components/RatingModal';

const HistoryDetailScreen = ({ route, navigation }) => {
  const { attendanceId } = route.params;
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const axiosInstance = useAxios();
  const historyService = createHistoryService(axiosInstance);
  const ratingService = createRatingService(axiosInstance);
  const { theme, isDarkMode } = useTheme();

  useEffect(() => {
    loadAttendanceDetail();
  }, [attendanceId]);

  const loadAttendanceDetail = async () => {
    setLoading(true);
    try {
      const data = await historyService.getAttendanceDetail(attendanceId);
      setAttendance(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el detalle', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const isToday = (someDate) => {
    const today = new Date();
    return (
      someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear()
    );
  };

  if (loading || !attendance) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const date = new Date(attendance.startDateTime);
  const formattedDate = formatDate(attendance.startDateTime);
  const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (i < rating ? '⭐' : '☆')).join(' ');
  };

  const canRate = () => {
    if (!attendance) return false;

    // Si ya tiene calificación, no puede calificar de nuevo
    if (attendance.userReview) return false;

    // Solo puede calificar si el estado es ATTENDED (asistió a la clase)
    if (attendance.status !== 'ATTENDED' && attendance.attendanceStatus !== 'ATTENDED') {
      return false;
    }

    // Calcular el tiempo de finalización de la clase
    const classStartTime = new Date(attendance.startDateTime);
    const classEndTime = new Date(classStartTime.getTime() + attendance.durationMinutes * 60000);

    // Calcular el límite de 24 horas después del final de la clase
    const ratingDeadline = new Date(classEndTime.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();

    // Solo puede calificar si la clase ya terminó y no pasaron más de 24 horas
    return now >= classEndTime && now <= ratingDeadline;
  };

  const handleSubmitRating = async (rating, comment) => {
    setSubmittingRating(true);
    try {
      await ratingService.createRating(attendanceId, rating, comment);
      setRatingModalVisible(false);
      
      // Recargar los datos para mostrar la nueva calificación
      await loadAttendanceDetail();
      
      Alert.alert('¡Gracias!', 'Tu calificación ha sido guardada exitosamente.');
    } catch (error) {
      console.error('Error submitting rating:', error);
      const errorMessage = error.response?.data?.message || error.message || 'No se pudo guardar la calificación';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.headerCard, { backgroundColor: theme.primary }]}>
          <Text style={[styles.disciplineTitle, { color: theme.textInverted }]}>{attendance.discipline}</Text>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerText, { color: theme.textInverted }]}>📍 {attendance.site}</Text>
            <Text style={[styles.headerText, { color: theme.textInverted }]}>📅 {formattedDate}</Text>
            <Text style={[styles.headerText, { color: theme.textInverted }]}>🕒 {formattedTime}</Text>
          </View>
        </View>

        {isToday(date) && (
          <View style={[styles.todayCard, { backgroundColor: theme.container, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
            <Text style={[styles.todayTitle, { color: theme.primary }]}>¡Recordatorio!</Text>
            <Text style={[styles.todayText, { color: theme.text }]}>💧 Mantente hidratado.</Text>
            <Text style={[styles.todayText, { color: theme.text }]}>🧘 Lleva tu toalla.</Text>
            <Text style={[styles.todayText, { color: theme.text }]}>👍 ¡Disfruta tu clase!</Text>
          </View>
        )}

        <View style={[styles.detailsCard, { backgroundColor: theme.card, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text, borderBottomColor: theme.divider }]}>Detalles de la Asistencia</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textLight }]}>Instructor</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{attendance.teacher}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textLight }]}>Duración</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{attendance.durationMinutes} min</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textLight }]}>Estado</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    attendance.attendanceStatus === 'ATTENDED'
                      ? theme.success
                      : attendance.attendanceStatus === 'ABSENT'
                      ? theme.error
                      : theme.textSecondary,
                },
              ]}
            >
              <Text style={[styles.statusText, { color: theme.textInverted }]}>
                {attendance.attendanceStatus === 'ATTENDED' ? 'Presente'
                  : attendance.attendanceStatus === 'ABSENT' ? 'Ausente'
                  : attendance.attendanceStatus === 'CANCELLED' ? 'Cancelada'
                  : attendance.attendanceStatus === 'CONFIRMED' ? 'Confirmada'
                  : 'Sin estado'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.reviewCard, { backgroundColor: theme.card, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text, borderBottomColor: theme.divider }]}>Tu Reseña</Text>
          {attendance.userReview ? (
            <>
              <Text style={[styles.starsText, { color: theme.primary }]}>{renderStars(attendance.userReview.rating)}</Text>
              {attendance.userReview.comment && (
                <Text style={[styles.commentText, { color: theme.text }]}>{attendance.userReview.comment}</Text>
              )}
            </>
          ) : (
            <>
              <Text style={[styles.noReviewText, { color: theme.textLight }]}>Aún no has dejado una reseña para esta clase.</Text>
              {canRate() && (
                <TouchableOpacity
                  style={[styles.rateButton, { backgroundColor: theme.primary }]}
                  onPress={() => setRatingModalVisible(true)}
                >
                  <Text style={[styles.rateButtonText, { color: theme.textInverted }]}>
                    Calificar Clase
                  </Text>
                </TouchableOpacity>
              )}
              {!canRate() && !attendance.userReview && (
                <Text style={[styles.expiredText, { color: theme.textLight }]}>
                  {attendance.status !== 'ATTENDED' && attendance.attendanceStatus !== 'ATTENDED'
                    ? 'Solo puedes calificar clases a las que asististe. Debes hacer check-in para poder calificar.'
                    : 'El plazo para calificar esta clase ha expirado (24 horas después del final de la clase).'}
                </Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
      
      <RatingModal
        visible={ratingModalVisible}
        onClose={() => setRatingModalVisible(false)}
        onSubmit={handleSubmitRating}
        loading={submittingRating}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  disciplineTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  todayCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  todayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  todayText: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailsCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontWeight: 'bold',
  },
  reviewCard: {
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  starsText: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 12,
  },
  commentText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  noReviewText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  rateButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  rateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  expiredText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 12,
  },
});

export default HistoryDetailScreen;
