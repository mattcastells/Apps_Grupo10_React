import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import biometricManager from '../utils/BiometricManager';
import { useAuth } from '../context/AuthContext';

/**
 * BiometricPrompt
 *
 * Componente que muestra un overlay bloqueante mientras se realiza
 * la autenticación biométrica. Este componente:
 *
 * 1. Se muestra automáticamente cuando el componente padre lo monta
 * 2. Solicita autenticación biométrica
 * 3. Maneja el resultado (éxito o fallo)
 * 4. Ejecuta callbacks según el resultado
 *
 * Props:
 * - onSuccess: callback cuando la autenticación es exitosa
 * - onFailure: callback cuando la autenticación falla (después de 2 intentos)
 * - onCancel: callback cuando el usuario cancela
 * - maxAttempts: número máximo de intentos (default: 2)
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
    // Iniciar autenticación automáticamente al montar
    startAuthentication();
  }, []);

  const startAuthentication = async () => {
    try {
      setIsAuthenticating(true);
      setMessage('Autenticando...');

      attemptCountRef.current += 1;
      const currentAttempt = attemptCountRef.current;

      // ============================================================================
      // 🐛 UBICACIÓN DEL WORKAROUND PARA BUG DE isEnrolledAsync
      // ============================================================================
      //
      // ⚠️ IMPORTANTE: Esta es la línea que debes cambiar para activar el workaround.
      //
      // VERSIÓN PRODUCCIÓN (actual - funciona si isEnrolledAsync está bien):
      const result = await biometricManager.authenticateBiometric();
      //
      // VERSIÓN WORKAROUND (para usar durante el bug de isEnrolledAsync):
      // const result = await biometricManager.authenticateWithWorkaround();
      //
      // El workaround mostrará un Alert con el valor de isEnrolledAsync y dejará
      // pasar al usuario sin autenticar, para que puedas testear el resto del flujo.
      //
      // Para activar el workaround:
      // 1. Comenta la línea de producción (la que está activa arriba)
      // 2. Descomenta la línea del workaround
      // 3. Guarda el archivo
      //
      // ============================================================================

      if (result.success) {
        // ✅ Autenticación exitosa
        setMessage('¡Autenticación exitosa!');
        markBiometricAuthenticated();

        // Pequeño delay para que el usuario vea el mensaje de éxito
        setTimeout(() => {
          setIsVisible(false);
          if (onSuccess) {
            onSuccess();
          }
        }, 500);

      } else {
        // ❌ Autenticación falló
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
      // Usuario fue a Settings, cerrar el modal y esperar que vuelva
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
      // No hay enrolamiento y el usuario no quiso ir a Settings
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
      // Dispositivo no soporta biometría
      setMessage('Este dispositivo no soporta autenticación biométrica.');
      setTimeout(() => {
        setIsVisible(false);
        if (onFailure) {
          onFailure(reason);
        }
      }, 2000);
      return;
    }

    // Autenticación cancelada o fallida
    if (currentAttempt < maxAttempts) {
      // Dar otro intento
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
      // Se agotaron los intentos
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
