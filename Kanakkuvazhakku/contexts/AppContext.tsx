import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Expense, Income, Budget, UserProfile } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  user: UserProfile | null;
  expenses: Expense[];
  incomes: Income[];
  budgets: Budget[];
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
  currency: string;
}

type AppAction =
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'ADD_INCOME'; payload: Income }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: { expenses: Expense[]; incomes: Income[]; budgets: Budget[] } }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_CURRENCY'; payload: string };

const initialState: AppState = {
  user: null,
  expenses: [],
  incomes: [],
  budgets: [],
  isAuthenticated: false,
  theme: 'light',
  currency: 'USD',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'ADD_INCOME':
      return { ...state, incomes: [...state.incomes, action.payload] };
    case 'UPDATE_BUDGET': {
      const updatedBudgets = state.budgets.filter(b => b.category !== action.payload.category);
      return { ...state, budgets: [...updatedBudgets, action.payload] };
    }
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
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
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const theme = await AsyncStorage.getItem('theme');
        const currency = await AsyncStorage.getItem('currency');

        if (theme) {
          dispatch({ type: 'SET_THEME', payload: theme as 'light' | 'dark' });
        }
        if (currency) {
          dispatch({ type: 'SET_CURRENCY', payload: currency });
        }
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    };

    loadSettings();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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