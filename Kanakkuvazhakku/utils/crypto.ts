import CryptoJS from 'crypto-js';

// Simple AES-based helpers for encrypting/decrypting backup payloads.
export function encryptBackup(plaintext: string, password: string): string {
  return CryptoJS.AES.encrypt(plaintext, password).toString();
}

export function decryptBackup(ciphertext: string, password: string): string | null {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, password);
    const txt = bytes.toString(CryptoJS.enc.Utf8);
    return txt || null;
  } catch {
    return null;
  }
}
