import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveAuthStatus = async (status: boolean) => {
  try {
    await AsyncStorage.setItem('isAuthenticated', String(status));
  } catch (error) {
    console.error('Error saving auth status:', error);
  }
};

export const getAuthStatus = async (): Promise<boolean> => {
  try {
    const status = await AsyncStorage.getItem('isAuthenticated');
    return status === 'true'; // Convert string to boolean
  } catch (error) {
    console.error('Error getting auth status:', error);
    return false;
  }
};
