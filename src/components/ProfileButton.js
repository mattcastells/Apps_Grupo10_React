import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ProfileButton = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const handlePress = () => {
    navigation.navigate('ProfileStack', { screen: 'ProfileScreen' });
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Ionicons name="person-circle-outline" size={32} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
  },
});

export default ProfileButton;
