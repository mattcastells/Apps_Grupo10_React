import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { formatDate } from '../utils/helpers';

/**
 * Componente unificado para mostrar cards de reservas tanto en "Mis Reservas" como en "Historial"
 * 
 * @param {Object} item - Objeto con la información de la reserva/asistencia
 * @param {string} item.className - Nombre de la clase
 * @param {string} item.classDateTime - Fecha y hora de la clase (ISO string)
 * @param {string} item.professor - Nombre del profesor
 * @param {string} item.location - Sede/ubicación de la clase
 * @param {string} item.status - Estado de la reserva (CONFIRMED, CANCELLED, EXPIRED) - opcional
 * @param {string} item.bookingId - ID de la reserva - opcional
 * @param {Function} onPress - Función a ejecutar al tocar la card (opcional)
 * @param {Function} onCancel - Función a ejecutar al cancelar (solo si tiene bookingId y status=CONFIRMED)
 */
const BookingCard = ({ item, onPress, onCancel }) => {
  const { theme, isDarkMode } = useTheme();

  const date = new Date(item.classDateTime || item.startDateTime);
  const formattedDate = formatDate(item.classDateTime || item.startDateTime);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const formattedTime = `${hours}:${minutes}`;

  const showCancelButton = item.bookingId && item.status === 'CONFIRMED' && onCancel;
  
  // Determinar el badge a mostrar según el estado
  const getStatusBadge = () => {
    if (!item.status) return null;
    
    switch (item.status) {
      case 'CONFIRMED':
        return { text: '✓ Confirmada', color: theme.success };
      case 'CANCELLED':
        return { text: '✗ Cancelada', color: theme.error };
      case 'EXPIRED':
        return { text: '◷ Expirada', color: theme.textSecondary };
      default:
        return null;
    }
  };

  const statusBadge = getStatusBadge();

  const CardContent = (
    <View style={[
      styles.bookingCard,
      { backgroundColor: theme.card, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }
    ]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.className, { color: theme.text }]}>
          {item.className || item.discipline}
        </Text>
        <Text style={[styles.timeText, { backgroundColor: theme.primary }]}>
          {formattedTime}
        </Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Profesor:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>
            {item.professor || item.teacher || 'No disponible'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Sede:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>
            {item.location || item.site || 'No disponible'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Fecha:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>
            {formattedDate}
          </Text>
        </View>
        {statusBadge && (
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
            <Text style={styles.statusText}>{statusBadge.text}</Text>
          </View>
        )}
      </View>

      {showCancelButton && (
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.error }]}
          onPress={() => onCancel(item.bookingId)}
        >
          <Text style={styles.cancelButtonText}>Cancelar Reserva</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Si hay onPress (para historial), envolver en TouchableOpacity
  if (onPress && !showCancelButton) {
    return (
      <TouchableOpacity onPress={() => onPress(item)}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  bookingCard: {
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
  },
  className: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  cardBody: {
    gap: 10,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 85,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cancelButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default BookingCard;
