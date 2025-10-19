import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import ClassDetailScreen from '../screens/main/ClassDetailScreen';
import ReservationsScreen from '../screens/main/ReservationsScreen';
import ScanQRScreen from '../screens/other/ScanQRScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import HistoryDetailScreen from '../screens/history/HistoryDetailScreen';
import NewsScreen from '../screens/other/NewsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditUserScreen from '../screens/profile/EditUserScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home Stack
const HomeStack = () => {
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
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Clases' }} />
      <Stack.Screen
        name="ClassDetail"
        component={ClassDetailScreen}
        options={{ title: 'Detalle de Clase' }}
      />
    </Stack.Navigator>
  );
};

// Reservations Stack
const ReservationsStack = () => {
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
        name="ReservationsScreen"
        component={ReservationsScreen}
        options={{ title: 'Mis Reservas' }}
      />
    </Stack.Navigator>
  );
};

// History Stack
const HistoryStack = () => {
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
        name="HistoryScreen"
        component={HistoryScreen}
        options={{ title: 'Mi Historial' }}
      />
      <Stack.Screen
        name="HistoryDetail"
        component={HistoryDetailScreen}
        options={{ title: 'Detalle de Asistencia' }}
      />
    </Stack.Navigator>
  );
};

// News Stack
const NewsStack = () => {
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
      <Stack.Screen name="NewsScreen" component={NewsScreen} options={{ title: 'Noticias' }} />
    </Stack.Navigator>
  );
};

// Profile Stack
const ProfileStack = () => {
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
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: 'Mi Perfil' }}
      />
      <Stack.Screen
        name="EditUser"
        component={EditUserScreen}
        options={{ title: 'Editar Perfil' }}
      />
    </Stack.Navigator>
  );
};

// Scan QR Stack
const ScanStack = () => {
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
        name="ScanQRScreen"
        component={ScanQRScreen}
        options={{ title: 'Escanear QR' }}
      />
    </Stack.Navigator>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Scan') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Reservations') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'News') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.TAB_ACTIVE,
        tabBarInactiveTintColor: COLORS.TAB_INACTIVE,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.BACKGROUND,
          borderTopColor: COLORS.BORDER,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Clases' }} />
      <Tab.Screen name="Scan" component={ScanStack} options={{ title: 'Escanear' }} />
      <Tab.Screen name="Reservations" component={ReservationsStack} options={{ title: 'Reservas' }} />
      <Tab.Screen name="History" component={HistoryStack} options={{ title: 'Historial' }} />
      <Tab.Screen name="News" component={NewsStack} options={{ title: 'Noticias' }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
};

export default MainTabs;
