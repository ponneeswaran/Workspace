import React, { useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../contexts/AppContext';
import { Category, Transaction, Expense, Income } from '../types';
import { Trash, Search } from 'lucide-react-native';
import TransactionDetailsModal from './TransactionDetailsModal';

const CATEGORY_PILLS: (Category | 'All')[] = ['All','Food','Transport','Entertainment','Utilities','Healthcare','Shopping','Housing','Other'];

export default function ExpenseList() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { state, deleteExpense, deleteIncome, restoreExpense, restoreIncome } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [deleted, setDeleted] = useState<{ item: Expense | Income; type: 'expense' | 'income' } | null>(null);
  const undoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const transactions: Transaction[] = useMemo(() => {
    const receivedIncomes = state.incomes.filter(i => (i as Income).status === 'Received');
    return [...state.expenses, ...receivedIncomes].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.expenses, state.incomes]);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;
      const searchKey = 'description' in t ? t.description : t.source;
      if (search && !searchKey.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, selectedCategory, search]);

  const sections = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    filtered.forEach(item => {
      const dateLabel = new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      if (!map.has(dateLabel)) map.set(dateLabel, []);
      map.get(dateLabel)!.push(item);
    });
    return Array.from(map.entries()).map(([title,data]) => ({ title, data }));
  }, [filtered]);

  const onDelete = (id: string, type: 'expense' | 'income') => {
    if (type === 'expense') {
      const item = state.expenses.find(e => e.id === id);
      if (!item) return;
      setDeleted({ item, type });
      deleteExpense(id);
    } else {
      const item = state.incomes.find(i => i.id === id);
      if (!item) return;
      setDeleted({ item, type });
      deleteIncome(id);
    }

    if (undoRef.current) clearTimeout(undoRef.current);
    undoRef.current = setTimeout(() => setDeleted(null), 4000);
  };

  const handleUndo = () => {
    if (!deleted) return;
    if (deleted.type === 'expense') restoreExpense(deleted.item as Expense);
    else restoreIncome(deleted.item as Income);
    setDeleted(null);
    if (undoRef.current) clearTimeout(undoRef.current);
  };

  const [selectedItem, setSelectedItem] = useState<Transaction | null>(null);

  const renderItem = ({ item }: { item: Transaction }) => {
    const isExpense = 'description' in item;
    return (
      <TouchableOpacity onPress={() => setSelectedItem(item)} style={styles.row}>
        <View style={styles.left}>
          <View style={[styles.avatar, isExpense ? styles.avatarExpense : styles.avatarIncome]}>
            <Text style={styles.avatarText}>{isExpense ? (item as Expense).category[0] : '💰'}</Text>
          </View>
          <View style={styles.itemMain}>
            <Text style={styles.title}>{isExpense ? (item as Expense).description : (item as Income).source}</Text>
            <Text style={styles.subtitle}>{item.category} • {new Date(item.date).toLocaleDateString()}</Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text style={[styles.amount, isExpense ? styles.amountExpense : styles.amountIncome]}>{isExpense ? '-' : '+'}₹{item.amount.toFixed(2)}</Text>
          <TouchableOpacity onPress={() => onDelete(item.id, isExpense ? 'expense' : 'income')} style={styles.deleteBtn}>
            <Trash size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const closeDetails = () => setSelectedItem(null);
  const handleDeleteFromDetails = (id: string, type: 'expense' | 'income') => { onDelete(id, type); closeDetails(); };


  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.searchWrap}>
          <Search color="#6b7280" />
          <TextInput placeholder="Search" value={search} onChangeText={setSearch} style={styles.searchInput} />
        </View>
      </View>

      <View style={styles.pillsRow}>
        {CATEGORY_PILLS.map(c => (
          <TouchableOpacity
            key={c}
            onPress={() => setSelectedCategory(c)}
            onLongPress={() => navigation.navigate('CategoryExpenses', { category: c })}
            style={[styles.pill, selectedCategory === c && styles.pillActive]}
          >
            <Text style={selectedCategory === c ? styles.pillTextActive : styles.pillText}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
        ListEmptyComponent={<Text style={styles.empty}>No transactions</Text>}
        contentContainerStyle={styles.sectionPadding}
      />

      {deleted && (
        <View style={styles.undoBar}>
          <Text style={styles.undoText}>Deleted</Text>
          <TouchableOpacity onPress={handleUndo}><Text style={styles.undoAction}>Undo</Text></TouchableOpacity>
        </View>
      )}

      {/* Transaction details modal */}
      {selectedItem && (
        <TransactionDetailsModal
          visible={true}
          item={'description' in selectedItem ? ({ ...(selectedItem as Expense), type: 'expense' }) : ({ ...(selectedItem as Income), type: 'income' })}
          onClose={closeDetails}
          onDelete={handleDeleteFromDetails}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  amount: { fontWeight: '800' },
  amountExpense: { color: '#EF4444' },
  amountIncome: { color: '#10B981' },
  avatar: { alignItems: 'center', borderRadius: 22, height: 44, justifyContent: 'center', marginRight: 12, width: 44 },
  avatarExpense: { backgroundColor: '#FEF2F2' },
  avatarIncome: { backgroundColor: '#ECFEF9' },
  avatarText: { fontWeight: '700' },
  container: { flex: 1 },
  deleteBtn: { marginTop: 8 },
  empty: { color: '#6B7280', marginTop: 40, textAlign: 'center' },
  headerRow: { padding: 12, paddingTop: 6 },
  itemMain: { flex: 1 },
  left: { alignItems: 'center', flexDirection: 'row', flex: 1 },
  pill: { backgroundColor: '#F8FAFC', borderRadius: 20, marginBottom: 8, marginRight: 8, paddingHorizontal: 12, paddingVertical: 6 },
  pillActive: { backgroundColor: '#111827' },
  pillText: { color: '#374151' },
  pillTextActive: { color: '#fff' },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 8, paddingHorizontal: 12 },
  right: { alignItems: 'flex-end' },
  row: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, marginHorizontal: 16, padding: 12 },
  searchInput: { flex: 1, marginLeft: 8 },
  searchWrap: { alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, flexDirection: 'row', padding: 8 },
  sectionHeader: { color: '#6B7280', fontWeight: '700', paddingHorizontal: 20, paddingVertical: 8 },
  sectionPadding: { paddingBottom: 80 },
  subtitle: { color: '#6B7280', fontSize: 12 },
  title: { fontSize: 16, fontWeight: '700' },
  undoAction: { color: '#fff', fontWeight: '700', marginLeft: 12 },
  undoBar: { alignItems: 'center', backgroundColor: '#111827', borderRadius: 12, bottom: 16, flexDirection: 'row', justifyContent: 'center', left: 16, padding: 12, position: 'absolute', right: 16 },
  undoText: { color: '#fff' },
});