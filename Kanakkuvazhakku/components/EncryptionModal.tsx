import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

type Props = {
  isOpen: boolean;
  mode: 'encrypt' | 'decrypt';
  onClose: () => void;
  onConfirm: (password?: string) => void;
};

export default function EncryptionModal({ isOpen, mode, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{mode === 'encrypt' ? t('Encrypt Backup') : t('Decrypt Backup')}</Text>
          <TextInput placeholder={t('Enter password (optional)')} value={password} onChangeText={setPassword} secureTextEntry style={styles.input} accessibilityLabel={t('Enter password (optional)') || 'Backup password (optional)'} />
          <View style={styles.row}>
            <TouchableOpacity onPress={onClose} style={styles.btnSecondary} accessibilityRole="button" accessibilityLabel={t('Cancel') || 'Cancel'}><Text>{t('Cancel')}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { onConfirm(password || undefined); setPassword(''); }} style={styles.btnPrimary} accessibilityRole="button" accessibilityLabel={t('Confirm') || 'Confirm'}><Text style={styles.confirmText}>{t('Confirm') || 'Confirm'}</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.5)', flex: 1, justifyContent: 'center', padding: 20 },
  btnPrimary: { backgroundColor: '#0d9488', borderRadius: 8, padding: 10 },
  btnSecondary: { marginRight: 8, padding: 10 },
  confirmText: { color: '#fff' },
  input: { backgroundColor: '#f8fafc', borderColor: '#e6e9ee', borderRadius: 10, borderWidth: 1, padding: 12 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  sheet: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
});