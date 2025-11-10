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

        {/* QR Icon Placeholder */}
        <View style={styles.qrIconContainer}>
          <View style={styles.qrIcon}>
            <Text style={styles.qrIconText}>📱</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScanQR}
          disabled={scanning}
        >
          <Text style={styles.scanButtonText}>
            {scanning ? '🔍 Escaneando...' : '📷 Iniciar escaneo'}
          </Text>
        </TouchableOpacity>

        {checkInData && (
          <View style={styles.checkInCard}>
            <Text style={styles.checkInTitle}>✅ Datos del turno</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Clase:</Text>
              <Text style={styles.infoValue}>{checkInData.className}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Horario:</Text>
              <Text style={styles.infoValue}>{checkInData.schedule}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sede:</Text>
              <Text style={styles.infoValue}>{checkInData.location}</Text>
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmCheckIn}
            >
              <Text style={styles.confirmButtonText}>✓ Confirmar check-in</Text>
            </TouchableOpacity>
          </View>
        )}

        {!checkInData && !scanning && (
          <View style={styles.instructionCard}>
            <Text style={styles.instructionIcon}>ℹ️</Text>
            <Text style={styles.instructionText}>
              Apuntá la cámara hacia el código QR para registrar tu asistencia
            </Text>
          </View>
        )}

        {scanning && (
          <View style={styles.scanningCard}>
            <Text style={styles.scanningText}>🔄 Escaneando código QR...</Text>
          </View>
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
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.ORANGE,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.DARK,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  qrIconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrIcon: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.ORANGE,
    borderStyle: 'dashed',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  qrIconText: {
    fontSize: 60,
  },
  scanButton: {
    backgroundColor: COLORS.ORANGE,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  checkInCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  checkInTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.ORANGE,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.GRAY,
    width: 80,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.DARK,
    fontWeight: '500',
    flex: 1,
  },
  confirmButton: {
    backgroundColor: COLORS.ORANGE,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  instructionCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructionIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 16,
    color: COLORS.DARK,
    textAlign: 'center',
    lineHeight: 24,
  },
  scanningCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scanningText: {
    fontSize: 18,
    color: COLORS.ORANGE,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ScanQRScreen;
