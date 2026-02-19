export type Category =
  | 'Food'
  | 'Transport'
  | 'Entertainment'
  | 'Utilities'
  | 'Healthcare'
  | 'Shopping'
  | 'Education'
  | 'Housing'
  | 'Other';

export type IncomeCategory =
  | 'Salary'
  | 'Interest'
  | 'Business'
  | 'Gift'
  | 'Rent'
  | 'Other';

export type PaymentMethod = 'Cash' | 'Card' | 'UPI' | 'Other';

export type Recurrence = 'None' | 'Monthly' | 'Yearly';

export type TransactionStatus = 'Expected' | 'Received' | 'Overdue';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO
  paymentMethod: PaymentMethod;
  createdAt?: number;
}

export interface Income {
  id: string;
  amount: number;
  category: IncomeCategory;
  source: string;
  date: string;
  recurrence: Recurrence;
  status: TransactionStatus;
  tenantContact?: string;
  createdAt?: number;
}

export interface Budget {
  category: Category;
  limit: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface ExpenseStats {
  totalSpent: number;
  categoryBreakdown: Record<Category, number>;
  recentExpenses: Expense[];
  dailySpending: { date: string; amount: number }[];
}

export interface UserProfile {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  currency: string;
  language?: string;
  password?: string;
  profilePicture?: string;
  biometricEnabled?: boolean;
  biometricCredentialId?: string;
}

export interface LocalBackup {
  id: string;
  date: string;
  userName: string;
  content: string; // Encrypted content
  size: number;
}

export type Transaction = Expense | Income;