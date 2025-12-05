import * as LocalAuthentication from 'expo-local-authentication';
import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';

/**
 * BiometricManager
 *
 * Manages all biometric authentication logic using expo-local-authentication.
 * Provides methods to verify availability, request authentication and handle
 * the complete biometric flow in the application.
 */
class BiometricManager {
  /**
   * Verifies if the device has biometric hardware available
   * @returns {Promise<boolean>} true if device supports biometrics
   */
  async isBiometricAvailable() {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      return compatible;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifies if the device has at least one enrollment method configured
   * (FaceID, TouchID, fingerprint, PIN, pattern, etc.)
   *
   * IMPORTANT NOTE: This method has a known bug in expo-local-authentication
   * where it may return false even when the device DOES have enrollment.
   *
   * @returns {Promise<boolean>} true if there are enrolled authentication methods
   */
  async isEnrolled() {
    try {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return enrolled;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets the types of biometric authentication available on the device
   * @returns {Promise<Array>} Array of available types (FINGERPRINT, FACIAL_RECOGNITION, IRIS)
   */
  async getSupportedAuthenticationTypes() {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      return types;
    } catch (error) {
      return [];
    }
  }

  /**
   * Generates a descriptive message based on available authentication types
   * @param {Array} types - Array of authentication types
   * @returns {string} Descriptive message (e.g. "Face ID", "Huella digital", etc.)
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
   * Requests biometric authentication from the user
   *
   * @param {Object} options - Authentication options
   * @param {string} options.promptMessage - Message to show in prompt (default: "Autentícate para acceder a la aplicación")
   * @param {string} options.cancelLabel - Cancel button label (default: "Cancelar")
   * @param {boolean} options.disableDeviceFallback - Disable fallback to PIN/pattern (default: false)
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
        return {
          success: false,
          error: result.error || 'Autenticación cancelada o fallida'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error durante la autenticación'
      };
    }
  }

  /**
   * Opens device settings so the user can configure
   * an enrollment method (fingerprint, Face ID, PIN, etc.)
   *
   * Uses expo-linking to open the OS Settings app.
   */
  async openDeviceSettings() {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else if (Platform.OS === 'android') {
        //await Linking.sendIntent('android.settings.SECURITY_SETTINGS');
        await Linking.openURL('app-settings:');
      }
      return true;
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo abrir la configuración del dispositivo. Por favor, abre la configuración manualmente y configura un método de bloqueo.'
      );
      return false;
    }
  }

  /**
   * Shows a dialog alerting the user that they must configure an enrollment
   * method on their device, with option to go to Settings
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

  /**
   * WORKAROUND version - To use during isEnrolledAsync bug
   *
   * This method checks enrollment and, if it returns false, shows an
   * alert explaining the bug and allows to continue without authenticating.
   *
   * @returns {Promise<Object>} { success: true, workaround: true } always passes
   */
  async authenticateWithWorkaround() {
    try {

      const enrolled = await this.isEnrolled();


      if (!enrolled) {
        Alert.alert(
          'Workaround activo',
          `isEnrolledAsync() devolvió: ${enrolled}\n\nEste es el bug conocido de Expo. En producción, aquí se pediría autenticación o se redirigiría a Settings.\n\nPor ahora, te dejamos pasar sin autenticar.`,
          [
            {
              text: 'OK, entendido',
              onPress: () => {},
            },
          ]
        );

        return { success: true, workaround: true };
      }

      return await this.authenticate({
        promptMessage: 'Autentícate para acceder a la aplicación',
      });

    } catch (error) {
      return { success: true, workaround: true };
    }
  }

  /**
   * Complete biometric authentication flow with all validations
   *
   * This is the main method you should call from your app.
   * Handles the complete flow:
   * 1. Checks if hardware is available
   * 2. Checks if there is enrollment
   * 3. If no enrollment, offers to go to Settings
   * 4. If there is enrollment, requests authentication
   *
   * @returns {Promise<Object>} { success: boolean, reason?: string }
   */
  async authenticateBiometric() {
    try {
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

      const enrolled = await this.isEnrolled();

      if (!enrolled) {
        const userWantsToEnroll = await this.promptEnrollment();

        if (userWantsToEnroll) {
          return {
            success: false,
            reason: 'went_to_settings'
          };
        } else {
          return {
            success: false,
            reason: 'no_enrollment'
          };
        }
      }

      const authResult = await this.authenticate({
        promptMessage: 'Autentícate para acceder a la aplicación',
      });

      return authResult;

    } catch (error) {
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
