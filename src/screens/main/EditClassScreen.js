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
  ActivityIndicator,
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

const EditClassScreen = ({ route, navigation }) => {
  const { classId } = route.params;
  const { theme } = useTheme();
  const { user } = useAuth();
  const axiosInstance = useAxios();
  const scheduleService = createScheduleService(axiosInstance);
  const locationService = createLocationService(axiosInstance);

  const [discipline, setDiscipline] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [dateTime, setDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load locations
      const locationsData = await locationService.getAllLocations();
      setLocations(locationsData);

      // Load professor's classes to find this specific class
      const classes = await scheduleService.getClassesByProfessor(user.name);
      const classData = classes.find(c => c.id === classId);

      if (classData) {
        setDiscipline(classData.discipline);
        setDurationMinutes(classData.durationMinutes.toString());
        setCapacity(classData.capacity.toString());
        setDateTime(new Date(classData.dateTime));
        setDescription(classData.description || '');
        
        // Find and set the location
        const location = locationsData.find(loc => loc.name === classData.location);
        if (location) {
          setSelectedLocation(location);
        }
      } else {
        Alert.alert('Error', 'No se encontró la clase', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error loading class data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos de la clase', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setInitialLoading(false);
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
    if (parseInt(durationMinutes) > 120) {
      Alert.alert('Error', 'La duración no puede ser mayor a 120 minutos');
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
    if (parseInt(capacity) > 30) {
      Alert.alert('Error', 'La clase no puede tener más de 30 cupos');
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

  const handleUpdateClass = async () => {
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
        description: description.trim() || null, // Enviar null si está vacío
      };

      await scheduleService.updateScheduledClass(classId, classData);
      Alert.alert('Éxito', 'Clase actualizada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error updating class:', error);
      Alert.alert('Error', 'No se pudo actualizar la clase. Por favor intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = () => {
    Alert.alert(
      'Eliminar Clase',
      '¿Estás seguro de que querés eliminar esta clase? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await scheduleService.deleteScheduledClass(classId);
              Alert.alert('Éxito', 'Clase eliminada correctamente', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error('Error deleting class:', error);
              Alert.alert('Error', 'No se pudo eliminar la clase. Por favor intentá nuevamente.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Cargando datos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.formContainer, { backgroundColor: theme.container }]}>
          <Text style={[styles.title, { color: theme.primary }]}>Editar Clase</Text>
          
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

          <Text style={[styles.label, { color: theme.text }]}>Descripción (opcional)</Text>
          <Input
            placeholder="Describe la clase (ej: Clase de yoga enfocada en respiración...)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={styles.descriptionInput}
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
            title={loading ? 'Actualizando...' : 'Guardar Cambios'}
            onPress={handleUpdateClass}
            disabled={loading}
            style={styles.buttonSpacing}
          />

          <Button
            title="Eliminar Clase"
            onPress={handleDeleteClass}
            variant="danger"
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
});

export default EditClassScreen;
