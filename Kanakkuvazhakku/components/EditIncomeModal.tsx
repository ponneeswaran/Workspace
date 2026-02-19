import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';
import DatePicker from './DatePicker';
import { Income, IncomeCategory, Recurrence } from '../types';

type Props = {
  visible: boolean;
  income: Income | null;
  onClose: () => void;
  onSave: (income: Income) => void;
};

const INCOME_CATEGORIES: IncomeCategory[] = ['Salary','Rent','Interest','Business','Gift','Other'];
const RECURRENCE_OPTIONS: Recurrence[] = ['None','Monthly','Yearly'];

export default function EditIncomeModal({ visible, income, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<IncomeCategory>('Salary');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [recurrence, setRecurrence] = useState<Recurrence>('None');
  const [errors, setErrors] = useState<{ amount?: string; source?: string }>({});

  React.useEffect(() => {
    if (income) {
      setAmount(String(income.amount));
      setCategory(income.category);
      setSource(income.source);
      setDate(income.date);
      setRecurrence(income.recurrence);
      setErrors({});
    }
  }, [income]);

  const validate = () => {
    const errs: { amount?: string; source?: string } = {};
    const a = parseFloat(amount);
    if (!amount || isNaN(a) || a <= 0) errs.amount = t('valid_amount_required') || 'Valid amount required';
    if (!source.trim()) errs.source = t('source_required') || 'Source required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!income) return onClose();
    if (!validate()) return;
    const a = parseFloat(amount);
    const today = new Date().toISOString().split('T')[0];
    const status: Income['status'] = date <= today ? 'Received' : 'Expected';
    const updated: Income = { ...income, amount: a, category, source: source.trim(), date, recurrence, status };
    onSave(updated);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{t('Edit Income') || 'Edit Income'}</Text>

          <Text style={styles.label}>{t('Amount') || 'Amount'}</Text>
          <TextInput keyboardType="numeric" value={amount} onChangeText={setAmount} placeholder="0.00" style={[styles.input, errors.amount && styles.inputError]} />

          <Text style={styles.label}>{t('Source') || 'Source'}</Text>
          <TextInput value={source} onChangeText={setSource} placeholder="Employer / Tenant" style={[styles.input, errors.source && styles.inputError]} />

          <Text style={styles.label}>{t('Category') || 'Category'}</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={category} onValueChange={(v) => setCategory(v as IncomeCategory)}>
              {INCOME_CATEGORIES.map(c => <Picker.Item key={c} label={c} value={c} />)}
            </Picker>
          </View>

          <Text style={styles.label}>{t('Date') || 'Date'}</Text>
          <DatePicker dateIso={date} onChange={setDate} style={styles.datePicker} />

          <Text style={styles.label}>{t('Recurrence') || 'Recurrence'}</Text>
          <View style={styles.rowBtns}>
            {RECURRENCE_OPTIONS.map(r => (
              <TouchableOpacity key={r} onPress={() => setRecurrence(r)} style={[styles.smallBtn, recurrence === r && styles.smallBtnActive]}>
                <Text style={recurrence === r ? styles.smallBtnTextActive : styles.smallBtnText}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.btnSecondary}><Text>{t('Cancel') || 'Cancel'}</Text></TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.btnPrimary}><Text style={styles.btnPrimaryText}>{t('Save Changes') || 'Save Changes'}</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  backdrop: { backgroundColor: 'rgba(0,0,0,0.5)', flex: 1, justifyContent: 'center', padding: 20 },
  btnPrimary: { backgroundColor: '#0d9488', borderRadius: 8, padding: 10 },
  btnPrimaryText: { color: '#fff' },
  btnSecondary: { marginRight: 8, padding: 10 },
  datePicker: { marginBottom: 8 },
  input: { backgroundColor: '#f8fafc', borderColor: '#e6e9ee', borderRadius: 10, borderWidth: 1, marginBottom: 8, padding: 12 },
  inputError: { borderColor: '#ef4444' },
  label: { color: '#6b7280', marginBottom: 6, marginTop: 8 },
  pickerWrap: { backgroundColor: '#f8fafc', borderRadius: 10, marginBottom: 8 },
  rowBtns: { flexDirection: 'row', marginBottom: 12 },
  sheet: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  smallBtn: { alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 8, marginRight: 8, padding: 8 },
  smallBtnActive: { backgroundColor: '#111827' },
  smallBtnText: { color: '#374151' },
  smallBtnTextActive: { color: '#fff' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
});