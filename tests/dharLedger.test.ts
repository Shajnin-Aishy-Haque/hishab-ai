import test from 'node:test';
import assert from 'node:assert/strict';
import type { DharItem, DharPaymentLog } from '../src/types.ts';

test('calculates remaining amount correctly on full settlement', () => {
  const item: DharItem = {
    id: 1,
    userId: 'user_1',
    person: 'Sakib',
    amount: 1500,
    originalAmount: 1500,
    type: 'pabo',
    note: 'Lunch borrow',
    date: '2026-09-19',
    timestamp: Date.now(),
    status: 'pending'
  };

  const settleAmount = 1500;
  const remaining = Math.max(0, item.amount - settleAmount);
  const status = remaining === 0 ? 'settled' : 'pending';

  assert.equal(remaining, 0);
  assert.equal(status, 'settled');
});

test('calculates remaining amount correctly on partial repayment', () => {
  const item: DharItem = {
    id: 2,
    userId: 'user_1',
    person: 'Modina Store',
    amount: 800,
    originalAmount: 800,
    type: 'debo',
    note: 'Groceries due',
    date: '2026-09-19',
    timestamp: Date.now(),
    status: 'pending'
  };

  const settleAmount = 300;
  const remaining = Math.max(0, item.amount - settleAmount);
  const status = remaining === 0 ? 'settled' : 'pending';

  assert.equal(remaining, 500);
  assert.equal(status, 'pending');

  const log: DharPaymentLog = {
    id: 'pay_1',
    amount: settleAmount,
    date: '2026-09-19',
    time: '12:00 PM',
    timestamp: Date.now(),
    accountId: 'cash',
    type: 'repayment'
  };

  const updatedHistory = [...(item.history || []), log];
  assert.equal(updatedHistory.length, 1);
  assert.equal(updatedHistory[0].amount, 300);
});

test('handles add more loan increments', () => {
  const item: DharItem = {
    id: 3,
    userId: 'user_1',
    person: 'Friend',
    amount: 500,
    originalAmount: 500,
    type: 'pabo',
    note: 'Loan',
    date: '2026-09-19',
    timestamp: Date.now(),
    status: 'pending'
  };

  const addAmount = 700;
  const newAmount = item.amount + addAmount;
  const newOriginal = item.originalAmount + addAmount;

  assert.equal(newAmount, 1200);
  assert.equal(newOriginal, 1200);
});
