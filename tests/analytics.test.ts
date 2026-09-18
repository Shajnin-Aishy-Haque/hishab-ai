import { test } from 'node:test';
import assert from 'node:assert/strict';

interface MockTx {
  type: 'expense' | 'income';
  amount: number;
  categoryId: string;
  date: string;
}

test('computes savings rate and cashflow net correctly', () => {
  const transactions: MockTx[] = [
    { type: 'income', amount: 50000, categoryId: 'salary', date: '2026-09-01' },
    { type: 'expense', amount: 15000, categoryId: 'bazaar', date: '2026-09-02' },
    { type: 'expense', amount: 5000, categoryId: 'transport', date: '2026-09-10' }
  ];

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = Math.round((netSavings / totalIncome) * 100);

  assert.equal(totalIncome, 50000);
  assert.equal(totalExpense, 20000);
  assert.equal(netSavings, 30000);
  assert.equal(savingsRate, 60); // 60% saved
});

test('computes weekly breakdown buckets correctly for a month', () => {
  const transactions: MockTx[] = [
    { type: 'expense', amount: 1200, categoryId: 'food', date: '2026-09-03' }, // W1 (1-7)
    { type: 'expense', amount: 800, categoryId: 'food', date: '2026-09-07' },  // W1 (1-7)
    { type: 'expense', amount: 3000, categoryId: 'food', date: '2026-09-12' }, // W2 (8-14)
    { type: 'expense', amount: 2500, categoryId: 'food', date: '2026-09-18' }, // W3 (15-21)
    { type: 'expense', amount: 4000, categoryId: 'bills', date: '2026-09-25' } // W4 (22+)
  ];

  const week1Spent = transactions
    .filter((t) => {
      const d = parseInt(t.date.split('-')[2], 10);
      return d >= 1 && d <= 7;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const week2Spent = transactions
    .filter((t) => {
      const d = parseInt(t.date.split('-')[2], 10);
      return d >= 8 && d <= 14;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const week3Spent = transactions
    .filter((t) => {
      const d = parseInt(t.date.split('-')[2], 10);
      return d >= 15 && d <= 21;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const week4Spent = transactions
    .filter((t) => {
      const d = parseInt(t.date.split('-')[2], 10);
      return d >= 22;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  assert.equal(week1Spent, 2000);
  assert.equal(week2Spent, 3000);
  assert.equal(week3Spent, 2500);
  assert.equal(week4Spent, 4000);
});

test('identifies over-budget status and remaining amounts correctly', () => {
  const budget = 5000;
  const spentOver = 6500;
  const spentUnder = 3500;

  const isOver = spentOver > budget;
  const overAmount = spentOver - budget;
  const remaining = budget - spentUnder;

  assert.equal(isOver, true);
  assert.equal(overAmount, 1500);
  assert.equal(remaining, 1500);
});
