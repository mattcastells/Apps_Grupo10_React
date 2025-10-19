import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import { COLORS } from '../../utils/constants';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      await refreshUser();
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditUser');
  };

  const handleChangePhoto = () => {
    Alert.alert('Cambiar Foto', 'Funcionalidad de cambio de foto próximamente');
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert('Error', 'No se pudo cerrar sesión');
          }
        },
      },
    ]);
  };

  const getGenderLabel = (gender) => {
    switch (gender) {
      case 'MALE':
        return 'Masculino';
      case 'FEMALE':
        return 'Femenino';
      case 'OTHER':
        return 'Otro';
      default:
        return gender || 'N/A';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <Text style={styles.title}>Perfil</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Acá podés ver tu información personal.
        </Text>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {user?.photoUrl ? (
            <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </View>

        {/* Change Photo Button */}
        <Button
          title="Cambiar foto"
          onPress={handleChangePhoto}
          style={styles.changePhotoButton}
          textStyle={styles.changePhotoText}
        />

        {/* Information Fields */}
        <View style={styles.infoSection}>
          {/* Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Nombre</Text>
            <Text style={styles.fieldValue}>{user?.name || 'N/A'}</Text>
            <Text style={styles.fieldHint}>Este es tu nombre completo</Text>
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValue}>{user?.email || 'N/A'}</Text>
            <Text style={styles.fieldHint}>Tu correo electrónico registrado</Text>
          </View>

          {/* Age */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Edad</Text>
            <Text style={styles.fieldValue}>{user?.age?.toString() || 'N/A'}</Text>
            <Text style={styles.fieldHint}>Tu edad actual</Text>
          </View>

          {/* Gender */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Género</Text>
            <Text style={styles.fieldValue}>{getGenderLabel(user?.gender)}</Text>
            <Text style={styles.fieldHint}>Tu género identificado</Text>
          </View>
        </View>

        {/* Edit Information Button */}
        <Button
          title="Editar información"
          onPress={handleEditProfile}
          style={styles.editButton}
          textStyle={styles.editButtonText}
        />

        {/* Logout Button */}
        <Button
          title="Cerrar sesión"
          onPress={handleLogout}
          style={styles.logoutButton}
          textStyle={styles.logoutButtonText}
        />
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.DARK,
    textAlign: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: COLORS.ORANGE,
  },
  avatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.ORANGE,
  },
  avatarText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  changePhotoButton: {
    backgroundColor: COLORS.ORANGE,
    marginTop: 12,
  },
  changePhotoText: {
    fontSize: 17,
    color: COLORS.WHITE,
  },
  infoSection: {
    marginTop: 24,
  },
  fieldContainer: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.DARK,
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 18,
    color: COLORS.DARK,
    marginBottom: 4,
  },
  fieldHint: {
    fontSize: 13,
    color: COLORS.DARK,
    opacity: 0.7,
  },
  editButton: {
    backgroundColor: COLORS.HOLO_BLUE_DARK,
    marginTop: 16,
    marginBottom: 8,
  },
  editButtonText: {
    fontSize: 17,
    color: COLORS.WHITE,
  },
  logoutButton: {
    backgroundColor: COLORS.DARK,
    marginTop: 16,
  },
  logoutButtonText: {
    fontSize: 18,
    color: COLORS.WHITE,
  },
});

export default ProfileScreen;
