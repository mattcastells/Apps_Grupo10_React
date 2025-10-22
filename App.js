/**
 * RitmoFit - Fitness App
 * React Native App with Expo
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}