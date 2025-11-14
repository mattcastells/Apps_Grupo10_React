import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import createAuthService from '../../services/authService';
import { createApiClient } from '../../services/apiClient';
import Button from '../../components/Button';
import Input from '../../components/Input';

const ResetPasswordScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const apiClient = createApiClient();
  const authService = createAuthService(apiClient);

  const handleResetPassword = async () => {
    setErrorMessage('');
    if (!otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setErrorMessage('Todos los campos son requeridos.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email, otp.trim(), newPassword);
      Alert.alert(
        'Contraseña Actualizada',
        'Tu contraseña ha sido actualizada exitosamente. Por favor, inicia sesión.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.primary }]}>Crear Nueva Contraseña</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Ingresa el código que recibiste en {email} y tu nueva contraseña.
            </Text>

            <Input
              value={otp}
              onChangeText={setOtp}
              placeholder="Código OTP"
              keyboardType="numeric"
              inputStyle={styles.input}
              style={styles.inputContainer}
            />
            <Input
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Nueva Contraseña"
              secureTextEntry
              inputStyle={styles.input}
              style={styles.inputContainer}
            />
            <Input
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirmar Contraseña"
              secureTextEntry
              inputStyle={styles.input}
              style={styles.inputContainer}
            />

            {errorMessage ? (
              <Text style={[styles.errorText, { color: theme.error }]}>{errorMessage}</Text>
            ) : null}

            <Button
              title="Guardar Contraseña"
              onPress={handleResetPassword}
              loading={loading}
              style={[styles.button, { backgroundColor: theme.primary }]}
              textStyle={styles.buttonText}
            />
             <Button
              title="Volver al Login"
              onPress={() => navigation.navigate('Login')}
              style={[styles.button, { backgroundColor: theme.textSecondary }]}
              textStyle={styles.buttonText}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 18,
  },
  input: {
    fontSize: 18,
    minHeight: 48,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    marginBottom: 18,
    minHeight: 48,
  },
  buttonText: {
    fontSize: 17,
    color: '#FFFFFF',
  },
});

export default ResetPasswordScreen;
