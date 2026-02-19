import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { Category, IncomeCategory, Recurrence, PaymentMethod } from '../types';
import { Picker } from '@react-native-picker/picker';
import { Check, X, Calendar, TrendingDown, TrendingUp } from 'lucide-react-native';
import DatePicker from './DatePicker';

type Props = {
  visible: boolean;
  onClose: () => void;
  initialTab?: 'expense' | 'income';
};

const todayIso = () => new Date().toISOString().split('T')[0];

const CATEGORY_OPTIONS: Category[] = ['Food','Transport','Entertainment','Utilities','Healthcare','Shopping','Education','Housing','Other'];
const PAYMENT_OPTIONS: PaymentMethod[] = ['Cash','Card','UPI','Other'];
const INCOME_CATEGORIES: IncomeCategory[] = ['Salary','Rent','Interest','Business','Gift','Other'];
const RECURRENCE_OPTIONS: Recurrence[] = ['None','Monthly','Yearly'];

export default function AddTransactionModal({ visible, onClose, initialTab = 'expense' }: Props) {
  const { t } = useTranslation();
  const { addExpense, addIncomeSmart, state } = useApp();
  const currency = state?.user?.currency || '₹';

  const [activeTab, setActiveTab] = useState<'expense' | 'income'>(initialTab);

  // Expense state
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<Category>('Food');
  const [expDesc, setExpDesc] = useState('');
  const [expDate, setExpDate] = useState(todayIso());
  const [expPaymentMethod, setExpPaymentMethod] = useState<PaymentMethod>('UPI');
  const [expErrors, setExpErrors] = useState<{ amount?: string; description?: string }>({});

  // Income state
  const [incAmount, setIncAmount] = useState('');
  const [incCategory, setIncCategory] = useState<IncomeCategory>('Salary');
  const [incSource, setIncSource] = useState('');
  const [incDate, setIncDate] = useState(todayIso());
  const [incRecurrence, setIncRecurrence] = useState<Recurrence>('None');
  const [tenantContact, setTenantContact] = useState('');
  const [incErrors, setIncErrors] = useState<{ amount?: string; source?: string }>({});

  // AI / NL parsing (basic local parser stub)
  const [nlInput, setNlInput] = useState('');
  const [showAIInput, setShowAIInput] = useState(false);

  // wheel pickers
  const [showCategoryWheel, setShowCategoryWheel] = useState(false);
  const [showIncomeCategoryWheel, setShowIncomeCategoryWheel] = useState(false);

  const resetState = () => {
    setExpAmount(''); setExpCategory('Food'); setExpDesc(''); setExpDate(todayIso()); setExpPaymentMethod('UPI'); setExpErrors({});
    setIncAmount(''); setIncCategory('Salary'); setIncSource(''); setIncDate(todayIso()); setIncRecurrence('None'); setTenantContact(''); setIncErrors({});
    setNlInput(''); setShowAIInput(false);
  };

  const validateExpense = () => {
    const errs: { amount?: string; description?: string } = {};
    const amt = parseFloat(expAmount);
    if (!expAmount || isNaN(amt) || amt <= 0) errs.amount = t('valid_amount_required') || 'Valid amount required';
    if (!expDesc.trim()) errs.description = t('description_required') || 'Description required';
    setExpErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateIncome = () => {
    const errs: { amount?: string; source?: string } = {};
    const amt = parseFloat(incAmount);
    if (!incAmount || isNaN(amt) || amt <= 0) errs.amount = t('valid_amount_required') || 'Valid amount required';
    if (!incSource.trim()) errs.source = t('source_required') || 'Source required';
    setIncErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleExpenseSubmit = () => {
    if (!validateExpense()) return;
    addExpense({
      amount: parseFloat(expAmount),
      category: expCategory,
      description: expDesc.trim(),
      date: expDate,
      paymentMethod: expPaymentMethod,
    });
    resetState();
    onClose();
  };

  const handleIncomeSubmit = () => {
    if (!validateIncome()) return;
    addIncomeSmart({
      amount: parseFloat(incAmount),
      category: incCategory,
      source: incSource.trim(),
      date: incDate,
      recurrence: incRecurrence,
    });
    resetState();
    onClose();
  };

  // AI parse (uses proxy parser with local fallback)
  const [isParsing, setIsParsing] = useState(false);

  const handleAIParse = async () => {
    if (!nlInput.trim()) return;
    setIsParsing(true);
    try {
      if (activeTab === 'expense') {
        const parsed = await (await import('../services/geminiService')).parseExpenseFromText(nlInput);
        if (parsed) {
          setExpAmount(String(parsed.amount || ''));
          const cat = CATEGORY_OPTIONS.includes(parsed.category as Category) ? (parsed.category as Category) : 'Other';
          setExpCategory(cat);
          setExpDesc(parsed.description || '');
          setExpDate(parsed.date || todayIso());
          const pm = ['Cash','Card','UPI','Other'].includes(parsed.paymentMethod) ? (parsed.paymentMethod as PaymentMethod) : 'UPI';
          setExpPaymentMethod(pm);
        }
      } else {
        const parsed = await (await import('../services/geminiService')).parseIncomeFromText(nlInput);
        if (parsed) {
          setIncAmount(String(parsed.amount || ''));
          const incCat = INCOME_CATEGORIES.includes(parsed.category as IncomeCategory) ? (parsed.category as IncomeCategory) : 'Other';
          setIncCategory(incCat);
          setIncSource(parsed.source || '');
          setIncDate(parsed.date || todayIso());
        }
      }

      setShowAIInput(false);
      setNlInput('');
    } catch {
      // fallback to the small local parser already in the file
      const text = nlInput.toLowerCase();
      const amtMatch = text.match(/\b(\d+(?:[.,]\d{1,2})?)\b/);
      if (amtMatch) {
        setExpAmount(amtMatch[1].replace(',', '.'));
        setIncAmount(amtMatch[1].replace(',', '.'));
      }
      for (const c of CATEGORY_OPTIONS) {
        if (text.includes(c.toLowerCase())) {
          setExpCategory(c);
        }
      }
      if (text.includes('rent') || text.includes('tenant')) {
        setIncCategory('Rent');
      }
      if (text.includes('cash')) setExpPaymentMethod('Cash');
      if (text.includes('card')) setExpPaymentMethod('Card');

      setShowAIInput(false);
      setNlInput('');
    } finally {
      setIsParsing(false);
    }
  };



  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerTabs}>
            <TouchableOpacity
              onPress={() => setActiveTab('expense')}
              style={[styles.tabButton, activeTab === 'expense' && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'expense' }}
              accessibilityLabel={t('Expense') || 'Expense'}
            >
              <TrendingDown size={16} color={activeTab === 'expense' ? '#ef4444' : '#6b7280'} />
              <Text style={[styles.tabText, activeTab === 'expense' && styles.tabTextActive]}>{t('Expense') || 'Expense'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('income')}
              style={[styles.tabButton, activeTab === 'income' && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'income' }}
              accessibilityLabel={t('Income') || 'Income'}
            >
              <TrendingUp size={16} color={activeTab === 'income' ? '#0d9488' : '#6b7280'} />
              <Text style={[styles.tabText, activeTab === 'income' && styles.tabTextActive]}>{t('Income') || 'Income'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityRole="button" accessibilityLabel={t('Close') || 'Close'}>
              <X size={18} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {activeTab === 'expense' ? (
              <View>
                {!showAIInput ? (
                  <TouchableOpacity style={styles.aiButton} onPress={() => setShowAIInput(true)} accessibilityRole="button" accessibilityLabel={t('Magic Fill with AI') || 'Magic Fill with AI'}>
                    <Text style={styles.aiButtonText}>✨ {t('Magic Fill with AI') || 'Magic Fill with AI'}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.aiInputRow}>
                    <TextInput value={nlInput} onChangeText={setNlInput} placeholder={t('magic_fill_placeholder') || 'e.g. Lunch 120 UPI'} style={styles.textInput} accessibilityLabel={t('magic_fill_placeholder') || 'Natural language input'} />
                    <TouchableOpacity onPress={handleAIParse} style={styles.iconButton} disabled={isParsing} accessibilityRole="button" accessibilityLabel={t('Magic Fill with AI') || 'Apply AI parse'}>
                      {isParsing ? <Text style={styles.loadingDot}>…</Text> : <Check size={18} color="#ffffff" />}
                    </TouchableOpacity>
                  </View>
                )}

                <Text style={styles.label}>{t('Amount') || 'Amount'}</Text>
                <View style={styles.amountRow}>
                  <Text style={styles.currency}>{currency}</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={expAmount}
                    onChangeText={setExpAmount}
                    placeholder="0.00"
                    style={[styles.amountInput, expErrors.amount && styles.inputError]}
                  />
                </View>

                <Text style={styles.label}>{t('Description') || 'Description'}</Text>
                <TextInput value={expDesc} onChangeText={setExpDesc} placeholder={t('description_placeholder') || 'Bought groceries'} style={[styles.textInput, expErrors.description && styles.inputError]} />

                <View style={styles.row2}>
                  <View style={styles.col}>
                    <Text style={styles.label}>{t('Category') || 'Category'}</Text>
                    <TouchableOpacity
                      onPress={() => setShowCategoryWheel(true)}
                      style={styles.dateButton}
                      accessibilityRole="button"
                      accessibilityLabel={`Select category, ${expCategory}`}
                    >
                      <Text style={{ color: '#111827' }}>{expCategory}</Text>
                    </TouchableOpacity>

                    {/* Modal wheel picker */}
                    <Modal visible={showCategoryWheel} transparent animationType="slide" onRequestClose={() => setShowCategoryWheel(false)}>
                      <View style={styles.backdrop}>
                        <View style={[styles.sheet, { maxHeight: 260, paddingBottom: 0 }]}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
                            <TouchableOpacity onPress={() => setShowCategoryWheel(false)} accessibilityRole="button"><Text style={{ color: '#6b7280' }}>Cancel</Text></TouchableOpacity>
                            <Text style={styles.modalTitle}>{t('Category') || 'Category'}</Text>
                            <TouchableOpacity onPress={() => setShowCategoryWheel(false)} accessibilityRole="button"><Text style={{ color: '#0d9488', fontWeight: '700' }}>Done</Text></TouchableOpacity>
                          </View>
                          <View style={{ borderTopWidth: 1, borderColor: '#e6e9ee', backgroundColor: '#fff' }}>
                            <Picker selectedValue={expCategory} onValueChange={(v) => setExpCategory(v as Category)} style={{ height: 220 }} itemStyle={{ fontSize: 18, height: 200 }} mode={Platform.OS === 'ios' ? 'dialog' : 'dropdown'}>
                              {CATEGORY_OPTIONS.map(c => <Picker.Item key={c} label={c} value={c} />)}
                            </Picker>
                          </View>
                        </View>
                      </View>
                    </Modal>
                  </View>

                  <View style={styles.colRight}>
                    <Text style={styles.label}>{t('Date') || 'Date'}</Text>
                    <View style={styles.dateButton}>
                      <DatePicker dateIso={expDate} onChange={setExpDate} style={styles.datePickerFlex} />
                      <Calendar size={16} color="#9ca3af" />
                    </View>
                  </View>
                </View>

                <Text style={styles.label}>{t('Payment Method') || 'Payment Method'}</Text>
                <View style={styles.row2}>
                  {PAYMENT_OPTIONS.map((m) => (
                    <TouchableOpacity key={m} onPress={() => setExpPaymentMethod(m)} style={[styles.smallBtn, expPaymentMethod === m && styles.smallBtnActive]}>
                      <Text style={expPaymentMethod === m ? styles.smallBtnTextActive : styles.smallBtnText}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={handleExpenseSubmit}><Text style={styles.saveBtnText}>{t('Save Expense') || 'Save Expense'}</Text></TouchableOpacity>
              </View>
            ) : (
              <View>
                {!showAIInput ? (
                  <TouchableOpacity style={styles.aiButton} onPress={() => setShowAIInput(true)}>
                    <Text style={styles.aiButtonText}>✨ {t('Magic Fill with AI') || 'Magic Fill with AI'}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.aiInputRow}>
                    <TextInput value={nlInput} onChangeText={setNlInput} placeholder={t('magic_fill_placeholder') || 'e.g. Rent 5000 from John'} style={styles.textInput} />
                    <TouchableOpacity onPress={handleAIParse} style={styles.iconButton} disabled={isParsing}>
                      {isParsing ? <Text style={styles.loadingDot}>…</Text> : <Check size={18} color="#ffffff" />}
                    </TouchableOpacity>
                  </View>
                )}

                <Text style={styles.label}>{t('Amount') || 'Amount'}</Text>
                <View style={styles.amountRow}>
                  <Text style={styles.currency}>{currency}</Text>
                  <TextInput keyboardType="numeric" value={incAmount} onChangeText={setIncAmount} placeholder="0.00" style={[styles.amountInput, incErrors.amount && styles.inputError]} />
                </View>

                <Text style={styles.label}>{incCategory === 'Rent' ? t('Tenant Name') || 'Tenant Name' : t('Source') || 'Source'}</Text>
                <TextInput value={incSource} onChangeText={setIncSource} placeholder={incCategory === 'Rent' ? 'e.g., John Doe' : 'e.g., Employer'} style={[styles.textInput, incErrors.source && styles.inputError]} />

                <View style={styles.row2}>
                  <View style={styles.col}>
                    <Text style={styles.label}>{t('Category') || 'Category'}</Text>

                    <TouchableOpacity
                      onPress={() => setShowIncomeCategoryWheel(true)}
                      style={styles.dateButton}
                      accessibilityRole="button"
                      accessibilityLabel={`Select category, ${incCategory}`}
                    >
                      <Text style={{ color: '#111827' }}>{incCategory}</Text>
                    </TouchableOpacity>

                    <Modal visible={showIncomeCategoryWheel} transparent animationType="slide" onRequestClose={() => setShowIncomeCategoryWheel(false)}>
                      <View style={styles.backdrop}>
                        <View style={[styles.sheet, { maxHeight: 260, paddingBottom: 0 }]}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
                            <TouchableOpacity onPress={() => setShowIncomeCategoryWheel(false)} accessibilityRole="button"><Text style={{ color: '#6b7280' }}>Cancel</Text></TouchableOpacity>
                            <Text style={styles.modalTitle}>{t('Category') || 'Category'}</Text>
                            <TouchableOpacity onPress={() => setShowIncomeCategoryWheel(false)} accessibilityRole="button"><Text style={{ color: '#0d9488', fontWeight: '700' }}>Done</Text></TouchableOpacity>
                          </View>
                          <View style={{ borderTopWidth: 1, borderColor: '#e6e9ee', backgroundColor: '#fff' }}>
                            <Picker selectedValue={incCategory} onValueChange={(v) => setIncCategory(v as IncomeCategory)} style={{ height: 220 }} itemStyle={{ fontSize: 18, height: 200 }} mode={Platform.OS === 'ios' ? 'dialog' : 'dropdown'}>
                              {INCOME_CATEGORIES.map(c => <Picker.Item key={c} label={c} value={c} />)}
                            </Picker>
                          </View>
                        </View>
                      </View>
                    </Modal>

                  </View>
                  <View style={styles.colRight}>
                    <Text style={styles.label}>{t('Date') || 'Date'}</Text>
                    <View style={styles.dateButton}>
                      <DatePicker dateIso={incDate} onChange={setIncDate} style={styles.datePickerFlex} />
                      <Calendar size={16} color="#9ca3af" />
                    </View>
                  </View>
                </View>

                {incCategory === 'Rent' && (
                  <View>
                    <Text style={styles.label}>{t('Tenant Mobile') || 'Tenant Mobile'}</Text>
                    <TextInput value={tenantContact} onChangeText={setTenantContact} placeholder="+91..." style={styles.textInput} keyboardType="phone-pad" />
                  </View>
                )}

                <Text style={styles.label}>{t('Recurrence') || 'Recurrence'}</Text>
                <View style={styles.row2}>
                  {RECURRENCE_OPTIONS.map(r => (
                    <TouchableOpacity key={r} onPress={() => setIncRecurrence(r)} style={[styles.smallBtn, incRecurrence === r && styles.smallBtnActive]}>
                      <Text style={incRecurrence === r ? styles.smallBtnTextActive : styles.smallBtnText}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={[styles.saveBtn, styles.saveBtnIncome]} onPress={handleIncomeSubmit}><Text style={styles.saveBtnText}>{t('Save Income') || 'Save Income'}</Text></TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  aiButton: { alignItems: 'center', backgroundColor: '#f3e8ff', borderRadius: 10, marginBottom: 12, padding: 10 },
  aiButtonText: { color: '#6b21a8', fontWeight: '600' },
  aiInputRow: { alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 12 },
  amountInput: { backgroundColor: '#f8fafc', borderRadius: 10, flex: 1, fontSize: 18, padding: 12 },
  amountRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 12 },
  backdrop: { backgroundColor: 'rgba(0,0,0,0.5)', flex: 1, justifyContent: 'flex-end' },
  categoryChipsRow: { gap: 8, paddingHorizontal: 6, paddingVertical: 8 },
  chip: { backgroundColor: '#fff', borderColor: '#e6e9ee', borderRadius: 20, borderWidth: 1, marginRight: 8, paddingHorizontal: 12, paddingVertical: 8 },
  chipActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
  chipText: { color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  closeButton: { padding: 8, position: 'absolute', right: 8, top: 6 },
  col: { flex: 1 },
  colRight: { flex: 1, marginLeft: 12 },
  content: { padding: 16 },
  currency: { color: '#6b7280', fontSize: 18, marginLeft: 8, marginRight: 8 },
  dateButton: { alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
  datePickerFlex: { flex: 1 },
  headerTabs: { alignItems: 'center', borderBottomWidth: 1, borderColor: '#e6e9ee', flexDirection: 'row', paddingHorizontal: 8 },
  hiddenPicker: { height: 0, opacity: 0 },
  iconButton: { backgroundColor: '#7c3aed', borderRadius: 8, marginLeft: 8, padding: 10 },
  inputError: { borderColor: '#ef4444', borderWidth: 1 },
  label: { color: '#6b7280', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  loadingDot: { color: '#fff', fontWeight: '700' },
  modalTitle: { color: '#111827', flex: 1, fontWeight: '600', textAlign: 'center' },
  pickerWrap: { backgroundColor: '#f8fafc', borderRadius: 10 },
  row2: { flexDirection: 'row', marginBottom: 12 },
  saveBtn: { alignItems: 'center', backgroundColor: '#ef4444', borderRadius: 12, marginTop: 8, padding: 14 },
  saveBtnIncome: { backgroundColor: '#0d9488' },
  saveBtnText: { color: '#fff', fontWeight: '800' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '90%', paddingBottom: Platform.OS === 'ios' ? 36 : 16 },
  smallBtn: { alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 8, flex: 1, marginRight: 8, padding: 10 },
  smallBtnActive: { backgroundColor: '#111827' },
  smallBtnText: { color: '#374151' },
  smallBtnTextActive: { color: '#fff' },
  tabActive: { backgroundColor: '#f8fafc' },
  tabButton: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingVertical: 12 },
  tabText: { color: '#6b7280', fontWeight: '700', marginTop: 4 },
  tabTextActive: { color: '#111827' },
  textInput: { backgroundColor: '#f8fafc', borderRadius: 10, marginBottom: 12, padding: 12 },
});