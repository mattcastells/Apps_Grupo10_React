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

export const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:8080/api/v1', // Use 10.0.2.2 for Android emulator
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
