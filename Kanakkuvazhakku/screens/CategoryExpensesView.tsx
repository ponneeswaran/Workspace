import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, TextInput } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../contexts/AppContext';
import { Transaction, Expense } from '../types';
import TransactionDetailsModal from '../components/TransactionDetailsModal';
import DatePicker from '../components/DatePicker';
import { Trash } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

type RouteProps = RouteProp<RootStackParamList, 'CategoryExpenses'>;

export default function CategoryExpensesView() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { state, deleteExpense } = useApp();
  const category = route.params?.category || 'Other';

  // Filters & sorting (added parity with web)
  const [sortOption, setSortOption] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const dateError = startDate && endDate && startDate > endDate ? 'Start date cannot be after end date' : '';
  const amountError = minAmount && maxAmount && Number(minAmount) > Number(maxAmount) ? 'Min amount cannot be greater than max' : '';

  const filteredAndSorted = useMemo(() => {
    if (dateError || amountError) return [] as Expense[];
    let list = state.expenses.filter(e => e.category === category);

    if (startDate) list = list.filter(e => e.date >= startDate);
    if (endDate) list = list.filter(e => e.date <= endDate);
    if (minAmount) list = list.filter(e => e.amount >= Number(minAmount));
    if (maxAmount) list = list.filter(e => e.amount <= Number(maxAmount));

    list = list.sort((a, b) => {
      switch (sortOption) {
        case 'date-asc': return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc': return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'amount-asc': return a.amount - b.amount;
        case 'amount-desc': return b.amount - a.amount;
        default: return 0;
      }
    });

    return list;
  }, [state.expenses, category, startDate, endDate, minAmount, maxAmount, sortOption, dateError, amountError]);

  const total = filteredAndSorted.reduce((s, x) => s + x.amount, 0);
  const count = filteredAndSorted.length;

  const sections = useMemo(() => {
    const map = new Map<string, Expense[]>();
    filteredAndSorted.forEach(item => {
      const dateLabel = new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      if (!map.has(dateLabel)) map.set(dateLabel, []);
      map.get(dateLabel)!.push(item);
    });
    return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
  }, [filteredAndSorted]);

  const [selected, setSelected] = useState<Transaction | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{category}</Text>
          <Text style={styles.subtitle}>{count} items • Total: ₹{total.toFixed(2)}</Text>
        </View>

        <View style={styles.controls}>
          <Picker selectedValue={sortOption} style={styles.picker} onValueChange={(v) => setSortOption(v as typeof sortOption)}>
            <Picker.Item label="Date ▲" value="date-asc" />
            <Picker.Item label="Date ▼" value="date-desc" />
            <Picker.Item label="Amount ▲" value="amount-asc" />
            <Picker.Item label="Amount ▼" value="amount-desc" />
          </Picker>

          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilters(s => !s)} accessibilityRole="button" accessibilityLabel={showFilters ? 'Hide filters' : 'Show filters'}>
            <Text style={styles.filterBtnText}>{showFilters ? 'Hide filters' : 'Show filters'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearBtn} onPress={() => { setStartDate(''); setEndDate(''); setMinAmount(''); setMaxAmount(''); setShowFilters(false); setSortOption('date-desc'); }} accessibilityRole="button" accessibilityLabel="Clear filters">
            <Trash size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {showFilters && (
        <View style={styles.filterPanel}>
          <View style={styles.rowInline}>
            <View style={styles.flexItem}>
              <Text style={styles.label}>Start date</Text>
              <DatePicker dateIso={startDate || new Date().toISOString().split('T')[0]} onChange={(d) => setStartDate(d)} />
            </View>
            <View style={styles.flexItem}>
              <Text style={styles.label}>End date</Text>
              <DatePicker dateIso={endDate || new Date().toISOString().split('T')[0]} onChange={(d) => setEndDate(d)} />
            </View>
          </View>

          <View style={styles.rowInline}>
            <View style={styles.flexItem}>
              <Text style={styles.label}>Min amount</Text>
              <TextInput keyboardType="numeric" value={minAmount} onChangeText={setMinAmount} style={styles.input} placeholder="0" accessibilityLabel="Minimum amount" />
            </View>
            <View style={styles.flexItem}>
              <Text style={styles.label}>Max amount</Text>
              <TextInput keyboardType="numeric" value={maxAmount} onChangeText={setMaxAmount} style={styles.input} placeholder="0" accessibilityLabel="Maximum amount" />
            </View>
          </View>

          {(dateError || amountError) ? (
            <Text style={styles.errorText}>{dateError || amountError}</Text>
          ) : null}
        </View>
      )}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => setSelected(item)}>
            <View style={styles.left}>
              <Text style={styles.title}>{item.description}</Text>
              <Text style={styles.meta}>{new Date(item.date).toLocaleDateString()} • {item.paymentMethod}</Text>
            </View>
            <Text style={styles.amount}>-₹{item.amount.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{dateError || amountError ? (dateError || amountError) : 'No transactions match the filters'}</Text>}
        contentContainerStyle={styles.listContent}
      />

      {selected && (
        <TransactionDetailsModal visible={true} item={{ ...(selected as Expense), type: 'expense' }} onClose={() => setSelected(null)} onDelete={(id: string) => { deleteExpense(id); setSelected(null); navigation.goBack(); }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  amount: { color: '#ef4444', fontWeight: '800' },
  clearBtn: { marginLeft: 8, padding: 8 },
  container: { flex: 1, padding: 16 },
  controls: { alignItems: 'center', flexDirection: 'row' },
  empty: { color: '#6b7280', marginTop: 40, textAlign: 'center' },
  errorText: { color: '#ef4444', marginTop: 8 },
  filterBtn: { backgroundColor: '#f3f4f6', borderRadius: 8, marginLeft: 8, paddingHorizontal: 12, paddingVertical: 8 },
  filterBtnText: { color: '#374151', fontWeight: '700' },
  filterPanel: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 12, padding: 12 },
  flexItem: { flex: 1, marginRight: 8 },
  header: { marginBottom: 12 },
  headerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  input: { borderColor: '#e5e7eb', borderRadius: 8, borderWidth: 1, padding: 8 },
  label: { color: '#6b7280', marginBottom: 6 },
  left: { flex: 1, marginRight: 8 },
  listContent: { paddingBottom: 80 },
  meta: { color: '#6b7280', marginTop: 4 },
  picker: { height: 36, width: 140 },
  row: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, padding: 12 },
  rowInline: { flexDirection: 'row', justifyContent: 'space-between' },
  sectionHeader: { color: '#6b7280', fontWeight: '700', paddingHorizontal: 4, paddingVertical: 8 },
  subtitle: { color: '#6b7280', marginTop: 4 },
  title: { fontSize: 20, fontWeight: '800' },
});