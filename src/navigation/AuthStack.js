import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import CreateUserScreen from '../screens/auth/CreateUserScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.PRIMARY,
        },
        headerTintColor: COLORS.TEXT_LIGHT,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'RitmoFit - Iniciar Sesion',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CreateUser"
        component={CreateUserScreen}
        options={{
          title: 'Crear Cuenta',
        }}
      />
      <Stack.Screen
        name="Otp"
        component={OtpScreen}
        options={{
          title: 'Verificar Email',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
