import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { getLocalBackups, deleteLocalBackup } from './storage';

export interface StoredUserData {
  name: string;
  mobile: string;
  email: string;
  language: string;
  currency: string;
  password?: string;
  biometricEnabled?: boolean;
  profilePicture?: string; // base64/data URL or local URI
}



export const useAuth = () => {
  const [storedUser, setStoredUser] = useState<StoredUserData | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const session = await SecureStore.getItemAsync("user_session");
        if (session) {
          const parsed = JSON.parse(session) as StoredUserData;
          // ensure older records without biometric flag behave correctly
          setStoredUser({ ...parsed, biometricEnabled: parsed.biometricEnabled ?? false });
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

  const resetPassword = async (id: string, newPassword: string) => {
    if (!storedUser) return false;
    if (storedUser.email !== id && storedUser.mobile !== id) return false;
    const updated: StoredUserData = { ...storedUser, password: newPassword };
    try {
      await SecureStore.setItemAsync('user_session', JSON.stringify(updated));
      setStoredUser(updated);
      return true;
    } catch (error) {
      console.error('resetPassword failed', error);
      return false;
    }
  };

  const checkBiometricAvailability = async (id: string) => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) return false;
      if (!storedUser) return false;
      if (storedUser.email !== id && storedUser.mobile !== id) return false;
      return Boolean(storedUser.biometricEnabled);
    } catch (error) {
      console.error('checkBiometricAvailability error', error);
      return false;
    }
  };

  const verifyBiometricLogin = async (id: string) => {
    if (!storedUser) return false;
    if (storedUser.email !== id && storedUser.mobile !== id) return false;
    if (!storedUser.biometricEnabled) return false;
    try {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Authenticate to login' });
      return result.success;
    } catch (error) {
      console.error('verifyBiometricLogin error', error);
      return false;
    }
  };

  const setBiometricEnabled = async (id: string, enabled: boolean) => {
    if (!storedUser) return false;
    if (storedUser.email !== id && storedUser.mobile !== id) return false;
    const updated: StoredUserData = { ...storedUser, biometricEnabled: enabled };
    try {
      await SecureStore.setItemAsync('user_session', JSON.stringify(updated));
      setStoredUser(updated);
      return true;
    } catch (error) {
      console.error('setBiometricEnabled failed', error);
      return false;
    }
  };

  const updateProfile = async (patch: Partial<StoredUserData>) => {
    if (!storedUser) return false;
    const updated: StoredUserData = { ...storedUser, ...patch };
    try {
      await SecureStore.setItemAsync('user_session', JSON.stringify(updated));
      setStoredUser(updated);
      return true;
    } catch (error) {
      console.error('updateProfile failed', error);
      return false;
    }
  };

  return {
    storedUser,
    checkUserExists,
    login,
    resetPassword,
    checkBiometricAvailability,
    verifyBiometricLogin,
    setBiometricEnabled,
    updateProfile,
    getLocalBackups,
    deleteLocalBackup,
  };
};
