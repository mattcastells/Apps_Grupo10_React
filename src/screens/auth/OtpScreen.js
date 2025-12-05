import React, { useState, useRef, useEffect } from 'react';
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
import Button from '../../components/Button';
import Input from '../../components/Input';
import { COLORS } from '../../utils/constants';

const OtpScreen = ({ navigation, route }) => {
  const { verifyEmail, resendOtp } = useAuth();
  const email = route.params?.email || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [verified, setVerified] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Rate limiting: track resend attempts
  const resendAttemptsRef = useRef([]);
  const countdownTimerRef = useRef(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  const checkRateLimits = () => {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    // Filter out old attempts
    resendAttemptsRef.current = resendAttemptsRef.current.filter(
      (timestamp) => timestamp > oneHourAgo
    );

    // Check limits
    const attemptsInLastMinute = resendAttemptsRef.current.filter(
      (timestamp) => timestamp > oneMinuteAgo
    ).length;

    const attemptsInLastHour = resendAttemptsRef.current.length;

    if (attemptsInLastMinute >= 1) {
      return { allowed: false, reason: 'Debes esperar 1 minuto antes de reenviar el código' };
    }

    if (attemptsInLastHour >= 5) {
      return { allowed: false, reason: 'Has alcanzado el límite de 5 reenvíos por hora' };
    }

    return { allowed: true };
  };

  const startCountdown = () => {
    setResendCountdown(60);
    setCanResend(false);

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    countdownTimerRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    const rateLimitCheck = checkRateLimits();

    if (!rateLimitCheck.allowed) {
      Alert.alert('Límite alcanzado', rateLimitCheck.reason);
      return;
    }

    setResendLoading(true);
    setErrorMessage('');

    try {
      await resendOtp(email);
      resendAttemptsRef.current.push(Date.now());
      startCountdown();
      Alert.alert('Código reenviado', 'Se ha enviado un nuevo código OTP a tu correo.');
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo reenviar el código. Intenta nuevamente.'
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerify = async () => {
    setErrorMessage('');

    if (!otp.trim()) {
      setErrorMessage('Ingresa el código OTP');
      return;
    }

    if (otp.trim().length !== 6) {
      setErrorMessage('El código debe tener 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(email, otp.trim());
      setVerified(true);
      setErrorMessage('');
      
      // Show success message and redirect to login
      Alert.alert(
        'Successful Verification',
        'Your account has been verified correctly. You can now log in with your email and password.',
        [
          {
            text: 'Ir a Login',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || 'Código OTP inválido. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
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
            <Text style={styles.title}>Verifica tu Email</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Ingresa el código de 6 dígitos de tu correo.
            </Text>

            {/* OTP Input */}
            <Input
              value={otp}
              onChangeText={setOtp}
              placeholder="Código OTP"
              keyboardType="numeric"
              maxLength={6}
              editable={!verified}
              inputStyle={styles.input}
              style={styles.inputContainer}
            />

            {/* Error Message */}
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            {/* Verify Button */}
            {!verified && (
              <Button
                title="VERIFICAR"
                onPress={handleVerify}
                loading={loading}
                style={styles.verifyButton}
                textStyle={styles.buttonText}
              />
            )}

            {/* Resend OTP Button */}
            {!verified && (
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={!canResend || resendLoading}
                style={styles.resendContainer}
              >
                <Text
                  style={[
                    styles.resendText,
                    (!canResend || resendLoading) && styles.resendTextDisabled,
                  ]}
                >
                  {resendLoading
                    ? 'Reenviando...'
                    : canResend
                    ? '¿No recibiste el código? Reenviar'
                    : `Reenviar en ${resendCountdown}s`}
                </Text>
              </TouchableOpacity>
            )}

            {/* Login Button (shown after verification) */}
            {verified && (
              <Button
                title="INGRESAR"
                onPress={handleLogin}
                style={styles.loginButton}
                textStyle={styles.loginButtonText}
              />
            )}
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
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.DARK,
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
    textAlign: 'center',
    letterSpacing: 8,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginBottom: 12,
  },
  verifyButton: {
    backgroundColor: COLORS.HOLO_BLUE_DARK,
    marginBottom: 18,
    minHeight: 48,
  },
  buttonText: {
    fontSize: 17,
    color: COLORS.WHITE,
  },
  loginButton: {
    backgroundColor: COLORS.ORANGE,
    marginBottom: 18,
    height: 56,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  resendContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.HOLO_BLUE_DARK,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendTextDisabled: {
    color: COLORS.GRAY,
    textDecorationLine: 'none',
  },
});

export default OtpScreen;
