import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Expense, Income, Budget, UserProfile } from '../types';
import { useTranslation } from 'react-i18next';

interface AppState {
  user: UserProfile | null;
  expenses: Expense[];
  incomes: Income[];
  budgets: Budget[];
  isAuthenticated: boolean;
}

type AppAction =
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'ADD_INCOME'; payload: Income }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: { expenses: Expense[]; incomes: Income[]; budgets: Budget[] } };

const initialState: AppState = {
  user: null,
  expenses: [],
  incomes: [],
  budgets: [],
  isAuthenticated: false,
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
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  t: (key: string) => string;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { t } = useTranslation();

  return (
    <AppContext.Provider value={{ state, dispatch, t }}>
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