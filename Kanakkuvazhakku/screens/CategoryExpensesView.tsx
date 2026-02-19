import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../contexts/AppContext';
import { Transaction, Expense } from '../types';
import TransactionDetailsModal from '../components/TransactionDetailsModal';

type RouteProps = RouteProp<RootStackParamList, 'CategoryExpenses'>;

export default function CategoryExpensesView() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { state } = useApp();
  const category = route.params?.category || 'Other';

  const transactions = useMemo(() => state.expenses.filter(e => e.category === category).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [state.expenses, category]);

  const total = transactions.reduce((s, x) => s + x.amount, 0);

  const sections = useMemo(() => {
    const map = new Map<string, Expense[]>();
    transactions.forEach(item => {
      const dateLabel = new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      if (!map.has(dateLabel)) map.set(dateLabel, []);
      map.get(dateLabel)!.push(item);
    });
    return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
  }, [transactions]);

  const [selected, setSelected] = useState<Transaction | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{category}</Text>
        <Text style={styles.subtitle}>Total: ₹{total.toFixed(2)}</Text>
      </View>

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
        ListEmptyComponent={<Text style={styles.empty}>No transactions in this category</Text>}
        contentContainerStyle={styles.listContent}
      />

      {selected && (
        <TransactionDetailsModal visible={true} item={{ ...(selected as Expense), type: 'expense' }} onClose={() => setSelected(null)} onDelete={() => { setSelected(null); navigation.goBack(); }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  amount: { color: '#ef4444', fontWeight: '800' },
  container: { flex: 1, padding: 16 },
  empty: { color: '#6b7280', marginTop: 40, textAlign: 'center' },
  header: { marginBottom: 12 },
  left: { flex: 1, marginRight: 8 },
  listContent: { paddingBottom: 80 },
  meta: { color: '#6b7280', marginTop: 4 },
  row: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, padding: 12 },
  sectionHeader: { color: '#6b7280', fontWeight: '700', paddingHorizontal: 4, paddingVertical: 8 },
  subtitle: { color: '#6b7280', marginTop: 4 },
  title: { fontSize: 20, fontWeight: '800' },
});