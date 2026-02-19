import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { User } from 'phosphor-react-native';
import { chatWithFinancialAssistant } from '../services/geminiService';
import { useApp } from '../contexts/AppContext';
import type { Expense, Income, Category, PaymentMethod, IncomeCategory, Recurrence } from '../types';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface ChatViewProps {
  footerHeight?: number;
}

const ChatView: React.FC<ChatViewProps> = ({ footerHeight = 0 }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! How can I help you with your finances?', isUser: false },
  ]);
  const [input, setInput] = useState('');
  const { state, addExpense, addIncomeSmart, deleteExpense, deleteIncome } = useApp();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Provide handlers that operate on AppContext directly (using hooks from top of component)

      const response = await chatWithFinancialAssistant(
        input,
        [],
        { expenses: state.expenses, incomes: state.incomes, budgets: state.budgets },
        // handlers
        (args: Partial<Expense>) => addExpense({
          amount: Number(args.amount || 0),
          category: (typeof args.category === 'string' ? (args.category as Category) : 'Other'),
          description: typeof args.description === 'string' ? args.description : 'Expense from AI',
          date: typeof args.date === 'string' ? args.date : new Date().toISOString().split('T')[0],
          paymentMethod: (typeof args.paymentMethod === 'string' ? (args.paymentMethod as PaymentMethod) : 'Cash'),
        }),
        (args: Partial<Income>) => addIncomeSmart({
          amount: Number(args.amount || 0),
          category: (typeof args.category === 'string' ? (args.category as IncomeCategory) : 'Salary'),
          source: typeof args.source === 'string' ? args.source : 'AI',
          date: typeof args.date === 'string' ? args.date : new Date().toISOString().split('T')[0],
          recurrence: (typeof args.recurrence === 'string' ? (args.recurrence as Recurrence) : 'None'),
        }),
        async (type: 'expense' | 'income', id?: string) => {
          if (type === 'expense') {
            if (id) deleteExpense(id);
            else if (state.expenses.length) deleteExpense(state.expenses[0].id);
            return 'Expense deleted.';
          }
          if (type === 'income') {
            if (id) deleteIncome(id);
            else if (state.incomes.length) deleteIncome(state.incomes[0].id);
            return 'Income deleted.';
          }
          return 'No transaction found.';
        }
      );

      const aiMessage: Message = { id: (Date.now() + 1).toString(), text: response, isUser: false };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), text: 'Sorry, I couldn\'t process that.', isUser: false };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.message, item.isUser ? styles.userMessage : styles.aiMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  const onProfilePress = () => {
    navigation.navigate('Profile');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={(isLandscape ? 0 : footerHeight) + (Platform.OS === 'ios' ? 20 : 0)}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>AI Assistant</Text>
        <TouchableOpacity onPress={onProfilePress} style={[styles.profileButton, { backgroundColor: colors.border }]}>
          <User size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={{ paddingBottom: isLandscape ? 24 : footerHeight + 80 }}
      />
      <View style={[styles.inputContainer, isLandscape ? undefined : { marginBottom: footerHeight }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask me anything..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderColor: '#0D9488',
    borderWidth: 1,
  },
  container: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  input: {
    borderColor: '#0D9488',
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    bottom: 0,
    flexDirection: 'row',
    padding: 10,
  },
  message: {
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
    padding: 10,
  },
  messageText: {
    color: '#000000',
  },
  messagesList: {
    flex: 1,
    padding: 10,
  },
  profileButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  sendButton: {
    backgroundColor: '#0F766E',
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0F766E',
  },
});

export default ChatView;