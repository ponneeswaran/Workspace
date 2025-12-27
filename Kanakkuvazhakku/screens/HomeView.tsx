import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Sparkles, ArrowDown, ArrowUp } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { useApp } from '../contexts/AppContext';

const HomeView: React.FC = () => {
  const { state } = useApp();
  const { user } = state;

  const totalIncome = state.incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpense = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Ledger Summary</Text>
          <Text style={styles.subtitle}>Welcome, {user?.name || 'User'}</Text>
        </View>
        <View style={styles.profileIcon}>
          <Text style={styles.profileIconText}>{user?.name?.charAt(0).toUpperCase() || 'P'}</Text>
        </View>
      </View>

      <View style={styles.aiInsightCard}>
        <Sparkles size={24} color="#FFFFFF" />
        <View style={styles.aiInsightTextContainer}>
          <Text style={styles.aiInsightTitle}>AI ASSISTANT INSIGHT</Text>
          <Text style={styles.aiInsightText}>Keep tracking your expenses to see insights!</Text>
        </View>
      </View>
      
      <View style={styles.timeFrameContainer}>
        <Text style={styles.timeFrameLabel}>Ledger time frame:</Text>
        <Picker
          selectedValue="Monthly"
          style={styles.picker}
          onValueChange={(itemValue) => console.log(itemValue)}
        >
          <Picker.Item label="Monthly" value="Monthly" />
          <Picker.Item label="Yearly" value="Yearly" />
        </Picker>
      </View>

      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <View style={styles.summaryHeader}>
            <ArrowDown size={16} color="#10B981" />
            <Text style={styles.summaryTitle}>INCOME</Text>
          </View>
          <Text style={styles.summaryAmount}>₹{totalIncome}</Text>
          <Text style={styles.summaryPeriod}>Total for Period</Text>
        </View>

        <View style={[styles.summaryCard, styles.expenseCard]}>
          <View style={styles.summaryHeader}>
            <ArrowUp size={16} color="#EF4444" />
            <Text style={styles.summaryTitle}>EXPENSE</Text>
          </View>
          <Text style={styles.summaryAmount}>₹{totalExpense}</Text>
          <Text style={styles.summaryPeriod}>Total for Period</Text>
          <Text style={styles.summaryToday}>₹0 Today</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  aiInsightCard: {
    alignItems: 'center',
    backgroundColor: '#14B8A6',
    borderRadius: 10,
    flexDirection: 'row',
    marginBottom: 20,
    padding: 20,
  },
  aiInsightText: {
    color: '#FFFFFF',
  },
  aiInsightTextContainer: {
    marginLeft: 15,
  },
  aiInsightTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  container: {
    backgroundColor: '#F1F5F9',
    flex: 1,
    padding: 20,
  },
  expenseCard: {
    backgroundColor: '#FEE2E2',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  incomeCard: {
    backgroundColor: '#D1FAE5',
  },
  picker: {
    backgroundColor: '#FFFFFF',
    width: 150,
  },
  profileIcon: {
    alignItems: 'center',
    backgroundColor: '#0D9488',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  profileIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 16,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  summaryCard: {
    borderRadius: 10,
    padding: 20,
    width: '48%',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  summaryPeriod: {
    color: '#6B7280',
  },
  summaryTitle: {
    color: '#4B5563',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  summaryToday: {
    color: '#6B7280',
    marginTop: 10,
  },
  timeFrameContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeFrameLabel: {
    color: '#475569',
    fontSize: 16,
  },
  title: {
    color: '#1E293B',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default HomeView;