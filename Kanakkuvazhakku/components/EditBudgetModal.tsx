import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Budget, Category } from '../types';

type Props = {
  visible: boolean;
  category: Category | null;
  initial?: Budget | null;
  onClose: () => void;
  onSave: (budget: Budget | null) => void; // null => remove
};

export default function EditBudgetModal({ visible, category, initial, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const [limit, setLimit] = useState('');

  useEffect(() => {
    setLimit(initial ? String(initial.limit) : '');
  }, [initial, visible]);

  const handleSave = () => {
    if (!category) return onClose();
    const parsed = parseFloat(limit);
    if (!limit || isNaN(parsed) || parsed <= 0) {
      // treat empty/invalid as remove
      onSave(null);
      onClose();
      return;
    }
    onSave({ category, limit: parsed });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{t('Edit Budget') || 'Edit Budget'}</Text>
          <Text style={styles.label}>{category}</Text>
          <TextInput keyboardType="numeric" value={limit} onChangeText={setLimit} placeholder="0.00" style={styles.input} />

          <View style={styles.row}>
            <TouchableOpacity onPress={onClose} style={styles.btnSecondary}><Text>{t('Cancel') || 'Cancel'}</Text></TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.btnPrimary}><Text style={styles.btnPrimaryText}>{t('Save') || 'Save'}</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.5)', flex: 1, justifyContent: 'center', padding: 20 },
  btnPrimary: { backgroundColor: '#0d9488', borderRadius: 8, padding: 10 },
  btnPrimaryText: { color: '#fff' },
  btnSecondary: { marginRight: 8, padding: 10 },
  input: { backgroundColor: '#f8fafc', borderColor: '#e6e9ee', borderRadius: 10, borderWidth: 1, padding: 12 },
  label: { color: '#6b7280', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  sheet: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
});