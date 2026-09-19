import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBackupSchema, type BackupSnapshot } from '../src/services/backupValidation.ts';

test('validates BackupSnapshot structure', () => {
  const mockSnapshot: BackupSnapshot = {
    app: 'Hishab AI',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    formattedDate: new Date().toLocaleString(),
    accounts: [
      { id: 'cash_1', userId: 'user_1', name: 'Cash', type: 'cash', balance: 5000, note: '', icon: '💵', color: '#137333' }
    ],
    categories: [
      { id: 'cat_0', userId: 'user_1', name: 'Bazaar', icon: '🛒', budget: 15000, color: '#1a73e8', keywords: ['bazaar'] }
    ],
    transactions: [
      { id: 1, userId: 'user_1', type: 'expense', amount: 350, note: 'Murgi', categoryId: 'cat_0', accountId: 'cash_1', date: '2026-09-19', time: '11:00 AM', timestamp: Date.now(), icon: '🥦' }
    ],
    dharItems: [],
    stats: {
      netBalance: 5000,
      totalTransactions: 1,
      totalPabo: 0,
      totalDebo: 0
    }
  };

  assert.equal(mockSnapshot.app, 'Hishab AI');
  assert.equal(mockSnapshot.version, '2.0.0');
  assert.equal(mockSnapshot.accounts.length, 1);
  assert.equal(mockSnapshot.transactions.length, 1);
  assert.equal(mockSnapshot.stats.netBalance, 5000);
});

test('ensures CSV UTF-8 BOM encoding for Bengali character preservation', () => {
  const rows = [
    ['বিবরণ', 'পরিমাণ'],
    ['কাঁচাবাজার', '৫০০']
  ];
  const csvContent = '\uFEFF' + rows.map((r) => r.join(',')).join('\n');
  assert.ok(csvContent.startsWith('\uFEFF'));
  assert.ok(csvContent.includes('কাঁচাবাজার'));
});

test('validateBackupSchema correctly parses and sanitizes valid backup', () => {
  const validData = {
    app: 'Hishab AI',
    version: '2.0.0',
    accounts: [
      { id: 'acc_1', name: 'Cash', type: 'cash', balance: 2500 }
    ],
    categories: [
      { id: 'cat_1', name: 'Groceries', budget: 5000 }
    ],
    transactions: [
      { amount: 200, type: 'expense', note: 'Eggs & Milk', date: '2026-09-19', time: '10:00 AM' }
    ],
    dharItems: [
      { person: 'Karim', amount: 500, type: 'pabo', status: 'pending' }
    ]
  };

  const res = validateBackupSchema(validData);
  assert.equal(res.valid, true);
  assert.equal(res.counts?.accounts, 1);
  assert.equal(res.counts?.transactions, 1);
  assert.equal(res.counts?.dharItems, 1);
  assert.equal(res.sanitized?.stats.netBalance, 2500);
});

test('validateBackupSchema rejects corrupted and empty payloads', () => {
  const emptyRes = validateBackupSchema(null);
  assert.equal(emptyRes.valid, false);

  const nonObjRes = validateBackupSchema('string_data');
  assert.equal(nonObjRes.valid, false);

  const corruptedRes = validateBackupSchema({
    randomKey: 123
  });
  assert.equal(corruptedRes.valid, false);
  assert.ok(corruptedRes.errors.length > 0);
});
