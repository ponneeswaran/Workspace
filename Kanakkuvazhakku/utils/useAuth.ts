import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getLocalBackups, deleteLocalBackup } from './storage';

export interface StoredUserData {
  name: string;
  mobile: string;
  email: string;
  language: string;
  currency: string;
  password?: string;
}

export const useAuth = () => {
  const [storedUser, setStoredUser] = useState<StoredUserData | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const session = await SecureStore.getItemAsync("user_session");
        if (session) {
          setStoredUser(JSON.parse(session));
        }
      } catch (error) {
        console.error("Error loading user data from storage:", error);
      }
    };
    loadUserData();
  }, []);

  const checkUserExists = (id: string) => {
    if (storedUser && (storedUser.email === id || storedUser.mobile === id)) {
      return true;
    }
    return false;
  };

  const login = async (id: string, pass: string) => {
    if (storedUser && (storedUser.email === id || storedUser.mobile === id) && storedUser.password === pass) {
      console.log('login success');
      return true;
    }
    console.log('login failed');
    return false;
  };

  return {
    storedUser,
    checkUserExists,
    login,
    getLocalBackups,
    deleteLocalBackup,
    // Add other auth-related functions here if they need to be shared
  };
};
