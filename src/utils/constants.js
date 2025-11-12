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
  BASE_URL: 'http://10.0.2.2:8080/api/v1', // Use 10.0.2.2 for Android emulator
  // BASE_URL: 'http://192.168.0.164:8080/api/v1', // URL personalizada IPv4 (descomentá esta si usás tu red local)
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

// Class Disciplines
export const DISCIPLINES = [
  'Todos',
  'Yoga',
  'Spinning',
  'Pilates',
  'Zumba',
  'CrossFit',
  'Boxing',
];

// Locations
export const LOCATIONS = [
  'Todas',
  'Sede Centro',
  'Sede Norte',
  'Sede Sur',
  'Sede Este',
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
