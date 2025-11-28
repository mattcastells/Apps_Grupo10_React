import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { COLORS, GENDERS } from '../../utils/constants';
import { validateEmail, validateAge, validatePassword } from '../../utils/helpers';

const CreateUserScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'MALE',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'El email es requerido');
      return false;
    } else if (!validateEmail(formData.email)) {
      Alert.alert('Error', 'Email inválido');
      return false;
    }

    if (!formData.password) {
      Alert.alert('Error', 'La contraseña es requerida');
      return false;
    } else if (!validatePassword(formData.password)) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (!formData.confirmPassword) {
      Alert.alert('Error', 'Confirma tu contraseña');
      return false;
    } else if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    if (!formData.age.trim()) {
      Alert.alert('Error', 'La edad es requerida');
      return false;
    } else if (!validateAge(formData.age)) {
      Alert.alert('Error', 'Debes tener al menos 18 años');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userRequest = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        password: formData.password,
      };

      const response = await register(userRequest);

      Alert.alert('Éxito', 'Cuenta creada. Verifica tu email con el código OTP.', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Otp', { email: formData.email.trim() });
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Error al crear la cuenta. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhoto = () => {
    Alert.alert('Cambiar Foto', 'Funcionalidad de cambio de foto próximamente');
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>Crear usuario</Text>

            {/* Avatar placeholder - 120x120 */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
            </View>

            {/* Change Photo Button */}
            <Button
              title="Cambiar foto"
              onPress={handleChangePhoto}
              style={styles.changePhotoButton}
              textStyle={styles.changePhotoText}
            />

            {/* Nombre completo Input */}
            <Input
              value={formData.name}
              onChangeText={(value) => handleChange('name', value)}
              placeholder="Nombre completo"
              inputStyle={styles.input}
              style={styles.inputContainer}
            />

            {/* Email Input */}
            <Input
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              placeholder="Correo electrónico"
              keyboardType="email-address"
              inputStyle={styles.input}
              style={styles.inputContainer}
            />

            {/* Password Input */}
            <Input
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
              placeholder="Contraseña"
              secureTextEntry
              inputStyle={styles.input}
              style={styles.inputContainer}
            />

            {/* Confirm Password Input */}
            <Input
              value={formData.confirmPassword}
              onChangeText={(value) => handleChange('confirmPassword', value)}
              placeholder="Repetir contraseña"
              secureTextEntry
              inputStyle={styles.input}
              style={styles.inputContainer}
            />

            {/* Age Input */}
            <Input
              value={formData.age}
              onChangeText={(value) => handleChange('age', value)}
              placeholder="Edad"
              keyboardType="numeric"
              inputStyle={styles.input}
              style={styles.inputContainer}
            />

            {/* Gender Picker */}
            <View style={styles.genderWrapper}>
              <Text style={styles.genderLabel}>Género</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.gender}
                  onValueChange={(value) => handleChange('gender', value)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {GENDERS.map((gender) => (
                    <Picker.Item key={gender.value} label={gender.label} value={gender.value} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Create User Button */}
            <Button
              title="Crear usuario"
              onPress={handleRegister}
              loading={loading}
              style={styles.createButton}
              textStyle={styles.createButtonText}
            />

            {/* Back to Login Button */}
            <Button
              title="Volver al login"
              onPress={handleBackToLogin}
              style={styles.backButton}
              textStyle={styles.backButtonText}
            />
          </View>
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
    flexGrow: 1,
  },
  content: {
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
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.LIGHTGRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
  },
  changePhotoButton: {
    backgroundColor: COLORS.ORANGE,
    marginBottom: 16,
  },
  changePhotoText: {
    fontSize: 15,
    color: COLORS.WHITE,
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    fontSize: 16,
    color: COLORS.DARK,
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.GRAY,
    borderWidth: 1,
  },
  genderWrapper: {
    marginBottom: 10,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.DARK,
    marginBottom: 6,
    marginLeft: 4,
  },
  pickerContainer: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
    borderRadius: 8,
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE,
    overflow: 'visible',
  },
  picker: {
    height: 48,
    width: '100%',
    color: COLORS.DARK,
  },
  pickerItem: {
    height: 48,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: COLORS.ORANGE,
    marginTop: 24,
  },
  createButtonText: {
    fontSize: 18,
    color: COLORS.WHITE,
  },
  backButton: {
    backgroundColor: COLORS.HOLO_BLUE_DARK,
    marginTop: 12,
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.WHITE,
  },
});

export default CreateUserScreen;
