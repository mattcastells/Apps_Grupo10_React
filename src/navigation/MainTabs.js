import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

import HomeScreen from '../screens/main/HomeScreen';
import ClassDetailScreen from '../screens/main/ClassDetailScreen';
import ReservationsScreen from '../screens/main/ReservationsScreen';
import CreateClassScreen from '../screens/main/CreateClassScreen';
import EditClassScreen from '../screens/main/EditClassScreen';
import ScanQRScreen from '../screens/other/ScanQRScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import HistoryDetailScreen from '../screens/history/HistoryDetailScreen';
import NewsScreen from '../screens/other/NewsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditUserScreen from '../screens/profile/EditUserScreen';
import NotificationBell from '../components/NotificationBell';
import NotificationDrawer from '../components/NotificationDrawer';
import ClassChangeConfirmationScreen from '../screens/other/ClassChangeConfirmationScreen';
import ProfileButton from '../components/ProfileButton';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

// Custom Floating Button Component
const FloatingQRButton = ({ children, onPress }) => {
  return (
    <TouchableOpacity
      style={{
        top: -30,
        justifyContent: 'center',
        alignItems: 'center',
        ...styles.shadow
      }}
      onPress={onPress}
    >
      <View
        style={{
          top: 10,
          width: 70,
          height: 70,
          borderRadius: 90,
          backgroundColor: '#F26A3E',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children}
      </View>
    </TouchableOpacity>
  );
};

// Home Stack
const HomeStack = ({ setShowNotifications, refreshBell }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#F26A3E',
          height: 100,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        headerRight: () => <ProfileButton />,
      }}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          title: 'Clases',
          headerLeft: () => (
            <NotificationBell
              key={refreshBell}
              onPress={() => setShowNotifications(true)}
              style={{ marginLeft: 10 }}
            />
          ),
        }}
      />
      <Stack.Screen
        name="ClassDetail"
        component={ClassDetailScreen}
        options={{ title: 'Detalle de Clase' }}
      />
      <Stack.Screen
        name="ClassChangeConfirmation"
        component={ClassChangeConfirmationScreen}
        options={{ title: 'Confirmar Cambio de Clase' }}
      />
    </Stack.Navigator>
  );
};

// Reservations Stack
const ReservationsStack = ({ setShowNotifications, refreshBell }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#F26A3E',
          height: 100,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        headerRight: () => <ProfileButton />,
        headerLeft: () => (
            <NotificationBell
              key={refreshBell}
              onPress={() => setShowNotifications(true)}
              style={{ marginLeft: 10 }}
            />
          ),
      }}
    >
      <Stack.Screen
        name="ReservationsScreen"
        component={ReservationsScreen}
        options={{ title: 'Mis Reservas' }}
      />
      <Stack.Screen
        name="CreateClass"
        component={CreateClassScreen}
        options={{ title: 'Crear Clase' }}
      />
      <Stack.Screen
        name="EditClass"
        component={EditClassScreen}
        options={{ title: 'Editar Clase' }}
      />
      <Stack.Screen
        name="ClassDetail"
        component={ClassDetailScreen}
        options={{ title: 'Detalle de Clase' }}
      />
    </Stack.Navigator>
  );
};

// History Stack
const HistoryStack = ({ setShowNotifications, refreshBell }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#F26A3E',
          height: 100,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        headerRight: () => <ProfileButton />,
        headerLeft: () => (
            <NotificationBell
              key={refreshBell}
              onPress={() => setShowNotifications(true)}
              style={{ marginLeft: 10 }}
            />
          ),
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
const NewsStack = ({ setShowNotifications, refreshBell }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#F26A3E',
          height: 100,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        headerRight: () => <ProfileButton />,
        headerLeft: () => (
            <NotificationBell
              key={refreshBell}
              onPress={() => setShowNotifications(true)}
              style={{ marginLeft: 10 }}
            />
          ),
      }}
    >
      <Stack.Screen name="NewsScreen" component={NewsScreen} options={{ title: 'Noticias' }} />
    </Stack.Navigator>
  );
};

// Profile Stack - Now separate from Tabs
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#F26A3E',
          height: 100,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
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
const ScanStack = ({ setShowNotifications, refreshBell }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#F26A3E',
          height: 100,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        headerRight: () => <ProfileButton />,
        headerLeft: () => (
            <NotificationBell
              key={refreshBell}
              onPress={() => setShowNotifications(true)}
              style={{ marginLeft: 10 }}
            />
          ),
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

const BottomTabs = ({ setShowNotifications, refreshBell }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isProfessor = user?.role === 'PROFESSOR';
  
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
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.tabActive,
        tabBarInactiveTintColor: theme.tabInactive,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 10,
        },
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen name="Home" options={{ title: 'Clases' }}>
        {() => <HomeStack setShowNotifications={setShowNotifications} refreshBell={refreshBell} />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Reservations" 
        options={{ title: isProfessor ? 'Mis Clases' : 'Reservas' }} 
      >
        {() => <ReservationsStack setShowNotifications={setShowNotifications} refreshBell={refreshBell} />}
      </Tab.Screen>

      <Tab.Screen 
        name="Scan" 
        options={{ 
          title: '',
          tabBarIcon: ({ focused }) => (
            <Ionicons name="qr-code-outline" size={30} color="#FFFFFF" />
          ),
          tabBarButton: (props) => (
            <FloatingQRButton {...props} />
          )
        }} 
      >
        {() => <ScanStack setShowNotifications={setShowNotifications} refreshBell={refreshBell} />}
      </Tab.Screen>

      <Tab.Screen name="History" options={{ title: 'Historial' }}>
        {() => <HistoryStack setShowNotifications={setShowNotifications} refreshBell={refreshBell} />}
      </Tab.Screen>

      <Tab.Screen name="News" options={{ title: 'Noticias' }}>
        {() => <NewsStack setShowNotifications={setShowNotifications} refreshBell={refreshBell} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const MainTabs = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [refreshBell, setRefreshBell] = useState(0);

  const handleNotificationsRead = () => {
    setRefreshBell(prev => prev + 1);
  };

  return (
    <>
      <MainStack.Navigator screenOptions={{ headerShown: false }}>
        <MainStack.Screen name="MainTabs">
          {() => <BottomTabs setShowNotifications={setShowNotifications} refreshBell={refreshBell} />}
        </MainStack.Screen>
        <MainStack.Screen name="ProfileStack" component={ProfileStack} />
      </MainStack.Navigator>

      <NotificationDrawer
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNotificationsRead={handleNotificationsRead}
      />
    </>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#F26A3E',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  }
});

export default MainTabs;
