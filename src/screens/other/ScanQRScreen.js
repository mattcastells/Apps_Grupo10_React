import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '../../utils/constants';
import historyService from '../../services/historyService';

const ScanQRScreen = ({ navigation }) => {
  const [scanning, setScanning] = useState(false);
  const [checkInData, setCheckInData] = useState(null);

  const handleScanQR = async () => {
    setScanning(true);

    // Simular escaneo exitoso con datos mock
    setTimeout(() => {
      const mockQRData = {
        className: 'Yoga Matutino',
        schedule: '08:00 - 09:00',
        location: 'Sede Centro - Sala 3',
      };
      setCheckInData(mockQRData);
      setScanning(false);
    }, 1500);
  };

  const handleConfirmCheckIn = async () => {
    try {
      // Simulación de check-in exitoso
      Alert.alert('Check-in exitoso', 'Tu asistencia ha sido registrada correctamente', [
        {
          text: 'OK',
          onPress: () => {
            setCheckInData(null);
            navigation.navigate('History');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el check-in');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Escanear QR</Text>

        <Text style={styles.subtitle}>
          Usá el escáner para ingresar a tu clase registrando tu asistencia
        </Text>

        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScanQR}
          disabled={scanning}
        >
          <Text style={styles.scanButtonText}>
            {scanning ? 'Escaneando...' : 'Iniciar escaneo'}
          </Text>
        </TouchableOpacity>

        {checkInData && (
          <View style={styles.checkInCard}>
            <Text style={styles.checkInTitle}>Datos del turno</Text>
            <Text style={styles.checkInText}>Clase: {checkInData.className}</Text>
            <Text style={styles.checkInText}>Horario: {checkInData.schedule}</Text>
            <Text style={styles.checkInText}>Sede: {checkInData.location}</Text>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmCheckIn}
            >
              <Text style={styles.confirmButtonText}>Confirmar check-in</Text>
            </TouchableOpacity>
          </View>
        )}

        {!checkInData && !scanning && (
          <Text style={styles.resultText}>
            Apuntá la cámara hacia el código QR para registrar tu asistencia
          </Text>
        )}

        {scanning && (
          <Text style={styles.resultText}>Escaneando código QR...</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BEIGE,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.ORANGE,
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.DARK,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  scanButton: {
    backgroundColor: COLORS.ORANGE,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 32,
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  checkInCard: {
    backgroundColor: COLORS.LIGHTGRAY,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  checkInTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.ORANGE,
    marginBottom: 8,
  },
  checkInText: {
    fontSize: 17,
    color: COLORS.DARK,
    marginBottom: 4,
  },
  confirmButton: {
    backgroundColor: COLORS.ORANGE,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  resultText: {
    fontSize: 16,
    color: COLORS.DARK,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ScanQRScreen;
