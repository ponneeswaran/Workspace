import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '../contexts/AppContext';
import { Category, Budget } from '../types';
import EditBudgetModal from '../components/EditBudgetModal';

const ALL_CATEGORIES: Category[] = ['Food','Transport','Entertainment','Utilities','Healthcare','Shopping','Education','Housing','Other'];

export default function BudgetView() {
  const { state, updateBudget } = useApp();
  const [editing, setEditing] = useState<Budget | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const budgetsMap = useMemo(() => {
    const m = new Map<string, number>();
    state.budgets.forEach(b => m.set(b.category, b.limit));
    return m;
  }, [state.budgets]);

  const spentThisMonth = useMemo(() => {
    const map = new Map<string, number>();
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    state.expenses.forEach(e => {
      const key = e.date.slice(0,7); // YYYY-MM
      if (key !== monthKey) return;
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    });
    return map;
  }, [state.expenses]);

  const openEditor = (category: Category) => {
    const limit = budgetsMap.get(category);
    setEditing(limit ? { category, limit } : { category, limit: 0 });
    setEditingCategory(category);
  };

  const handleSave = (budget: Budget | null) => {
    if (!editingCategory) { setEditing(null); setEditingCategory(null); return; }
    if (budget === null) {
      // remove budget
      updateBudget({ category: editingCategory, limit: 0 });
    } else {
      updateBudget(budget);
    }
    setEditing(null);
    setEditingCategory(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Budgets (this month)</Text>

      {ALL_CATEGORIES.map(cat => {
        const limit = budgetsMap.get(cat) || 0;
        const spent = spentThisMonth.get(cat) || 0;
        const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
        return (
          <View key={cat} style={styles.row}>
            <View style={styles.left}>
              <Text style={styles.category}>{cat}</Text>
              <Text style={styles.subtitle}>Spent: ₹{spent.toFixed(2)} • Budget: {limit > 0 ? `₹${limit.toFixed(2)}` : '—'}</Text>
              <View style={styles.progressBar} accessibilityRole="progressbar" accessibilityLabel={`${cat} budget usage`} accessibilityValue={{ min: 0, max: 100, now: pct }}>
                <View style={[styles.progressFill, pct >= 100 ? styles.progressOver : styles.progressWithin, { width: `${pct}%` }]} />
              </View>
            </View>
            <View style={styles.right}>
              <TouchableOpacity onPress={() => openEditor(cat)} style={styles.editBtn} accessibilityRole="button" accessibilityLabel={`${limit > 0 ? 'Edit' : 'Set'} budget for ${cat}`}><Text style={styles.editText}>{limit > 0 ? 'Edit' : 'Set'}</Text></TouchableOpacity>
            </View>
          </View>
        );
      })}

      {editingCategory && (
        <EditBudgetModal visible={!!editingCategory} category={editingCategory} initial={editing} onClose={() => { setEditing(null); setEditingCategory(null); }} onSave={handleSave} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  category: { fontWeight: '700' },
  container: { flex: 1, padding: 16 },
  editBtn: { padding: 8 },
  editText: { color: '#0d9488', fontWeight: '700' },
  header: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  left: { flex: 1 },
  progressBar: { backgroundColor: '#f1f5f9', borderRadius: 6, height: 8, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%' },
  progressOver: { backgroundColor: '#ef4444' },
  progressWithin: { backgroundColor: '#10B981' },
  right: { marginLeft: 12 },
  row: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, flexDirection: 'row', marginBottom: 12, padding: 12 },
  subtitle: { color: '#6b7280', marginTop: 4 },
});