import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Input from './Input';
import Button from './Button';
import { COLORS } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';

const EmailInputModal = ({ visible, onClose, onSubmit, title, message }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');

    if (!email.trim()) {
      setError('El email es requerido');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Email inválido');
      return;
    }

    onSubmit(email.trim());
    setEmail('');
    setError('');
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContainer}
          >
            <View style={[styles.modalContent, { backgroundColor: theme.card || COLORS.WHITE }]}>
              {/* Icon Circle */}
              <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
                <Text style={styles.iconText}>✉️</Text>
              </View>

              <Text style={[styles.title, { color: theme.primary }]}>{title}</Text>
              {message ? <Text style={[styles.message, { color: theme.text }]}>{message}</Text> : null}

              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="correo@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                inputStyle={styles.input}
                style={styles.inputContainer}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.buttonContainer}>
                <Button
                  title="Cancelar"
                  onPress={handleClose}
                  style={styles.cancelButton}
                  textStyle={styles.cancelButtonText}
                />
                <Button
                  title="Continuar"
                  onPress={handleSubmit}
                  style={[styles.submitButton, { backgroundColor: theme.primary }]}
                  textStyle={styles.submitButtonText}
                />
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '88%',
    maxWidth: 420,
  },
  modalContent: {
    borderRadius: 16,
    padding: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  inputContainer: {
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: COLORS.DARK,
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.GRAY,
    borderWidth: 1,
    minHeight: 50,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.ERROR,
    marginBottom: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    minHeight: 48,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
  },
  submitButtonText: {
    fontSize: 16,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
});

export default EmailInputModal;
