import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { User } from 'phosphor-react-native';
import { useApp } from '../contexts/AppContext';
import { Transaction } from '../types';

const HistoryView: React.FC = () => {
  const { state } = useApp();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const theme = useTheme();

  const onProfilePress = () => {
    navigation.navigate('Profile');
  };

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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>History</Text>
        <TouchableOpacity onPress={onProfilePress} style={[styles.profileButton, { backgroundColor: colors.border }]}>
          <User size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
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
  profileButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default HistoryView;