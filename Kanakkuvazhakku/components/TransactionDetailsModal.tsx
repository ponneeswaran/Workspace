import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Tag, Calendar, CreditCard, Clock, User, X } from 'lucide-react-native';
import { Expense, Income } from '../types';
import { useTranslation } from 'react-i18next';

type Props = {
  visible: boolean;
  item: (Expense & { type: 'expense' }) | (Income & { type: 'income' }) | null;
  onClose: () => void;
  onDelete: (id: string, type: 'expense' | 'income') => void;
};

export default function TransactionDetailsModal({ visible, item, onClose, onDelete }: Props) {
  const { t } = useTranslation();
  if (!item) return null;
  const isExpense = item.type === 'expense';

  const handleDelete = () => {
    Alert.alert(t('Delete Transaction'), t('delete_confirm_msg') || 'Are you sure?', [
      { text: t('Cancel') || 'Cancel', style: 'cancel' },
      { text: t('Delete') || 'Delete', style: 'destructive', onPress: () => { onDelete(item.id, isExpense ? 'expense' : 'income'); onClose(); } }
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel={t('Close') || 'Close'}>
              <X size={20} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.amount}>{isExpense ? '-' : '+'}₹{item.amount.toFixed(2)}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.content}>
            <View style={styles.rowItem}>
              <View style={styles.rowLeft}><Tag size={16} color="#6b7280" /></View>
              <Text style={styles.rowLabel}>{t('Category')}</Text>
              <Text style={styles.rowValue}>{t(item.category)}</Text>
            </View>

            <View style={styles.rowItem}>
              <View style={styles.rowLeft}><Calendar size={16} color="#6b7280" /></View>
              <Text style={styles.rowLabel}>{t('Date')}</Text>
              <Text style={styles.rowValue}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>

            {isExpense ? (
              <View style={styles.rowItem}>
                <View style={styles.rowLeft}><CreditCard size={16} color="#6b7280" /></View>
                <Text style={styles.rowLabel}>{t('Payment Method')}</Text>
                <Text style={styles.rowValue}>{t((item as Expense).paymentMethod)}</Text>
              </View>
            ) : (
              <>
                <View style={styles.rowItem}>
                  <View style={styles.rowLeft}><Clock size={16} color="#6b7280" /></View>
                  <Text style={styles.rowLabel}>{t('Recurrence')}</Text>
                  <Text style={styles.rowValue}>{t((item as Income).recurrence)}</Text>
                </View>
                <View style={styles.rowItem}>
                  <View style={styles.rowLeft}><User size={16} color="#6b7280" /></View>
                  <Text style={styles.rowLabel}>{t('Status')}</Text>
                  <Text style={[styles.rowValue, (item as Income).status === 'Received' ? styles.statusReceived : (item as Income).status === 'Overdue' ? styles.statusOverdue : {}]}>{t((item as Income).status)}</Text>
                </View>
              </>
            )}

            <View style={styles.spacerSmall} />
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} accessibilityRole="button" accessibilityLabel={t('Delete Transaction') || 'Delete Transaction'}>
              <Text style={styles.deleteText}>{t('Delete Transaction') || 'Delete Transaction'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  amount: { fontSize: 20, fontWeight: '900' },
  backdrop: { backgroundColor: 'rgba(0,0,0,0.5)', flex: 1, justifyContent: 'center', padding: 20 },
  closeBtn: { padding: 8 },
  content: { padding: 16 },
  deleteButton: { alignItems: 'center', borderColor: '#fee2e2', borderRadius: 8, borderWidth: 1, marginTop: 12, padding: 12 },
  deleteText: { color: '#ef4444', fontWeight: '700' },
  header: { alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  headerSpacer: { width: 40 },
  rowItem: { alignItems: 'center', flexDirection: 'row', paddingVertical: 8 },
  rowLabel: { color: '#6b7280', flex: 1 },
  rowLeft: { alignItems: 'center', width: 28 },
  rowValue: { fontWeight: '700' },
  sheet: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  spacerSmall: { height: 12 },
  statusOverdue: { color: '#ef4444' },
  statusReceived: { color: '#10B981' },
});