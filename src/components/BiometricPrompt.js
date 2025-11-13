import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import biometricManager from '../utils/BiometricManager';
import { useAuth } from '../context/AuthContext';

/**
 * BiometricPrompt
 *
 * Component that shows a blocking overlay during biometric authentication.
 * This component:
 *
 * 1. Automatically shows when the parent component mounts it
 * 2. Requests biometric authentication
 * 3. Handles the result (success or failure)
 * 4. Executes callbacks based on the result
 *
 * Props:
 * - onSuccess: callback when authentication is successful
 * - onFailure: callback when authentication fails (after 2 attempts)
 * - onCancel: callback when user cancels
 * - maxAttempts: maximum number of attempts (default: 2)
 */
const BiometricPrompt = ({
  onSuccess,
  onFailure,
  onCancel,
  maxAttempts = 2,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [message, setMessage] = useState('Preparando autenticación...');
  const attemptCountRef = useRef(0);
  const { markBiometricAuthenticated } = useAuth();

  useEffect(() => {
    startAuthentication();
  }, []);

  const startAuthentication = async () => {
    try {
      setIsAuthenticating(true);
      setMessage('Autenticando...');

      attemptCountRef.current += 1;
      const currentAttempt = attemptCountRef.current;

      const result = await biometricManager.authenticateBiometric();

      if (result.success) {
        setMessage('¡Autenticación exitosa!');
        markBiometricAuthenticated();

        setTimeout(() => {
          setIsVisible(false);
          if (onSuccess) {
            onSuccess();
          }
        }, 500);

      } else {
        handleAuthenticationFailure(result, currentAttempt);
      }

    } catch (error) {
      console.error('[BiometricPrompt] Error en autenticación:', error);
      setMessage('Error al autenticar');
      handleAuthenticationFailure({ reason: 'error', error: error.message }, attemptCountRef.current);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleAuthenticationFailure = (result, currentAttempt) => {
    const { reason } = result;

    if (reason === 'went_to_settings') {
      setMessage('Por favor configura tu método de seguridad y vuelve a abrir la app.');
      setTimeout(() => {
        setIsVisible(false);
        if (onCancel) {
          onCancel();
        }
      }, 2000);
      return;
    }

    if (reason === 'no_enrollment') {
      setMessage('Se requiere configurar un método de seguridad en el dispositivo.');
      setTimeout(() => {
        setIsVisible(false);
        if (onFailure) {
          onFailure(reason);
        }
      }, 2000);
      return;
    }

    if (reason === 'no_hardware') {
      setMessage('Este dispositivo no soporta autenticación biométrica.');
      setTimeout(() => {
        setIsVisible(false);
        if (onFailure) {
          onFailure(reason);
        }
      }, 2000);
      return;
    }

    if (currentAttempt < maxAttempts) {
      Alert.alert(
        'Autenticación fallida',
        `Intento ${currentAttempt} de ${maxAttempts} falló. ¿Deseas intentar nuevamente?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => {
              setIsVisible(false);
              if (onCancel) {
                onCancel();
              }
            },
          },
          {
            text: 'Reintentar',
            onPress: () => startAuthentication(),
          },
        ]
      );
    } else {
      Alert.alert(
        'Autenticación fallida',
        'Has excedido el número máximo de intentos. Serás redirigido al login.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsVisible(false);
              if (onFailure) {
                onFailure('max_attempts_exceeded');
              }
            },
          },
        ]
      );
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {isAuthenticating ? (
              <ActivityIndicator size="large" color="#F26A3E" />
            ) : (
              <Text style={styles.lockIcon}>🔒</Text>
            )}
          </View>

          <Text style={styles.title}>Autenticación requerida</Text>
          <Text style={styles.message}>{message}</Text>

          {attemptCountRef.current > 0 && (
            <Text style={styles.attemptText}>
              Intento {attemptCountRef.current} de {maxAttempts}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 24,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#232323',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  attemptText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default BiometricPrompt;
