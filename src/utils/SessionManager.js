import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'authToken';

class SessionManager {

  async getToken(){
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token', error);
      return null;
    }
  };

  async setToken(token) {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token', error);
    }
  };

  async deleteToken() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token', error);
    }
  };

  async isAuthenticated() {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  async clear() {
    try {
      await this.deleteToken();
      return true;
    } catch (error) {
      console.error('Error clearing session:', error);
      return false;
    }
  }

}

export default new SessionManager();
