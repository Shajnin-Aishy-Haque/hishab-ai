import { test } from 'node:test';
import assert from 'node:assert/strict';

interface Account {
  id: string;
  balance: number;
}

interface Transaction {
  id: number;
  type: 'expense' | 'income';
  amount: number;
  accountId: string;
}

function reconcileEditedTransaction(
  oldTx: Transaction,
  updated: Transaction,
  accounts: Account[]
): Account[] {
  const updatedAccounts = accounts.map((a) => ({ ...a }));

  if (oldTx.accountId === updated.accountId) {
    const acc = updatedAccounts.find((a) => a.id === updated.accountId);
    if (acc) {
      const oldDelta = oldTx.type === 'income' ? oldTx.amount : -oldTx.amount;
      const newDelta = updated.type === 'income' ? updated.amount : -updated.amount;
      const balanceDiff = newDelta - oldDelta;
      acc.balance += balanceDiff;
    }
  } else {
    const oldAcc = updatedAccounts.find((a) => a.id === oldTx.accountId);
    if (oldAcc) {
      const oldDelta = oldTx.type === 'income' ? oldTx.amount : -oldTx.amount;
      oldAcc.balance -= oldDelta;
    }
    const newAcc = updatedAccounts.find((a) => a.id === updated.accountId);
    if (newAcc) {
      const newDelta = updated.type === 'income' ? updated.amount : -updated.amount;
      newAcc.balance += newDelta;
    }
  }

  return updatedAccounts;
}

test('reconciles same account expense adjustment (increasing amount)', () => {
  const initialAccounts: Account[] = [{ id: 'cash', balance: 5000 }];
  const oldTx: Transaction = { id: 1, type: 'expense', amount: 500, accountId: 'cash' };
  const updatedTx: Transaction = { id: 1, type: 'expense', amount: 700, accountId: 'cash' };

  const res = reconcileEditedTransaction(oldTx, updatedTx, initialAccounts);
  // Cash was 5000 after 500 expense. If expense becomes 700, balance decreases by 200 -> 4800
  assert.equal(res.find((a) => a.id === 'cash')?.balance, 4800);
});

test('reconciles same account expense adjustment (decreasing amount)', () => {
  const initialAccounts: Account[] = [{ id: 'cash', balance: 5000 }];
  const oldTx: Transaction = { id: 1, type: 'expense', amount: 500, accountId: 'cash' };
  const updatedTx: Transaction = { id: 1, type: 'expense', amount: 300, accountId: 'cash' };

  const res = reconcileEditedTransaction(oldTx, updatedTx, initialAccounts);
  // Expense decreased by 200, so cash balance increases by 200 -> 5200
  assert.equal(res.find((a) => a.id === 'cash')?.balance, 5200);
});

test('reconciles cross-account wallet change correctly', () => {
  const initialAccounts: Account[] = [
    { id: 'cash', balance: 4500 }, // had -500 expense
    { id: 'bkash', balance: 10000 }
  ];
  // User changes payment source from cash to bkash
  const oldTx: Transaction = { id: 1, type: 'expense', amount: 500, accountId: 'cash' };
  const updatedTx: Transaction = { id: 1, type: 'expense', amount: 500, accountId: 'bkash' };

  const res = reconcileEditedTransaction(oldTx, updatedTx, initialAccounts);
  // Cash should get 500 back -> 5000
  assert.equal(res.find((a) => a.id === 'cash')?.balance, 5000);
  // bKash should be deducted 500 -> 9500
  assert.equal(res.find((a) => a.id === 'bkash')?.balance, 9500);
});

test('reconciles transfer deletion correctly by refunding source and deducting target', () => {
  const accounts: Account[] = [
    { id: 'bank', balance: 20000 },
    { id: 'bkash', balance: 5000 }
  ];

  // Transfer of 3000 from bank to bkash
  const transferTx = { id: 2, type: 'transfer' as const, amount: 3000, accountId: 'bank', toAccountId: 'bkash' };

  // Deleting the transfer reverts both accounts
  const revertedAccounts = accounts.map(a => ({ ...a }));
  const fromAcc = revertedAccounts.find(a => a.id === transferTx.accountId);
  const toAcc = revertedAccounts.find(a => a.id === transferTx.toAccountId);
  if (fromAcc) fromAcc.balance += transferTx.amount;
  if (toAcc) toAcc.balance -= transferTx.amount;

  assert.equal(revertedAccounts.find(a => a.id === 'bank')?.balance, 23000);
  assert.equal(revertedAccounts.find(a => a.id === 'bkash')?.balance, 2000);
});

test('reconciles transfer amount modification correctly', () => {
  const accounts: Account[] = [
    { id: 'bank', balance: 17000 }, // had 3000 transferred out
    { id: 'bkash', balance: 8000 }   // had 3000 transferred in
  ];

  const oldTransfer = { id: 3, type: 'transfer' as const, amount: 3000, accountId: 'bank', toAccountId: 'bkash' };
  const updatedTransfer = { id: 3, type: 'transfer' as const, amount: 5000, accountId: 'bank', toAccountId: 'bkash' };

  // 1. Revert old transfer
  const reconciled = accounts.map(a => ({ ...a }));
  const oldFrom = reconciled.find(a => a.id === oldTransfer.accountId);
  const oldTo = reconciled.find(a => a.id === oldTransfer.toAccountId);
  if (oldFrom) oldFrom.balance += oldTransfer.amount; // 17000 + 3000 = 20000
  if (oldTo) oldTo.balance -= oldTransfer.amount;     // 8000 - 3000 = 5000

  // 2. Apply new transfer
  const newFrom = reconciled.find(a => a.id === updatedTransfer.accountId);
  const newTo = reconciled.find(a => a.id === updatedTransfer.toAccountId);
  if (newFrom) newFrom.balance -= updatedTransfer.amount; // 20000 - 5000 = 15000
  if (newTo) newTo.balance += updatedTransfer.amount;     // 5000 + 5000 = 10000

  assert.equal(reconciled.find(a => a.id === 'bank')?.balance, 15000);
  assert.equal(reconciled.find(a => a.id === 'bkash')?.balance, 10000);
});
