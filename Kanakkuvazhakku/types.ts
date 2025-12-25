export type Category =
  | 'Food'
  | 'Transport'
  | 'Entertainment'
  | 'Utilities'
  | 'Healthcare'
  | 'Shopping'
  | 'Education'
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
}

export interface Budget {
  category: Category;
  limit: number;
}

export interface UserProfile {
  name: string;
  email?: string;
  phone?: string;
  currency: string;
  language: 'EN' | 'TA';
}

export type Transaction = Expense | Income;