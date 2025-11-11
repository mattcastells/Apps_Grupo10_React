import React, { useState, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        if (loading) return;

        console.log('ProfileScreen focused. Reloading user data...');
        setLoading(true);
        try {
          await refreshUser();
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [refreshUser])
  );

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
        <Text style={styles.title}>Mi Perfil</Text>

        {/* Avatar Card */}
        <View style={styles.avatarCard}>
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
          
          <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@ejemplo.com'}</Text>

          {/* Change Photo Button */}
          <Button
            title="Cambiar foto de perfil"
            onPress={handleChangePhoto}
            style={styles.changePhotoButton}
            textStyle={styles.changePhotoText}
          />
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Información Personal</Text>

        {/* Information Fields */}
        <View style={styles.infoSection}>
          {/* Name */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldIcon}>👤</Text>
              <View style={styles.fieldTextContainer}>
                <Text style={styles.fieldLabel}>Nombre completo</Text>
                <Text style={styles.fieldValue}>{user?.name || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldIcon}>📧</Text>
              <View style={styles.fieldTextContainer}>
                <Text style={styles.fieldLabel}>Correo electrónico</Text>
                <Text style={styles.fieldValue}>{user?.email || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* Age and Gender Row */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldCardHalf}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldIcon}>🎂</Text>
                <View style={styles.fieldTextContainer}>
                  <Text style={styles.fieldLabel}>Edad</Text>
                  <Text style={styles.fieldValue}>{user?.age?.toString() || 'N/A'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.fieldCardHalf}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldIcon}>⚧</Text>
                <View style={styles.fieldTextContainer}>
                  <Text style={styles.fieldLabel}>Género</Text>
                  <Text style={styles.fieldValue}>{getGenderLabel(user?.gender)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Edit Information Button */}
        <Button
          title="✏️ Editar información"
          onPress={handleEditProfile}
          style={styles.editButton}
          textStyle={styles.editButtonText}
        />

        {/* Logout Button */}
        <Button
          title="🚪 Cerrar sesión"
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
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.ORANGE,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  avatarCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.ORANGE,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.DARK,
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 15,
    color: COLORS.GRAY,
    marginBottom: 16,
    textAlign: 'center',
  },
  changePhotoButton: {
    backgroundColor: COLORS.ORANGE,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 8,
  },
  changePhotoText: {
    fontSize: 15,
    color: COLORS.WHITE,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.DARK,
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  fieldCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  fieldCardHalf: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  fieldTextContainer: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.GRAY,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.DARK,
  },
  editButton: {
    backgroundColor: COLORS.ORANGE,
    marginBottom: 12,
  },
  editButtonText: {
    fontSize: 17,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: COLORS.GRAY,
    marginBottom: 24,
  },
  logoutButtonText: {
    fontSize: 17,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
});

export default ProfileScreen;
