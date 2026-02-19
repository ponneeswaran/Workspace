import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Alert } from 'react-native';
import { useApp } from '../contexts/AppContext';
import { Income } from '../types';
import { DollarSign, Check } from 'lucide-react-native';
import TransactionDetailsModal from '../components/TransactionDetailsModal';
import EditIncomeModal from '../components/EditIncomeModal';

export default function IncomeView() {
  const { state, deleteIncome, updateIncome } = useApp();
  const [selected, setSelected] = useState<Income | null>(null);
  const [editing, setEditing] = useState<Income | null>(null);

  const incomes = state.incomes || [];

  const sections = useMemo(() => {
    const map = new Map<string, Income[]>();
    incomes.forEach(i => {
      const label = new Date(i.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(i);
    });
    return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
  }, [incomes]);

  const confirmDelete = (id: string) => {
    Alert.alert('Delete income', 'Are you sure you want to delete this income?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteIncome(id) },
    ]);
  };

  const markReceived = (item: Income) => {
    if (item.status === 'Received') return;
    updateIncome({ ...item, status: 'Received' });
  };

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => setSelected(item)}>
            <View style={styles.left}>
              <View style={styles.iconWrap}><DollarSign size={18} color="#10B981" /></View>
              <View style={styles.main}>
                <Text style={styles.title}>{item.source}</Text>
                <Text style={styles.subtitle}>{item.category} • {new Date(item.date).toLocaleDateString()}</Text>
              </View>
            </View>

            <View style={styles.right}>
              <Text style={styles.amount}>+₹{item.amount.toFixed(2)}</Text>
              <View style={styles.actions}>
                {item.status !== 'Received' && (
                  <TouchableOpacity onPress={() => markReceived(item)} style={styles.okBtn}><Check size={14} color="#fff" /></TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setEditing(item)} style={styles.editBtn}><Text style={styles.editText}>Edit</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.delBtn}><Text style={styles.delText}>Delete</Text></TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No incomes yet</Text>}
        contentContainerStyle={styles.listContent}
      />

      {selected && (
        <TransactionDetailsModal visible={true} item={{ ...selected, type: 'income' }} onClose={() => setSelected(null)} onDelete={(id) => { confirmDelete(id); setSelected(null); }} />
      )}

      {editing && (
        <EditIncomeModal
          visible={true}
          income={editing}
          onClose={() => setEditing(null)}
          onSave={(updated: Income) => { updateIncome(updated); setEditing(null); }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', marginTop: 8 },
  amount: { color: '#10B981', fontWeight: '800' },
  container: { flex: 1 },
  delBtn: { marginLeft: 8 },
  delText: { color: '#ef4444' },
  editBtn: { marginLeft: 8 },
  editText: { color: '#0d9488' },
  empty: { color: '#6B7280', marginTop: 40, textAlign: 'center' },
  iconWrap: { alignItems: 'center', backgroundColor: '#ECFEF9', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  left: { alignItems: 'center', flexDirection: 'row' },
  listContent: { paddingBottom: 80 },
  main: { marginLeft: 12 },
  okBtn: { backgroundColor: '#10B981', borderRadius: 6, padding: 6 },
  right: { alignItems: 'flex-end' },
  row: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, marginHorizontal: 16, padding: 12 },
  sectionHeader: { color: '#6B7280', fontWeight: '700', paddingHorizontal: 20, paddingVertical: 8 },
  subtitle: { color: '#6B7280', fontSize: 12 },
  title: { fontSize: 16, fontWeight: '700' },
});