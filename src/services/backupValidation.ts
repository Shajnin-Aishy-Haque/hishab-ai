import type { Account, Category, DharItem, Transaction } from '../types';

export interface BackupSnapshot {
  app: string;
  version: string;
  exportedAt: string;
  formattedDate: string;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  dharItems: DharItem[];
  stats: {
    netBalance: number;
    totalTransactions: number;
    totalPabo: number;
    totalDebo: number;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: BackupSnapshot;
  counts?: {
    accounts: number;
    categories: number;
    transactions: number;
    dharItems: number;
  };
}

/**
 * Strict schema validator and sanitizer for Hishab AI backups
 */
export function validateBackupSchema(raw: any): ValidationResult {
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object') {
    return { valid: false, errors: ['ফাইলটি সঠিক JSON অবজেক্ট নয়।'] };
  }

  // Allow standard Hishab AI or JSON data structure
  if (!raw.app && !raw.accounts && !raw.transactions) {
    return { valid: false, errors: ['অস্বীকৃত ব্যাকআপ ফাইল ফরম্যাট। Hishab AI ব্যাকআপ ফাইল দিন।'] };
  }

  const sanitizedAccounts: Account[] = [];
  if (Array.isArray(raw.accounts)) {
    for (let i = 0; i < raw.accounts.length; i++) {
      const a = raw.accounts[i];
      if (!a || typeof a !== 'object') continue;
      if (typeof a.name !== 'string' || typeof a.type !== 'string' || typeof a.balance !== 'number' || isNaN(a.balance)) {
        errors.push(`Account #${i + 1} এ ভুল ডাটা ফরম্যাট রয়েছে।`);
        continue;
      }
      sanitizedAccounts.push({
        id: String(a.id || `acc_${Date.now()}_${i}`),
        userId: String(a.userId || 'user_local'),
        name: String(a.name).trim().slice(0, 50),
        type: a.type,
        balance: Number(a.balance),
        note: a.note ? String(a.note).slice(0, 100) : '',
        icon: a.icon ? String(a.icon).slice(0, 10) : '💳',
        color: a.color ? String(a.color).slice(0, 20) : '#1a73e8'
      });
    }
  }

  const sanitizedCategories: Category[] = [];
  if (Array.isArray(raw.categories)) {
    for (let i = 0; i < raw.categories.length; i++) {
      const c = raw.categories[i];
      if (!c || typeof c !== 'object' || typeof c.name !== 'string') continue;
      sanitizedCategories.push({
        id: String(c.id || `cat_${Date.now()}_${i}`),
        userId: String(c.userId || 'user_local'),
        name: String(c.name).trim().slice(0, 50),
        icon: c.icon ? String(c.icon).slice(0, 10) : '🏷️',
        color: c.color ? String(c.color).slice(0, 20) : '#1a73e8',
        budget: typeof c.budget === 'number' && !isNaN(c.budget) ? Math.max(0, c.budget) : 0,
        keywords: Array.isArray(c.keywords) ? c.keywords.map(String) : []
      });
    }
  }

  const sanitizedTransactions: Transaction[] = [];
  if (Array.isArray(raw.transactions)) {
    for (let i = 0; i < raw.transactions.length; i++) {
      const t = raw.transactions[i];
      if (!t || typeof t !== 'object') continue;
      if (typeof t.amount !== 'number' || isNaN(t.amount) || t.amount <= 0) {
        continue;
      }
      sanitizedTransactions.push({
        id: typeof t.id === 'number' ? t.id : undefined,
        userId: String(t.userId || 'user_local'),
        type: t.type === 'income' ? 'income' : t.type === 'transfer' ? 'transfer' : 'expense',
        amount: Math.abs(Number(t.amount)),
        note: String(t.note || 'লেনদেন').trim().slice(0, 200),
        location: t.location ? String(t.location).slice(0, 100) : undefined,
        categoryId: String(t.categoryId || 'personal'),
        accountId: String(t.accountId || 'cash_user_local'),
        toAccountId: t.toAccountId ? String(t.toAccountId) : undefined,
        date: String(t.date || new Date().toISOString().split('T')[0]),
        time: String(t.time || '12:00 PM'),
        timestamp: typeof t.timestamp === 'number' ? t.timestamp : Date.now(),
        icon: t.icon ? String(t.icon).slice(0, 10) : '💳'
      });
    }
  }

  const sanitizedDhar: DharItem[] = [];
  if (Array.isArray(raw.dharItems)) {
    for (let i = 0; i < raw.dharItems.length; i++) {
      const d = raw.dharItems[i];
      if (!d || typeof d !== 'object') continue;
      if (typeof d.person !== 'string' || typeof d.amount !== 'number' || isNaN(d.amount)) {
        continue;
      }
      sanitizedDhar.push({
        id: typeof d.id === 'number' ? d.id : undefined,
        userId: String(d.userId || 'user_local'),
        person: String(d.person).trim().slice(0, 100),
        amount: Math.max(0, Number(d.amount)),
        originalAmount: typeof d.originalAmount === 'number' ? d.originalAmount : Number(d.amount),
        type: d.type === 'debo' ? 'debo' : 'pabo',
        note: d.note ? String(d.note).slice(0, 200) : '',
        date: String(d.date || new Date().toISOString().split('T')[0]),
        phone: d.phone ? String(d.phone).slice(0, 30) : undefined,
        timestamp: typeof d.timestamp === 'number' ? d.timestamp : Date.now(),
        status: d.status === 'settled' ? 'settled' : 'pending',
        history: Array.isArray(d.history) ? d.history : []
      });
    }
  }

  const totalLoaded = sanitizedAccounts.length + sanitizedTransactions.length + sanitizedDhar.length;
  if (totalLoaded === 0) {
    return { valid: false, errors: ['ফাইলটিতে কোনো বৈধ অ্যাকাউন্ট বা লেনদেন তথ্য পাওয়া যায়নি।'] };
  }

  const sanitized: BackupSnapshot = {
    app: 'Hishab AI',
    version: '2.0.0',
    exportedAt: raw.exportedAt || new Date().toISOString(),
    formattedDate: raw.formattedDate || new Date().toLocaleString(),
    accounts: sanitizedAccounts,
    categories: sanitizedCategories,
    transactions: sanitizedTransactions,
    dharItems: sanitizedDhar,
    stats: {
      netBalance: sanitizedAccounts.reduce((s, a) => s + a.balance, 0),
      totalTransactions: sanitizedTransactions.length,
      totalPabo: sanitizedDhar.filter(d => d.type === 'pabo' && d.status === 'pending').reduce((s, d) => s + d.amount, 0),
      totalDebo: sanitizedDhar.filter(d => d.type === 'debo' && d.status === 'pending').reduce((s, d) => s + d.amount, 0)
    }
  };

  return {
    valid: true,
    errors,
    sanitized,
    counts: {
      accounts: sanitizedAccounts.length,
      categories: sanitizedCategories.length,
      transactions: sanitizedTransactions.length,
      dharItems: sanitizedDhar.length
    }
  };
}
