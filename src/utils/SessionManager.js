import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'authToken';

class SessionManager {

  async getToken(){
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token', error);
      return null;
    }
  };

  async setToken(token) {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token', error);
    }
  };

  async deleteToken() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
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
