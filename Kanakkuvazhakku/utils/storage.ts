import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocalBackup {
  id: string;
  date: Date;
  userName: string;
  size: number;
}

const LOCAL_BACKUPS_KEY = 'localBackups';

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

export const getLocalBackups = async (): Promise<LocalBackup[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(LOCAL_BACKUPS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting local backups:', error);
    return [];
  }
};

export const deleteLocalBackup = async (id: string) => {
  try {
    const backups = await getLocalBackups();
    const updatedBackups = backups.filter(backup => backup.id !== id);
    await AsyncStorage.setItem(LOCAL_BACKUPS_KEY, JSON.stringify(updatedBackups));
  } catch (error) {
    console.error('Error deleting local backup:', error);
  }
};

export const saveLocalBackup = async (backup: LocalBackup) => {
  try {
    const backups = await getLocalBackups();
    const existingIndex = backups.findIndex(b => b.id === backup.id);
    let updatedBackups;
    if (existingIndex > -1) {
      updatedBackups = [...backups];
      updatedBackups[existingIndex] = backup;
    } else {
      updatedBackups = [...backups, backup];
    }
    await AsyncStorage.setItem(LOCAL_BACKUPS_KEY, JSON.stringify(updatedBackups));
  } catch (error) {
    console.error('Error saving local backup:', error);
  }
};
