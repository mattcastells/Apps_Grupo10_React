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
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import EmailInputModal from '../../components/EmailInputModal';
import SessionManager from '../../utils/SessionManager';

const LoginScreen = ({ navigation }) => {
  const { login, logout, resendOtp } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const handleLogin = async () => {
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('El email es requerido');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('La contraseña es requerida');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      // Navigation to home handled by AppNavigator based on auth state
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigation.navigate('CreateUser');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleClearSession = () => {
    Alert.alert(
      'Limpiar sesión',
      '¿Estás seguro? Esto eliminará cualquier sesión activa corrupta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            try {
              await SessionManager.clear();
              await logout();
              setErrorMessage('');
              Alert.alert('Éxito', 'Sesión limpiada. Ahora podés iniciar sesión nuevamente.');
            } catch (error) {
              Alert.alert('Error', 'No se pudo limpiar la sesión');
            }
          },
        },
      ]
    );
  };

  const handleVerifyAccount = () => {
    setShowVerifyModal(true);
  };

  const handleVerifyModalSubmit = async (inputEmail) => {
    setShowVerifyModal(false);

    try {
      // Intentar enviar OTP usando el endpoint resend-otp
      await resendOtp(inputEmail);

      // Si tiene éxito, navegar a OTP screen
      navigation.navigate('Otp', { email: inputEmail });
      Alert.alert('Código enviado', 'Se ha enviado un código de verificación a tu email.');
    } catch (error) {
      // Si falla, mostrar error específico
      console.error('Error al enviar OTP desde verificar cuenta:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo enviar el código. Verifica que el email esté registrado.'
      );
    }
  };

  const handleVerifyModalClose = () => {
    setShowVerifyModal(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <View style={[styles.logoPlaceholder, { backgroundColor: theme.primary }]}>
                <Text style={styles.logoText}>RF</Text>
              </View>
            </View>

            <Text style={[styles.title, { color: theme.primary }]}>Iniciar Sesión</Text>

            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              inputStyle={styles.input}
              style={styles.inputContainer}
            />

            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Contraseña"
              secureTextEntry
              inputStyle={styles.input}
              style={styles.inputContainer}
            />

            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordButton}>
              <Text style={[styles.forgotPasswordText, { color: theme.textSecondary }]}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {errorMessage ? (
              <Text style={[styles.errorText, { color: theme.error }]}>{errorMessage}</Text>
            ) : null}

            <Button
              title="Iniciar Sesión"
              onPress={handleLogin}
              loading={loading}
              style={[styles.loginButton, { backgroundColor: '#0066CC' }]}
              textStyle={styles.buttonText}
            />

            <Button
              title="Registrarse"
              onPress={handleCreateAccount}
              style={[styles.registerButton, { backgroundColor: theme.primary }]}
              textStyle={styles.buttonText}
            />

            <TouchableOpacity onPress={handleVerifyAccount} style={styles.verifyAccountButton}>
              <Text style={[styles.verifyAccountText, { color: theme.textSecondary }]}>
                ¿Cuenta sin verificar? Verificar ahora
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleClearSession} style={styles.clearSessionButton}>
              <Text style={[styles.clearSessionText, { color: theme.textSecondary }]}>
                ¿Problemas para iniciar sesión? Limpiar sesión
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <EmailInputModal
        visible={showVerifyModal}
        onClose={handleVerifyModalClose}
        onSubmit={handleVerifyModalSubmit}
        title="Verificar cuenta"
        message="Ingresa el email de tu cuenta para recibir un nuevo código de verificación"
      />
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
  },
  content: {
    flex: 1,
    padding: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 32,
  },
  logoPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 12,
  },
  loginButton: {
    marginBottom: 18,
    minHeight: 48,
  },
  registerButton: {
    marginBottom: 18,
    minHeight: 48,
  },
  buttonText: {
    fontSize: 17,
    color: '#FFFFFF',
  },
  verifyAccountButton: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  verifyAccountText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  clearSessionButton: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  clearSessionText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
