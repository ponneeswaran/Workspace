import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../contexts/AppContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const screenWidth = Dimensions.get('window').width;

const HomeView: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const totalIncome = state.incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpense = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const netBalance = totalIncome - totalExpense;

  // Sample data for charts
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      data: [20, 45, 28, 80, 99],
    }],
  };

  const pieData: Array<{ name: string; amount: number; color: string; legendFontColor: string }> = state.expenses.reduce(
    (acc: Array<{ name: string; amount: number; color: string; legendFontColor: string }>, exp) => {
    const existing = acc.find(item => item.name === exp.category);
    if (existing) {
      existing.amount += exp.amount;
    } else {
      acc.push({ name: exp.category, amount: exp.amount, color: '#0F766E', legendFontColor: '#0F766E' });
    }
    return acc;
    },
    [],
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Period Expense</Text>
        <Text style={styles.cardValue}>₹{totalExpense}</Text>
      </View>
      <View style={styles.insight}>
        <Text style={styles.insightText}>AI Insight: You&apos;re spending more on food this month!</Text>
      </View>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Spending Trends</Text>
        <LineChart
          data={lineData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#FFFFFF',
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(15, 118, 110, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(15, 118, 110, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#0F766E',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Category Breakdown</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(15, 118, 110, ${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={() => { dispatch({ type: 'SET_AUTHENTICATED', payload: false }); navigation.replace('Auth'); }}>
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    elevation: 3,
    marginBottom: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    color: '#0D9488',
    fontSize: 14,
  },
  cardValue: {
    color: '#0F766E',
    fontSize: 24,
    fontWeight: 'bold',
  },
  chart: {
    borderRadius: 16,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 20,
    padding: 20,
  },
  chartTitle: {
    color: '#0F766E',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  container: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    padding: 20,
  },
  insight: {
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
  },
  insightText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 15,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  negative: {
    color: '#EF4444',
  },
  positive: {
    color: '#10B981',
  },
});

export default HomeView;