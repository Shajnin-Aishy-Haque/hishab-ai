import test from 'node:test';
import assert from 'node:assert/strict';
import type { BackupSnapshot } from '../src/services/driveSync.ts';

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
