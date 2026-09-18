import { db } from '../db/db';
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

export async function createDatabaseSnapshot(userId?: string): Promise<BackupSnapshot> {
  const [accounts, categories, transactions, dharItems] = await Promise.all([
    userId ? db.accounts.where('userId').equals(userId).toArray() : db.accounts.toArray(),
    userId ? db.categories.where('userId').equals(userId).toArray() : db.categories.toArray(),
    userId
      ? db.transactions.where('userId').equals(userId).reverse().sortBy('timestamp')
      : db.transactions.orderBy('timestamp').reverse().toArray(),
    userId ? db.dharItems.where('userId').equals(userId).toArray() : db.dharItems.toArray()
  ]);

  const netBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalPabo = dharItems.filter(d => d.type === 'pabo' && d.status === 'pending').reduce((sum, d) => sum + d.amount, 0);
  const totalDebo = dharItems.filter(d => d.type === 'debo' && d.status === 'pending').reduce((sum, d) => sum + d.amount, 0);

  return {
    app: 'Hishab AI',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    formattedDate: new Date().toLocaleString(),
    accounts,
    categories,
    transactions,
    dharItems,
    stats: {
      netBalance,
      totalTransactions: transactions.length,
      totalPabo,
      totalDebo
    }
  };
}

import { getLocalDateString } from '../utils/dateUtils';

export async function exportBackupFile(userId?: string) {
  const snapshot = await createDatabaseSnapshot(userId);
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = getLocalDateString();
  a.href = url;
  a.download = `hishab_ai_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importBackupFile(file: File, targetUserId?: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as BackupSnapshot;
        if (!data.app || (!data.transactions && !data.accounts)) {
          throw new Error('Invalid backup file structure.');
        }

        const effectiveUserId = targetUserId;

        await db.transaction('rw', [db.accounts, db.categories, db.transactions, db.dharItems], async () => {
          if (data.accounts && data.accounts.length > 0) {
            if (effectiveUserId) {
              await db.accounts.where('userId').equals(effectiveUserId).delete();
              const mapped = data.accounts.map(a => ({ ...a, userId: effectiveUserId }));
              await db.accounts.bulkAdd(mapped);
            } else {
              await db.accounts.clear();
              await db.accounts.bulkAdd(data.accounts);
            }
          }
          if (data.categories && data.categories.length > 0) {
            if (effectiveUserId) {
              await db.categories.where('userId').equals(effectiveUserId).delete();
              const mapped = data.categories.map(c => ({ ...c, userId: effectiveUserId }));
              await db.categories.bulkAdd(mapped);
            } else {
              await db.categories.clear();
              await db.categories.bulkAdd(data.categories);
            }
          }
          if (data.transactions && data.transactions.length > 0) {
            if (effectiveUserId) {
              await db.transactions.where('userId').equals(effectiveUserId).delete();
              const mapped = data.transactions.map(t => ({ ...t, userId: effectiveUserId }));
              await db.transactions.bulkAdd(mapped);
            } else {
              await db.transactions.clear();
              await db.transactions.bulkAdd(data.transactions);
            }
          }
          if (data.dharItems && data.dharItems.length > 0) {
            if (effectiveUserId) {
              await db.dharItems.where('userId').equals(effectiveUserId).delete();
              const mapped = data.dharItems.map(d => ({ ...d, userId: effectiveUserId }));
              await db.dharItems.bulkAdd(mapped);
            } else {
              await db.dharItems.clear();
              await db.dharItems.bulkAdd(data.dharItems);
            }
          }
        });

        resolve(true);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export async function exportCsvReport() {
  const [accounts, dharItems, transactions] = await Promise.all([
    db.accounts.toArray(),
    db.dharItems.toArray(),
    db.transactions.orderBy('timestamp').reverse().toArray()
  ]);

  const rows: string[][] = [];
  rows.push(['Transaction ID', 'Date', 'Time', 'Type', 'Description', 'Category', 'Account', 'Amount (BDT)']);

  transactions.forEach((tx) => {
    rows.push([
      `TX-${tx.id || 0}`,
      tx.date,
      tx.time,
      tx.type.toUpperCase(),
      `"${tx.note.replace(/"/g, '""')}"`,
      tx.categoryId,
      tx.accountId,
      String(tx.amount)
    ]);
  });

  rows.push([]);
  rows.push(['=== DHAR-DENA KHATA (LEND & BORROW) ===']);
  rows.push(['Person / Shop', 'Type', 'Note', 'Amount (BDT)', 'Status', 'Date']);
  dharItems.forEach((d) => {
    rows.push([
      `"${d.person.replace(/"/g, '""')}"`,
      d.type === 'pabo' ? 'আমি পাবো (Receivable)' : 'আমি দেবো (Payable)',
      `"${d.note.replace(/"/g, '""')}"`,
      String(d.amount),
      d.status === 'pending' ? 'বাকি আছে' : 'পরিশোধিত',
      d.date
    ]);
  });

  rows.push([]);
  rows.push(['=== ACCOUNTS SUMMARY ===']);
  rows.push(['Account Name', 'Type', 'Current Balance (BDT)']);
  accounts.forEach((acc) => {
    rows.push([`"${acc.name.replace(/"/g, '""')}"`, acc.type, String(acc.balance)]);
  });

  const csvContent = '\uFEFF' + rows.map((e) => e.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = getLocalDateString();
  a.href = url;
  a.download = `hishab_ai_report_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
