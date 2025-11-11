import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    if (disabled) {
      return { backgroundColor: theme.border };
    }
    switch (variant) {
      case 'secondary':
        return { backgroundColor: theme.secondary };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 2, borderColor: theme.primary };
      case 'danger':
        return { backgroundColor: theme.error };
      default:
        return { backgroundColor: theme.primary };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return { color: theme.primary };
      default:
        return { color: theme.textInverted };
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? theme.primary : theme.textInverted} />
      ) : (
        <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Button;
