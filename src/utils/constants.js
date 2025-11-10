import { Platform } from 'react-native';

// RitmoFit Colors (Exact from Android)
export const COLORS = {
  // Main colors
  ORANGE: '#F26A3E',        // ritmofit_orange
  BEIGE: '#f5e1ce',         // ritmofit_beige
  DARK: '#232323',          // ritmofit_dark
  GRAY: '#444444',          // ritmofit_gray
  LIGHTGRAY: '#F5F5F5',     // ritmofit_lightgray
  ACCENT: '#FF8A50',        // ritmofit_accent

  // Standard colors
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  ERROR: '#D32F2F',
  SUCCESS: '#34C759',

  // Android system colors
  HOLO_BLUE_DARK: '#0099CC',

  // Legacy names for compatibility
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

// API Configuration
export const API_CONFIG = {
  // Use localhost for web, 10.0.2.2 for Android emulator, or your IP for physical devices
  BASE_URL: 'http://10.0.2.2:8080/api/v1', // Change this IP to your machine's IP,
  TIMEOUT: 30000,
  USE_MOCK: false,
};

// Storage Keys
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
