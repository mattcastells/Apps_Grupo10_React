import * as LocalAuthentication from 'expo-local-authentication';
import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';

/**
 * BiometricManager
 *
 * Gestiona toda la lógica de autenticación biométrica usando expo-local-authentication.
 * Proporciona métodos para verificar disponibilidad, solicitar autenticación y manejar
 * el flujo completo de biometría en la aplicación.
 */
class BiometricManager {
  /**
   * Verifica si el dispositivo tiene hardware biométrico disponible
   * @returns {Promise<boolean>} true si el dispositivo soporta biometría
   */
  async isBiometricAvailable() {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      return compatible;
    } catch (error) {
      console.error('[BiometricManager] Error checking hardware:', error);
      return false;
    }
  }

  /**
   * Verifica si el dispositivo tiene al menos un método de enrolamiento configurado
   * (FaceID, TouchID, huella, PIN, patrón, etc.)
   *
   * NOTA IMPORTANTE: Este método tiene un bug conocido en expo-local-authentication
   * donde puede devolver false incluso cuando el dispositivo SÍ tiene enrolamiento.
   *
   * @returns {Promise<boolean>} true si hay métodos de autenticación enrolados
   */
  async isEnrolled() {
    try {
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      // 🔍 DEBUG: Descomentar para ver el valor real que devuelve
      // console.log('[BiometricManager] isEnrolledAsync returned:', enrolled);

      return enrolled;
    } catch (error) {
      console.error('[BiometricManager] Error checking enrollment:', error);
      return false;
    }
  }

  /**
   * Obtiene los tipos de autenticación biométrica disponibles en el dispositivo
   * @returns {Promise<Array>} Array de tipos disponibles (FINGERPRINT, FACIAL_RECOGNITION, IRIS)
   */
  async getSupportedAuthenticationTypes() {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      return types;
    } catch (error) {
      console.error('[BiometricManager] Error getting auth types:', error);
      return [];
    }
  }

  /**
   * Genera un mensaje descriptivo basado en los tipos de autenticación disponibles
   * @param {Array} types - Array de tipos de autenticación
   * @returns {string} Mensaje descriptivo (ej: "Face ID", "Huella digital", etc.)
   */
  getAuthenticationTypeMessage(types) {
    if (!types || types.length === 0) {
      return 'autenticación biométrica';
    }

    const typeMessages = {
      [LocalAuthentication.AuthenticationType.FINGERPRINT]: 'huella digital',
      [LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION]: 'Face ID',
      [LocalAuthentication.AuthenticationType.IRIS]: 'reconocimiento de iris',
    };

    const messages = types
      .map(type => typeMessages[type])
      .filter(Boolean);

    if (messages.length === 0) {
      return 'autenticación biométrica';
    }

    if (messages.length === 1) {
      return messages[0];
    }

    return messages.slice(0, -1).join(', ') + ' o ' + messages[messages.length - 1];
  }

  /**
   * Solicita autenticación biométrica al usuario
   *
   * @param {Object} options - Opciones de autenticación
   * @param {string} options.promptMessage - Mensaje a mostrar en el prompt (default: "Autentícate para acceder a la aplicación")
   * @param {string} options.cancelLabel - Etiqueta del botón cancelar (default: "Cancelar")
   * @param {boolean} options.disableDeviceFallback - Deshabilitar fallback a PIN/patrón (default: false)
   * @returns {Promise<Object>} { success: boolean, error?: string }
   */
  async authenticate(options = {}) {
    try {
      const {
        promptMessage = 'Autentícate para acceder a la aplicación',
        cancelLabel = 'Cancelar',
        disableDeviceFallback = false,
      } = options;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel,
        disableDeviceFallback,
        fallbackLabel: 'Usar contraseña',
      });

      if (result.success) {
        return { success: true };
      } else {
        // El usuario canceló o falló la autenticación
        return {
          success: false,
          error: result.error || 'Autenticación cancelada o fallida'
        };
      }
    } catch (error) {
      console.error('[BiometricManager] Authentication error:', error);
      return {
        success: false,
        error: error.message || 'Error durante la autenticación'
      };
    }
  }

  /**
   * Abre la configuración del dispositivo para que el usuario configure
   * un método de enrolamiento (huella, Face ID, PIN, etc.)
   *
   * Usa expo-linking para abrir la app de Settings del sistema operativo.
   */
  async openDeviceSettings() {
    try {
      if (Platform.OS === 'ios') {
        // En iOS, abre la configuración general
        await Linking.openURL('app-settings:');
      } else if (Platform.OS === 'android') {
        // En Android, intenta abrir la configuración de seguridad
        await Linking.openURL('app-settings:');
      }
      return true;
    } catch (error) {
      console.error('[BiometricManager] Error opening settings:', error);
      Alert.alert(
        'Error',
        'No se pudo abrir la configuración del dispositivo. Por favor, abre la configuración manualmente y configura un método de bloqueo.'
      );
      return false;
    }
  }

  /**
   * Muestra un diálogo alertando al usuario que debe configurar un método
   * de enrolamiento en su dispositivo, con opción de ir a Settings
   */
  async promptEnrollment() {
    return new Promise((resolve) => {
      Alert.alert(
        'Configuración de seguridad requerida',
        'Tu dispositivo no tiene configurado ningún método de bloqueo (huella, Face ID, PIN, patrón, etc.).\n\n¿Deseas ir a la configuración para configurarlo ahora?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Ir a configuración',
            onPress: async () => {
              const opened = await this.openDeviceSettings();
              resolve(opened);
            },
          },
        ]
      );
    });
  }

  // ============================================================================
  // 🐛 WORKAROUND PARA BUG DE isEnrolledAsync
  // ============================================================================
  //
  // UBICACIÓN: BiometricManager.js - Método authenticateWithWorkaround()
  //
  // Este método es una versión alternativa que puedes usar mientras el bug de
  // isEnrolledAsync no esté resuelto. Simplemente muestra un alert con el
  // valor que devuelve isEnrolledAsync y permite continuar sin autenticar.
  //
  // PARA USAR ESTE WORKAROUND:
  // 1. En HomeScreen.js, reemplaza la llamada a authenticateBiometric()
  //    por authenticateWithWorkaround()
  // 2. Esto mostrará un alert indicando el bug y dejará pasar al usuario
  //
  // CÓDIGO A CAMBIAR EN HomeScreen.js:
  // ❌ CÓDIGO ACTUAL (producción):
  //    const result = await biometricManager.authenticateBiometric();
  //
  // ✅ CÓDIGO CON WORKAROUND (para testing):
  //    const result = await biometricManager.authenticateWithWorkaround();
  //
  // ============================================================================

  /**
   * 🐛 VERSIÓN WORKAROUND - Para usar durante el bug de isEnrolledAsync
   *
   * Este método verifica el enrolamiento y, si devuelve false, muestra un
   * alert explicando el bug y permite continuar sin autenticar.
   *
   * @returns {Promise<Object>} { success: true, workaround: true } siempre pasa
   */
  async authenticateWithWorkaround() {
    try {
      console.log('[BiometricManager] 🐛 USANDO WORKAROUND PARA BUG DE isEnrolledAsync');

      const enrolled = await this.isEnrolled();

      console.log(`[BiometricManager] isEnrolledAsync devolvió: ${enrolled}`);

      if (!enrolled) {
        // Mostrar alert explicando el bug
        Alert.alert(
          '🐛 Workaround activo',
          `isEnrolledAsync() devolvió: ${enrolled}\n\nEste es el bug conocido de Expo. En producción, aquí se pediría autenticación o se redirigiría a Settings.\n\nPor ahora, te dejamos pasar sin autenticar.`,
          [
            {
              text: 'OK, entendido',
              onPress: () => console.log('[BiometricManager] Usuario pasó con workaround'),
            },
          ]
        );

        // Dejar pasar al usuario sin autenticar
        return { success: true, workaround: true };
      }

      // Si enrolled es true, proceder con autenticación normal
      return await this.authenticate({
        promptMessage: 'Autentícate para acceder a la aplicación',
      });

    } catch (error) {
      console.error('[BiometricManager] Error en workaround:', error);
      // En caso de error, también dejar pasar
      return { success: true, workaround: true };
    }
  }

  /**
   * Flujo completo de autenticación biométrica con todas las validaciones
   *
   * Este es el método principal que debes llamar desde tu app.
   * Maneja todo el flujo:
   * 1. Verifica si hay hardware disponible
   * 2. Verifica si hay enrolamiento
   * 3. Si no hay enrolamiento, ofrece ir a Settings
   * 4. Si hay enrolamiento, solicita autenticación
   *
   * @returns {Promise<Object>} { success: boolean, reason?: string }
   */
  async authenticateBiometric() {
    try {
      // 1. Verificar si el dispositivo tiene hardware biométrico
      const hasHardware = await this.isBiometricAvailable();

      if (!hasHardware) {
        Alert.alert(
          'Biometría no disponible',
          'Tu dispositivo no soporta autenticación biométrica.'
        );
        return {
          success: false,
          reason: 'no_hardware'
        };
      }

      // 2. Verificar si hay métodos de enrolamiento configurados
      const enrolled = await this.isEnrolled();

      if (!enrolled) {
        // No hay enrolamiento, ofrecer ir a Settings
        const userWantsToEnroll = await this.promptEnrollment();

        if (userWantsToEnroll) {
          // Usuario fue a Settings, retornar false para que vuelva a intentar después
          return {
            success: false,
            reason: 'went_to_settings'
          };
        } else {
          // Usuario canceló, no puede continuar
          return {
            success: false,
            reason: 'no_enrollment'
          };
        }
      }

      // 3. Hay hardware y hay enrolamiento, solicitar autenticación
      const authResult = await this.authenticate({
        promptMessage: 'Autentícate para acceder a la aplicación',
      });

      return authResult;

    } catch (error) {
      console.error('[BiometricManager] Error en flujo biométrico:', error);
      return {
        success: false,
        reason: 'error',
        error: error.message
      };
    }
  }
}

// Exportar instancia singleton
const biometricManager = new BiometricManager();
export default biometricManager;
