import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../context/AuthContext';
import { COLORS, GENDERS } from '../../utils/constants';
import createUserService from '../../services/userService';
import cloudinaryService from '../../services/cloudinaryService';
import { validateAge } from '../../utils/helpers';
import { useAxios } from '../../hooks/useAxios';

const EditUserScreen = ({ navigation }) => {
  const { user, updateUser, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: 'MALE',
  });
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const axiosInstance = useAxios();
  const userService = createUserService(axiosInstance);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        age: user.age?.toString() || '',
        gender: user.gender || 'MALE',
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangePhoto = () => {
    Alert.alert(
      'Cambiar Foto de Perfil',
      'Selecciona una opción',
      [
        {
          text: 'Tomar Foto',
          onPress: () => selectPhotoFromCamera(),
        },
        {
          text: 'Elegir de Galería',
          onPress: () => selectPhotoFromLibrary(),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const selectPhotoFromLibrary = async () => {
    // Solicitar permisos para acceder a la galería
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'Necesitamos permisos para acceder a tu galería de fotos'
      );
      return;
    }

    // Abrir selector de galería
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      await uploadPhotoToCloudinary(selectedImage);
    }
  };

  const selectPhotoFromCamera = async () => {
    // Solicitar permisos para usar la cámara
    const { status} = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'Necesitamos permisos para usar tu cámara'
      );
      return;
    }

    // Abrir cámara
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      await uploadPhotoToCloudinary(selectedImage);
    }
  };

  const uploadPhotoToCloudinary = async (imageData) => {
    if (!user?.id) {
      Alert.alert('Error', 'No se pudo obtener el ID del usuario');
      return;
    }

    setUploadingPhoto(true);

    try {
      // Preparar datos de la imagen (Expo format)
      const imagePayload = {
        uri: imageData.uri,
        type: imageData.mimeType || 'image/jpeg',
        fileName: imageData.fileName || `profile_${user.id}_${Date.now()}.jpg`,
      };

      // Subir a Cloudinary y guardar en backend
      const result = await cloudinaryService.uploadAndSaveProfilePhoto(
        user.id,
        imagePayload
      );

      if (result.success) {
        Alert.alert('Éxito', 'Foto de perfil actualizada correctamente');
        // Refrescar datos del usuario desde el backend para ver la nueva foto
        await refreshUser();
      }
    } catch (error) {
      console.error('Error al subir foto:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo actualizar la foto de perfil'
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'El correo electrónico es requerido');
      return false;
    }

    if (!formData.age.trim()) {
      Alert.alert('Error', 'La edad es requerida');
      return false;
    }

    if (!validateAge(formData.age)) {
      Alert.alert('Error', 'Debés tener al menos 18 años');
      return false;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    if (formData.password && formData.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        name: formData.name.trim(),
        age: parseInt(formData.age, 10),
        gender: formData.gender,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const updatedUser = await userService.updateUser(user.id, updateData);
      await updateUser(updatedUser);

      Alert.alert('Éxito', 'Perfil actualizado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Editar información</Text>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.photoUrl || 'https://i.pravatar.cc/300?img=12' }}
              style={styles.avatar}
            />
          </View>

          {/* Change Photo Button */}
          <TouchableOpacity
            style={styles.photoButton}
            onPress={handleChangePhoto}
            disabled={uploadingPhoto}
          >
            <Text style={styles.photoButtonText}>
              {uploadingPhoto ? 'Subiendo foto...' : 'Cambiar foto de perfil'}
            </Text>
          </TouchableOpacity>

          {uploadingPhoto && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.ORANGE} />
              <Text style={styles.loadingText}>Subiendo imagen a la nube...</Text>
            </View>
          )}

          {/* Name Input */}
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            placeholder="Nombre completo"
            placeholderTextColor={COLORS.GRAY}
          />

          {/* Email Input */}
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            placeholder="Correo electrónico"
            placeholderTextColor={COLORS.GRAY}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            placeholder="Contraseña (opcional)"
            placeholderTextColor={COLORS.GRAY}
            secureTextEntry
          />

          {/* Confirm Password Input */}
          <TextInput
            style={styles.input}
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
            placeholder="Repetir contraseña"
            placeholderTextColor={COLORS.GRAY}
            secureTextEntry
          />

          {/* Age Input */}
          <TextInput
            style={styles.input}
            value={formData.age}
            onChangeText={(value) => handleChange('age', value)}
            placeholder="Edad"
            placeholderTextColor={COLORS.GRAY}
            keyboardType="numeric"
          />

          {/* Gender Picker */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.gender}
              onValueChange={(value) => handleChange('gender', value)}
              style={styles.picker}
            >
              {GENDERS.map((gender) => (
                <Picker.Item key={gender.value} label={gender.label} value={gender.value} />
              ))}
            </Picker>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  keyboardView: {
    flex: 1,
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.LIGHTGRAY,
  },
  photoButton: {
    backgroundColor: COLORS.ORANGE,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  photoButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.DARK,
    fontStyle: 'italic',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.DARK,
    backgroundColor: COLORS.WHITE,
    marginBottom: 10,
  },
  pickerContainer: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
    borderRadius: 8,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
    marginBottom: 10,
  },
  picker: {
    height: 48,
    color: COLORS.WHITE,
  },
  saveButton: {
    backgroundColor: COLORS.ORANGE,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  cancelButton: {
    backgroundColor: COLORS.GRAY,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.DARK,
  },
});

export default EditUserScreen;
