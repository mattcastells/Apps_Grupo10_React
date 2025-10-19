import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { COLORS } from '../../utils/constants';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('El usuario o email es requerido');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('La contraseña es requerida');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      // Navigation handled by AppNavigator based on auth state
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Logo placeholder - 160x160 */}
            <View style={styles.logoContainer}>
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>RF</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Iniciar Sesión</Text>

            {/* Email Input */}
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Usuario o Email"
              keyboardType="email-address"
              inputStyle={styles.input}
              style={styles.inputContainer}
            />

            {/* Password Input */}
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Contraseña"
              secureTextEntry
              inputStyle={styles.input}
              style={styles.inputContainer}
            />

            {/* Error Message */}
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            {/* Login Button */}
            <Button
              title="Iniciar Sesión"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
              textStyle={styles.buttonText}
            />

            {/* Register Button */}
            <Button
              title="Registrarse"
              onPress={handleCreateAccount}
              style={styles.registerButton}
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
    backgroundColor: COLORS.BEIGE,
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
    backgroundColor: COLORS.ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.ORANGE,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 18,
  },
  input: {
    fontSize: 18,
    color: COLORS.DARK,
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.GRAY,
    borderWidth: 1,
    minHeight: 48,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: COLORS.HOLO_BLUE_DARK,
    marginBottom: 18,
    minHeight: 48,
  },
  registerButton: {
    backgroundColor: COLORS.ORANGE,
    marginBottom: 18,
    minHeight: 48,
  },
  buttonText: {
    fontSize: 17,
    color: COLORS.WHITE,
  },
});

export default LoginScreen;
