import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAxios } from '../../hooks/useAxios';
import createScheduleService from '../../services/scheduleService';
import createLocationService from '../../services/locationService';
import Input from '../../components/Input';
import Button from '../../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';

const DISCIPLINES = ['Yoga', 'Funcional', 'Spinning', 'Boxeo', 'Pilates', 'Zumba', 'CrossFit'];

const CreateClassScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const axiosInstance = useAxios();
  const scheduleService = createScheduleService(axiosInstance);
  const locationService = createLocationService(axiosInstance);

  const [discipline, setDiscipline] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [capacity, setCapacity] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [dateTime, setDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await locationService.getAllLocations();
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
      Alert.alert('Error', 'No se pudieron cargar las sedes.');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateTime(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = new Date(dateTime);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setDateTime(newDateTime);
    }
  };

  const validateForm = () => {
    if (!discipline) {
      Alert.alert('Error', 'Por favor seleccioná una disciplina');
      return false;
    }
    if (!durationMinutes || durationMinutes.trim() === '') {
      Alert.alert('Error', 'La duración en minutos es obligatoria');
      return false;
    }
    if (isNaN(durationMinutes) || parseInt(durationMinutes) <= 0) {
      Alert.alert('Error', 'Por favor ingresá una duración válida (mayor a 0)');
      return false;
    }
    if (!capacity || capacity.trim() === '') {
      Alert.alert('Error', 'La capacidad máxima es obligatoria');
      return false;
    }
    if (isNaN(capacity) || parseInt(capacity) <= 0) {
      Alert.alert('Error', 'Por favor ingresá una capacidad válida (mayor a 0)');
      return false;
    }
    if (!selectedLocation) {
      Alert.alert('Error', 'Por favor seleccioná una sede');
      return false;
    }
    if (dateTime < new Date()) {
      Alert.alert('Error', 'La fecha y hora deben ser futuras');
      return false;
    }
    return true;
  };

  const handleCreateClass = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Format datetime to ISO string without milliseconds
      const formattedDateTime = dateTime.toISOString().split('.')[0];

      const classData = {
        discipline: discipline,
        professor: user.name,
        durationMinutes: parseInt(durationMinutes),
        capacity: parseInt(capacity),
        locationId: selectedLocation.id,
        dateTime: formattedDateTime,
      };

      console.log('📤 Enviando datos de clase:', classData);
      const response = await scheduleService.createScheduledClass(classData);
      console.log('✅ Clase creada exitosamente:', response);
      
      Alert.alert(
        'Éxito', 
        'Clase creada correctamente', 
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Navigate back to trigger a refresh
              navigation.navigate('Home');
              // Force a small delay to ensure the tab switches first
              setTimeout(() => {
                navigation.navigate('Reservations');
              }, 100);
            }
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error creating class:', error);
      console.error('Error details:', error.response?.data);
      Alert.alert('Error', error.response?.data?.message || 'No se pudo crear la clase. Por favor intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.formContainer, { backgroundColor: theme.container }]}>
          <Text style={[styles.title, { color: theme.primary }]}>Crear Nueva Clase</Text>
          
          <Text style={[styles.label, { color: theme.text }]}>Disciplina</Text>
          <View style={[styles.pickerContainer, { backgroundColor: theme.background }]}>
            <Picker
              selectedValue={discipline}
              onValueChange={(value) => setDiscipline(value)}
              style={[styles.picker, { color: theme.text }]}
              dropdownIconColor={theme.text}
            >
              <Picker.Item label="Seleccioná una disciplina..." value="" />
              {DISCIPLINES.map((disc) => (
                <Picker.Item key={disc} label={disc} value={disc} />
              ))}
            </Picker>
          </View>

          <Input
            placeholder="Duración (minutos)"
            value={durationMinutes}
            onChangeText={setDurationMinutes}
            keyboardType="numeric"
          />

          <Input
            placeholder="Capacidad máxima"
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="numeric"
          />

          <Text style={[styles.label, { color: theme.text }]}>Sede</Text>
          <View style={styles.locationContainer}>
            {locations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={[
                  styles.locationButton,
                  { 
                    backgroundColor: selectedLocation?.id === location.id 
                      ? theme.primary 
                      : theme.background 
                  }
                ]}
                onPress={() => setSelectedLocation(location)}
              >
                <Text
                  style={[
                    styles.locationText,
                    { 
                      color: selectedLocation?.id === location.id 
                        ? '#FFFFFF' 
                        : theme.text 
                    }
                  ]}
                >
                  {location.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: theme.text }]}>Fecha y Hora</Text>
          
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: theme.background }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateButtonText, { color: theme.text }]}>
              📅 {dateTime.toLocaleDateString('es-AR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: theme.background }]}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={[styles.dateButtonText, { color: theme.text }]}>
              🕐 {dateTime.toLocaleTimeString('es-AR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dateTime}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={dateTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}

          <Button
            title={loading ? 'Creando...' : 'Crear Clase'}
            onPress={handleCreateClass}
            disabled={loading}
            style={styles.buttonSpacing}
          />

          <Button
            title="Cancelar"
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={styles.buttonSpacing}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formContainer: {
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  pickerContainer: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  picker: {
    height: 50,
  },
  locationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  locationButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 2,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  dateButtonText: {
    fontSize: 16,
  },
  buttonSpacing: {
    marginTop: 12,
  },
});

export default CreateClassScreen;
