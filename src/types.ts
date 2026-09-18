export type TransactionType = 'expense' | 'income' | 'transfer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  initial: string;
}

export interface Transaction {
  id?: number;
  userId: string;
  type: TransactionType;
  amount: number;
  note: string;
  location?: string;
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  timestamp: number;
  icon: string;
}

export type AccountType = 'cash' | 'bkash' | 'nagad' | 'bank' | 'card' | 'mfs';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  note: string;
  icon: string;
  color: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string;
  budget: number;
  spent?: number;
  color: string;
  keywords: string[];
}

export type DharType = 'pabo' | 'debo'; // pabo = receivable, debo = payable

export interface DharPaymentLog {
  id: string;
  amount: number;
  date: string;
  time: string;
  timestamp: number;
  accountId: string;
  accountName?: string;
  note?: string;
  type: 'repayment' | 'add_loan';
}

export interface DharItem {
  id?: number;
  userId: string;
  person: string;
  amount: number;
  originalAmount: number;
  type: DharType;
  note: string;
  date: string;
  timestamp: number;
  status: 'pending' | 'settled';
  phone?: string;
  history?: DharPaymentLog[];
}

export interface AppSettings {
  id?: string;
  userId: string;
  theme: 'dark' | 'light';
  autoDriveSync: boolean;
  lastSyncTime?: string;
  geminiApiKey?: string;
}
