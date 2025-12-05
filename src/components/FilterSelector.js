import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * FilterSelector Component
 * 
 * Un componente reutilizable para crear filtros con dropdown compacto
 * 
 * @param {string} label - Etiqueta del filtro (ej: "Fecha", "Disciplina")
 * @param {string} value - Valor seleccionado actual
 * @param {Array} options - Array de opciones [{label: string, value: string}]
 * @param {function} onSelect - Callback cuando se selecciona una opción
 * @param {string} modalTitle - Título del modal (opcional)
 */
const FilterSelector = ({ label, value, options, onSelect, modalTitle }) => {
  const { theme, isDarkMode } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (selectedValue) => {
    onSelect(selectedValue);
    setModalVisible(false);
  };

  // Buscar el label correspondiente al value seleccionado
  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : value;

  return (
    <>
      <TouchableOpacity 
        style={styles.filterWrapper} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>{label}</Text>
        <View style={[styles.filterItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.filterValue, { color: theme.text }]} numberOfLines={1}>
            {displayText}
          </Text>
          <Text style={[styles.filterArrow, { color: theme.textSecondary }]}>▼</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { 
              backgroundColor: theme.container,
              borderColor: isDarkMode ? theme.border : '#E0E0E0',
            }]}>
              <View style={[styles.modalHeader, { borderBottomColor: isDarkMode ? theme.border : '#E0E0E0' }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {modalTitle || `Seleccionar ${label}`}
                </Text>
              </View>
              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.modalOption,
                      { 
                        borderBottomColor: isDarkMode ? theme.border : '#F0F0F0',
                        borderBottomWidth: index < options.length - 1 ? 1 : 0,
                      }
                    ]}
                    onPress={() => handleSelect(option.value)}
                  >
                    <Text style={[
                      styles.modalOptionText, 
                      { color: theme.text },
                      value === option.value && { fontWeight: '600', color: theme.primary }
                    ]}>
                      {option.label}
                    </Text>
                    {value === option.value && (
                      <Text style={[styles.modalCheck, { color: theme.primary }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  filterWrapper: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  filterItem: {
    borderWidth: 1,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterValue: {
    fontSize: 14,
    flex: 1,
  },
  filterArrow: {
    fontSize: 10,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 320,
    maxHeight: '60%',
  },
  modalContent: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 300,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  modalOptionText: {
    fontSize: 15,
  },
  modalCheck: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default FilterSelector;

