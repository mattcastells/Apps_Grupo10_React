import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          !editable && styles.inputDisabled,
          multiline && styles.inputMultiline,
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.TEXT_SECONDARY}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    minHeight: 50,
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  inputDisabled: {
    backgroundColor: COLORS.CARD_BG,
    color: COLORS.TEXT_SECONDARY,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.ERROR,
    marginTop: 4,
  },
});

export default Input;
