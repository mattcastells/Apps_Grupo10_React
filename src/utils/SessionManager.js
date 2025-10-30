import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'userData';

class SessionManager {

  async saveToken(token) {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token', error);
    }
  };

  async getToken(){
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token', error);
      return null;
    }
  };

  async removeToken() {
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


  // TODO Validar
  async getUserData() {
    try {
      const userData = await SecureStore.getItemAsync(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // TODO Validar
  async saveUserData(userData) {
    try {
      await SecureStore.setItemAsync(JSON.stringify(userData), USER_KEY);
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  }

}

export default new SessionManager();
