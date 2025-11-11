import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { COLORS } from '../../utils/constants';
import { useTheme } from '../../context/ThemeContext';
import historyService from '../../services/historyService';

const ScanQRScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [checkInData, setCheckInData] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleScanQR = async () => {
    if (hasPermission === null) {
      Alert.alert('Esperando permisos', 'Por favor espera mientras se verifican los permisos de la cámara');
      return;
    }
    
    if (hasPermission === false) {
      Alert.alert(
        'Permiso denegado',
        'Necesitamos acceso a la cámara para escanear el código QR. Por favor habilita los permisos en la configuración de tu dispositivo.',
        [{ text: 'OK' }]
      );
      return;
    }

    setShowCamera(true);
    setScanned(false);
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return;
    
    setScanned(true);
    setShowCamera(false);
    
    try {
      // Parse QR code data (expecting JSON with bookingId or classId)
      const qrData = JSON.parse(data);
      
      // TODO: Call backend check-in API
      // const response = await bookingService.checkIn(qrData.bookingId);
      // setCheckInData(response);
      
      // For now, show the scanned data
      setCheckInData({
        className: qrData.className || 'Clase',
        schedule: qrData.schedule || 'Horario no disponible',
        location: qrData.location || 'Ubicación no disponible',
      });
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert('Error', 'No se pudo procesar el código QR');
      setScanned(false);
    }
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
    setScanned(false);
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.primary }]}>Escanear QR</Text>

        <Text style={[styles.subtitle, { color: theme.text }]}>
          Usá el escáner para ingresar a tu clase registrando tu asistencia
        </Text>

        {/* QR Icon Placeholder */}
        <View style={styles.qrIconContainer}>
          <View style={[styles.qrIcon, { backgroundColor: theme.card, borderColor: theme.primary }]}>
            <Text style={styles.qrIconText}>📱</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.scanButton, { backgroundColor: theme.primary }]}
          onPress={handleScanQR}
          disabled={scanning}
        >
          <Text style={styles.scanButtonText}>
             Iniciar escaneo
          </Text>
        </TouchableOpacity>

        {checkInData && (
          <View style={[styles.checkInCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.checkInTitle, { color: theme.primary }]}>✅ Datos del turno</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Clase:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{checkInData.className}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Horario:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{checkInData.schedule}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sede:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{checkInData.location}</Text>
            </View>

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: theme.primary }]}
              onPress={handleConfirmCheckIn}
            >
              <Text style={styles.confirmButtonText}>✓ Confirmar check-in</Text>
            </TouchableOpacity>
          </View>
        )}

        {!checkInData && (
          <View style={[styles.instructionCard, { backgroundColor: theme.card }]}>
            <Text style={styles.instructionIcon}>ℹ️</Text>
            <Text style={[styles.instructionText, { color: theme.text }]}>
              Apuntá la cámara hacia el código QR para registrar tu asistencia
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Camera Modal */}
      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={handleCloseCamera}
      >
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseCamera}
                >
                  <Text style={styles.closeButtonText}>✕ Cerrar</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.scanArea}>
                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
                <Text style={styles.scanInstruction}>
                  Posicioná el código QR dentro del marco
                </Text>
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
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
    fontWeight: '500',
    flex: 1,
  },
  confirmButton: {
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
    textAlign: 'center',
    lineHeight: 24,
  },
  scanningCard: {
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
    fontWeight: '600',
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: COLORS.DARK,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  closeButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: COLORS.ORANGE,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanInstruction: {
    color: COLORS.WHITE,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
});

export default ScanQRScreen;
