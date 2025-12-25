import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useApp } from '../contexts/AppContext';
import { Transaction } from '../types';

const HistoryView: React.FC = () => {
  const { state } = useApp();

  const transactions: Transaction[] = [...state.expenses, ...state.incomes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.item}>
      <Text style={styles.description}>
        {'description' in item ? item.description : item.source}
      </Text>
      <Text style={[styles.amount, 'category' in item ? styles.expense : styles.income]}>
        {'category' in item ? '-' : '+'}₹{item.amount}
      </Text>
      <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  date: {
    color: '#6B7280',
    fontSize: 12,
  },
  description: {
    flex: 1,
    fontSize: 16,
  },
  expense: {
    color: '#EF4444',
  },
  income: {
    color: '#10B981',
  },
  item: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 5,
    padding: 15,
  },
});

export default HistoryView;