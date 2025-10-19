import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';
import { extractUserIdFromToken } from './helpers';

/**
 * SessionManager - Handles authentication data storage
 */
class SessionManager {
  /**
   * Save authentication data
   */
  async saveAuth(token, email, userId = null) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);

      // Extract userId from token if not provided
      const id = userId || extractUserIdFromToken(token);
      if (id) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, id.toString());
      }

      return true;
    } catch (error) {
      console.error('Error saving auth data:', error);
      return false;
    }
  }

  /**
   * Get stored token
   */
  async getToken() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Get stored user ID
   */
  async getUserId() {
    try {
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  /**
   * Get stored email
   */
  async getEmail() {
    try {
      const email = await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL);
      return email;
    } catch (error) {
      console.error('Error getting email:', error);
      return null;
    }
  }

  /**
   * Get stored user data
   */
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Save user data
   */
  async saveUserData(userData) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Clear all authentication data
   */
  async clear() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.USER_EMAIL,
        STORAGE_KEYS.USER_DATA,
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing session:', error);
      return false;
    }
  }
}

export default new SessionManager();
