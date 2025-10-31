import { DATE_FORMAT, TIME_FORMAT } from './constants';

/**
 * Format date to DD/MM/YYYY
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format time to HH:mm
 */
export const formatTime = (timeString) => {
  if (!timeString) return '';
  // Handle "HH:mm:ss" or "HH:mm" format
  const parts = timeString.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeString;
};

/**
 * Format datetime
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${formatDate(dateString)} ${formatTime(date.toTimeString())}`;
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate age (must be 18+)
 */
export const validateAge = (age) => {
  const numAge = parseInt(age, 10);
  return !isNaN(numAge) && numAge >= 18 && numAge <= 120;
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

/**
 * Extract user ID from JWT token
 */
export const extractUserIdFromToken = (token) => {
  try {
    if (!token) {
      return null;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    
    const userId = payload.userId || payload.sub || payload.id || null;
    
    return userId;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
};

/**
 * Parse QR code data
 */
export const parseQRData = (qrData) => {
  try {
    const data = JSON.parse(qrData);
    return data;
  } catch (error) {
    console.error('Error parsing QR data:', error);
    return null;
  }
};

/**
 * Get date range (from 30 days ago to today)
 */
export const getDateRange = (days = 30) => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);

  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
};

/**
 * Format date to ISO (YYYY-MM-DD)
 */
export const formatDateToISO = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Get day of week
 */
export const getDayOfWeek = (dateString) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const date = new Date(dateString);
  return days[date.getDay()];
};

/**
 * Calculate age from birthdate
 */
export const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};
