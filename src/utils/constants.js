import { Platform } from 'react-native';

export const COLORS = {
  ORANGE: '#F26A3E',
  BEIGE: '#f5e1ce',
  DARK: '#232323',
  GRAY: '#444444',
  LIGHTGRAY: '#F5F5F5',
  ACCENT: '#FF8A50',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  ERROR: '#D32F2F',
  SUCCESS: '#34C759',
  HOLO_BLUE_DARK: '#0099CC',

  // Legacy aliases for compatibility
  PRIMARY: '#F26A3E',
  SECONDARY: '#232323',
  BACKGROUND: '#FFFFFF',
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#666666',
  TEXT_LIGHT: '#FFFFFF',
  WARNING: '#FF9500',
  BORDER: '#E0E0E0',
  CARD_BG: '#F5F5F5',
  TAB_ACTIVE: '#F26A3E',
  TAB_INACTIVE: '#999999',
};

export const THEME_COLORS = {
  light: {
    primary: '#F26A3E',
    secondary: '#232323',
    accent: '#FF8A50',
    background: '#FFFFFF',
    backgroundSecondary: '#f5e1ce',
    container: '#F5F5F5',
    card: '#FFFFFF',
    text: '#232323',
    textSecondary: '#444444',
    textLight: '#666666',
    textInverted: '#FFFFFF',
    border: '#E0E0E0',
    divider: '#E0E0E0',
    success: '#34C759',
    error: '#D32F2F',
    warning: '#FF9500',
    tabActive: '#F26A3E',
    tabInactive: '#999999',
  },
  dark: {
    primary: '#F26A3E',
    secondary: '#FFFFFF',
    accent: '#FF8A50',
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    container: '#2C2C2C',
    card: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textLight: '#888888',
    textInverted: '#232323',
    border: '#3A3A3A',
    divider: '#3A3A3A',
    success: '#34C759',
    error: '#FF6B6B',
    warning: '#FFB84D',
    tabActive: '#F26A3E',
    tabInactive: '#FFFFFF',
  },
};

// API Configuration
export const API_CONFIG = {
  // Configuración para dispositivo físico en la misma red
  BASE_URL: 'http://192.168.100.5:8080/api/v1',

  // Para Android emulator usar:
  // BASE_URL: 'http://10.0.2.2:8080/api/v1',

  // Opciones alternativas de BASE_URL:
  //
  // Para usar tu red local con un dispositivo físico o emulador en la misma red:
  //BASE_URL: 'http://192.168.0.164:8080/api/v1',
  //
  // ¿Cómo obtener tu IPv4 local?
  //
  // En Windows:
  //   1. Abrí CMD o PowerShell
  //   2. Ejecutá: ipconfig
  //   3. Buscá "Adaptador de LAN inalámbrica Wi-Fi" o "Adaptador de Ethernet"
  //   4. Copiá el valor de "Dirección IPv4" (ej: 192.168.0.164)
  //
  // En macOS:
  //   1. Abrí Terminal
  //   2. Ejecutá: ifconfig | grep "inet " | grep -v 127.0.0.1
  //   3. Buscá la IP que empiece con 192.168.x.x o 10.x.x.x
  //   Alternativa: Preferencias del Sistema → Red → Tu conexión activa → verás la IP
  //
  // Para localhost (web o Metro Bundler en la misma máquina):
  // BASE_URL: 'http://localhost:8080/api/v1',

  TIMEOUT: 30000,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@ritmofit_auth_token',
  USER_ID: '@ritmofit_user_id',
  USER_EMAIL: '@ritmofit_user_email',
  USER_DATA: '@ritmofit_user_data',
};

// Gender Options
export const GENDERS = [
  { label: 'Masculino', value: 'MALE' },
  { label: 'Femenino', value: 'FEMALE' },
  { label: 'Otro', value: 'OTHER' },
];

// Disciplines
export const DISCIPLINES = [
  'Todos',
  'Yoga',
  'Pilates',
  'Funcional',
  'Spinning',
  'Zumba',
  'CrossFit',
  'Boxing',
];

// Date/Time formats
export const DATE_FORMAT = 'DD/MM/YYYY';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';

// History range (days)
export const HISTORY_RANGE_DAYS = 30;

// Booking status
export const BOOKING_STATUS = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  PENDING: 'PENDING',
};

// Attendance status
export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
};