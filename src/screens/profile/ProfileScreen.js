import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button';
import { useFocusEffect } from '@react-navigation/native';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, refreshUser } = useAuth();
  const { isDarkMode, toggleTheme, theme } = useTheme();
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
    Alert.alert('Cerrar Sesión', '¿Estás seguro que querés cerrar sesión?', [
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.primary }]}>Mi Perfil</Text>

        <View style={[styles.avatarCard, { backgroundColor: theme.card, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
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
          
          <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'Usuario'}</Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email || 'email@ejemplo.com'}</Text>

          <Button
            title="Cambiar foto de perfil"
            onPress={handleChangePhoto}
            style={styles.changePhotoButton}
            textStyle={styles.changePhotoText}
          />

          <View style={styles.themeToggleContainer}>
            <View style={styles.themeToggleContent}>
              <Text style={styles.themeToggleIcon}>{isDarkMode ? '🌙' : '☀️'}</Text>
              <Text style={[styles.themeToggleText, { color: theme.text }]}>
                {isDarkMode ? 'Modo oscuro' : 'Modo claro'}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: '#F26A3E' }}
              thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Información Personal</Text>

        <View style={styles.infoSection}>
          <View style={[styles.fieldCard, { backgroundColor: theme.card, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldIcon}>👤</Text>
              <View style={styles.fieldTextContainer}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Nombre completo</Text>
                <Text style={[styles.fieldValue, { color: theme.text }]}>{user?.name || 'N/A'}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.fieldCard, { backgroundColor: theme.card, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldIcon}>📧</Text>
              <View style={styles.fieldTextContainer}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Email</Text>
                <Text style={[styles.fieldValue, { color: theme.text }]}>{user?.email || 'N/A'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.fieldRow}>
            <View style={[styles.fieldCardHalf, { backgroundColor: theme.card, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldIcon}>🎂</Text>
                <View style={styles.fieldTextContainer}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Edad</Text>
                  <Text style={[styles.fieldValue, { color: theme.text }]}>{user?.age?.toString() || 'N/A'}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.fieldCardHalf, { backgroundColor: theme.card, borderWidth: isDarkMode ? 1 : 0, borderColor: theme.border }]}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldIcon}>⚧</Text>
                <View style={styles.fieldTextContainer}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Género</Text>
                  <Text style={[styles.fieldValue, { color: theme.text }]}>{getGenderLabel(user?.gender)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <Button
          title="✏️ Editar información"
          onPress={handleEditProfile}
          style={styles.editButton}
          textStyle={styles.editButtonText}
        />

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
    marginBottom: 24,
  },
  avatarCard: {
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
    borderColor: '#F26A3E',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F26A3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 15,
    marginBottom: 16,
    textAlign: 'center',
  },
  changePhotoButton: {
    backgroundColor: '#F26A3E',
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 8,
  },
  changePhotoText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  themeToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  themeToggleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  fieldCard: {
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
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 17,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#F26A3E',
    marginBottom: 12,
  },
  editButtonText: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#444444',
    marginBottom: 24,
  },
  logoutButtonText: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ProfileScreen;
