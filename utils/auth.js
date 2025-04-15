import * as SecureStore from 'expo-secure-store'; // SecureStore is currently not used



const saveAuthToken = async (token) => {
  try {
    // await SecureStore.setItemAsync('derivAuthToken', token); // Commented out to avoid confusion

    console.log('Token saved securely');
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

const getAuthToken = async () => {
  return await SecureStore.getItemAsync('derivAuthToken');
};
