import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button';
import Input from '../../components/Input';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
});

export default LoginScreen;
