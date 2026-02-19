import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useApp } from '../contexts/AppContext';

const screenWidth = Dimensions.get('window').width - 32;

export default function Dashboard() {
  const { state } = useApp();
  const expenses = state.expenses || [];

  // Last 7 days trend
  const last7 = useMemo(() => {
    const days: { label: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const amt = expenses.filter(e => e.date === key).reduce((s, x) => s + x.amount, 0);
      days.push({ label: d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0,3), amount: amt });
    }
    return days;
  }, [expenses]);

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value, color: '#0d9488', legendFontColor: '#374151', legendFontSize: 12 }));
  }, [expenses]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Spent</Text>
        <Text style={styles.cardAmount}>₹{totalSpent.toFixed(2)}</Text>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Spending (last 7 days)</Text>
        <LineChart
          data={{ labels: last7.map(d => d.label), datasets: [{ data: last7.map(d => d.amount) }] }}
          width={screenWidth}
          height={180}
          withDots={true}
          chartConfig={{
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: (opacity = 1) => `rgba(13,148,136, ${opacity})`,
            labelColor: () => '#6b7280',
            strokeWidth: 2,
            propsForDots: { r: '3' }
          }}
          bezier
          style={styles.chartRounded}
        />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>By Category</Text>
        {categoryBreakdown.length > 0 ? (
          <PieChart
            data={categoryBreakdown}
            width={screenWidth}
            height={160}
            chartConfig={{
              color: () => '#0d9488'
            }}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="0"
            center={[0, 0]}
            absolute
          />
        ) : (
          <Text style={styles.emptyText}>No category data yet</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, margin: 16, padding: 16 },
  cardAmount: { fontSize: 24, fontWeight: '900', marginTop: 8 },
  cardTitle: { color: '#6b7280', fontWeight: '700' },
  chartCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, marginHorizontal: 16, padding: 12 },
  chartRounded: { borderRadius: 12 },
  container: { flex: 1 },
  emptyText: { color: '#6b7280' },
  scrollContent: { paddingBottom: 24 },
  sectionTitle: { fontWeight: '800', marginBottom: 8 },
});