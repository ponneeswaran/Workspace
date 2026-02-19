import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Expense, Income, Budget, UserProfile, ChatMessage } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  user: UserProfile | null;
  expenses: Expense[];
  incomes: Income[];
  budgets: Budget[];
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
  currency: string;
  chatHistory: ChatMessage[];
}

type AppAction =
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'RESTORE_EXPENSE'; payload: Expense }
  | { type: 'ADD_INCOME'; payload: Income }
  | { type: 'ADD_INCOMES'; payload: Income[] }
  | { type: 'UPDATE_INCOME'; payload: Income }
  | { type: 'DELETE_INCOME'; payload: string }
  | { type: 'RESTORE_INCOME'; payload: Income }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: { expenses: Expense[]; incomes: Income[]; budgets: Budget[]; user?: UserProfile; chatHistory?: ChatMessage[] } }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_CURRENCY'; payload: string };

const initialState: AppState = {
  user: null,
  expenses: [],
  incomes: [],
  budgets: [],
  isAuthenticated: false,
  theme: 'light',
  currency: '₹',
  chatHistory: [],
};

function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

function getLocalToday() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getNextDate(dateStr: string, recurrence: string): string {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, monthIndex, day);

  if (recurrence === 'Monthly') {
    d.setMonth(d.getMonth() + 1);
    if (d.getDate() !== day) {
      d.setDate(0);
    }
  } else if (recurrence === 'Yearly') {
    d.setFullYear(d.getFullYear() + 1);
  }

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dt = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dt}`;
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) };
    case 'RESTORE_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };
    case 'ADD_INCOME':
      return { ...state, incomes: [action.payload, ...state.incomes] };
    case 'ADD_INCOMES':
      return { ...state, incomes: [...action.payload, ...state.incomes] };
    case 'UPDATE_INCOME':
      return { ...state, incomes: state.incomes.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_INCOME':
      return { ...state, incomes: state.incomes.filter(i => i.id !== action.payload) };
    case 'RESTORE_INCOME':
      return { ...state, incomes: [action.payload, ...state.incomes] };
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatHistory: [action.payload, ...state.chatHistory] };
    case 'UPDATE_BUDGET': {
      const updatedBudgets = state.budgets.filter(b => b.category !== action.payload.category);
      return { ...state, budgets: [...updatedBudgets, action.payload] };
    }
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'LOAD_DATA':
      return {
        ...state,
        expenses: action.payload.expenses || [],
        incomes: action.payload.incomes || [],
        budgets: action.payload.budgets || [],
        user: action.payload.user ?? state.user,
        chatHistory: action.payload.chatHistory ?? state.chatHistory,
      };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  addIncomeSmart: (income: Omit<Income, 'id' | 'createdAt' | 'status'>) => void;
  addChatMessage: (msg: ChatMessage) => void;
  deleteExpense: (id: string) => void;
  restoreExpense: (expense: Expense) => void;
  updateIncome: (income: Income) => void;
  deleteIncome: (id: string) => void;
  restoreIncome: (income: Income) => void;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted app data
  useEffect(() => {
    const load = async () => {
      try {
        const [expensesStr, incomesStr, budgetsStr, userStr, theme, currency, chatStr] = await Promise.all([
          AsyncStorage.getItem('expenses'),
          AsyncStorage.getItem('incomes'),
          AsyncStorage.getItem('budgets'),
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('theme'),
          AsyncStorage.getItem('currency'),
          AsyncStorage.getItem('chatHistory'),
        ]);

        const payload = {
          expenses: expensesStr ? JSON.parse(expensesStr) : [],
          incomes: incomesStr ? JSON.parse(incomesStr) : [],
          budgets: budgetsStr ? JSON.parse(budgetsStr) : [],
          user: userStr ? JSON.parse(userStr) : undefined,
          chatHistory: chatStr ? JSON.parse(chatStr) : undefined,
        };

        dispatch({ type: 'LOAD_DATA', payload });

        if (theme) dispatch({ type: 'SET_THEME', payload: theme as 'light' | 'dark' });
        if (currency) dispatch({ type: 'SET_CURRENCY', payload: currency });
      } catch (err) {
        console.error('Failed to load persisted data', err);
      }
    };

    load();
  }, []);

  // Persist when relevant slices change
  useEffect(() => {
    AsyncStorage.setItem('expenses', JSON.stringify(state.expenses)).catch(() => {});
  }, [state.expenses]);

  useEffect(() => {
    AsyncStorage.setItem('incomes', JSON.stringify(state.incomes)).catch(() => {});
  }, [state.incomes]);

  useEffect(() => {
    AsyncStorage.setItem('budgets', JSON.stringify(state.budgets)).catch(() => {});
  }, [state.budgets]);

  useEffect(() => {
    if (state.user) AsyncStorage.setItem('user', JSON.stringify(state.user)).catch(() => {});
  }, [state.user]);

  useEffect(() => {
    AsyncStorage.setItem('chatHistory', JSON.stringify(state.chatHistory)).catch(() => {});
  }, [state.chatHistory]);

  // Helper functions exposed through context
  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = { ...expense, id: generateId(), createdAt: Date.now() };
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
  };

  const deleteExpense = (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  };

  const restoreExpense = (expense: Expense) => {
    dispatch({ type: 'RESTORE_EXPENSE', payload: expense });
  };

  const addIncomeSmart = (income: Omit<Income, 'id' | 'createdAt' | 'status'>) => {
    const today = getLocalToday();
    const isPast = income.date <= today;

    const mainStatus = isPast ? 'Received' : 'Expected';
    const mainEntry: Income = {
      ...income,
      id: generateId(),
      createdAt: Date.now(),
      status: mainStatus,
    } as Income;

    const entries: Income[] = [mainEntry];

    if (isPast && income.recurrence !== 'None') {
      const nextDateStr = getNextDate(income.date, income.recurrence);
      const nextStatus = nextDateStr < today ? 'Overdue' : 'Expected';
      const nextEntry: Income = {
        ...income,
        id: generateId(),
        createdAt: Date.now() + 1,
        date: nextDateStr,
        status: nextStatus,
      } as Income;
      entries.push(nextEntry);
    }

    dispatch({ type: 'ADD_INCOMES', payload: entries });
  };

  const updateIncome = (income: Income) => {
    dispatch({ type: 'UPDATE_INCOME', payload: income });
  };

  const deleteIncome = (id: string) => {
    dispatch({ type: 'DELETE_INCOME', payload: id });
  };

  const restoreIncome = (income: Income) => {
    dispatch({ type: 'RESTORE_INCOME', payload: income });
  };

  const addChatMessage = (msg: ChatMessage) => {
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: msg });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, addExpense, addIncomeSmart, addChatMessage, deleteExpense, restoreExpense, updateIncome, deleteIncome, restoreIncome }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};