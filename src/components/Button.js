import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../utils/constants';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    if (disabled) {
      return styles.buttonDisabled;
    }
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'outline':
        return styles.buttonOutline;
      case 'danger':
        return styles.buttonDanger;
      default:
        return styles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.textOutline;
      default:
        return styles.text;
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
        <ActivityIndicator color={variant === 'outline' ? COLORS.PRIMARY : COLORS.TEXT_LIGHT} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
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
  buttonPrimary: {
    backgroundColor: COLORS.PRIMARY,
  },
  buttonSecondary: {
    backgroundColor: COLORS.SECONDARY,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  buttonDanger: {
    backgroundColor: COLORS.ERROR,
  },
  buttonDisabled: {
    backgroundColor: COLORS.BORDER,
  },
  text: {
    color: COLORS.TEXT_LIGHT,
    fontSize: 16,
    fontWeight: '600',
  },
  textOutline: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Button;
