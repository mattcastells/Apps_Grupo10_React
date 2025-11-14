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

const ForgotPasswordScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const apiClient = createApiClient();
  const authService = createAuthService(apiClient);

  const handleRequestReset = async () => {
    setErrorMessage('');
    if (!email.trim()) {
      setErrorMessage('Por favor, ingresa tu email.');
      return;
    }

    setLoading(true);
    try {
      await authService.requestPasswordReset(email.trim());
      Alert.alert(
        'Código Enviado',
        'Se ha enviado un código de reseteo a tu correo electrónico.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ResetPassword', { email: email.trim() }),
          },
        ]
      );
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'No se pudo procesar la solicitud.');
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
            <Text style={[styles.title, { color: theme.primary }]}>Recuperar Contraseña</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Ingresa tu email para recibir un código de recuperación.
            </Text>

            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              inputStyle={styles.input}
              style={styles.inputContainer}
            />

            {errorMessage ? (
              <Text style={[styles.errorText, { color: theme.error }]}>{errorMessage}</Text>
            ) : null}

            <Button
              title="Enviar Código"
              onPress={handleRequestReset}
              loading={loading}
              style={[styles.button, { backgroundColor: theme.primary }]}
              textStyle={styles.buttonText}
            />
            <Button
              title="Volver al Login"
              onPress={() => navigation.goBack()}
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

export default ForgotPasswordScreen;
