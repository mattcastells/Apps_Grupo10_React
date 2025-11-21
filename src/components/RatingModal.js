import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import Button from './Button';

const RatingModal = ({ visible, onClose, onSubmit, loading = false }) => {
  const { theme, isDarkMode } = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleStarPress = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Error', 'Por favor, selecciona una calificación con estrellas');
      return;
    }

    onSubmit(rating, comment.trim() || null);
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleStarPress(star)}
            style={styles.starButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={40}
              color={star <= rating ? theme.primary : theme.textLight}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>
                Calificar Clase
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                ¿Cómo calificarías esta clase?
              </Text>

              {renderStars()}

              {rating > 0 && (
                <Text style={[styles.ratingText, { color: theme.text }]}>
                  {rating} {rating === 1 ? 'estrella' : 'estrellas'}
                </Text>
              )}

              <View style={styles.commentSection}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Comentario (opcional)
                </Text>
                <TextInput
                  style={[
                    styles.commentInput,
                    {
                      backgroundColor: theme.background,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholder="Escribe tu opinión sobre la clase..."
                  placeholderTextColor={theme.textLight}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={[styles.charCount, { color: theme.textLight }]}>
                  {comment.length}/500
                </Text>
              </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={handleClose}
                disabled={loading}
                style={styles.cancelButton}
              />
              <Button
                title="Enviar Calificación"
                onPress={handleSubmit}
                loading={loading}
                disabled={rating === 0 || loading}
                style={styles.submitButton}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  commentSection: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

export default RatingModal;


