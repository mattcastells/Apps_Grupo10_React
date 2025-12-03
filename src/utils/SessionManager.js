import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'authToken';

class SessionManager {

  async getToken(){
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      return null;
    }
  };

  async setToken(token) {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
    }
  };

  async deleteToken() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
    }
  };

  async isAuthenticated() {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }

  async clear() {
    try {
      await this.deleteToken();
      return true;
    } catch (error) {
      return false;
    }
  }

}

export default new SessionManager();
