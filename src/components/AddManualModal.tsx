import React, { useState } from 'react';
import type { Account, Category, TransactionType } from '../types';

interface AddManualModalProps {
  isOpen: boolean;
  initialMode: TransactionType;
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
  onSave: (data: {
    type: TransactionType;
    amount: number;
    note: string;
    categoryId: string;
    accountId: string;
    toAccountId?: string;
    date: string;
    time: string;
  }) => void;
}

export const AddManualModal: React.FC<AddManualModalProps> = ({
  isOpen,
  initialMode,
  accounts,
  categories,
  onClose,
  onSave
}) => {
  const [mode, setMode] = useState<TransactionType>(initialMode);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'bazaar');
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'cash');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || 'bkash');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    onSave({
      type: mode,
      amount: numAmount,
      note: note.trim() || (mode === 'income' ? 'Income' : mode === 'transfer' ? 'Wallet Transfer' : 'Expense'),
      categoryId,
      accountId,
      toAccountId: mode === 'transfer' ? toAccountId : undefined,
      date: dateStr,
      time: timeStr
    });

    onClose();
    setAmount('');
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-gLight-bg dark:bg-gDark-surface rounded-3xl p-6 shadow-xl border border-black/10 dark:border-white/10 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
          <span className="font-bold text-lg text-gLight-textPrimary dark:text-gDark-textPrimary">
            Add Transaction
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gLight-textSecondary dark:text-gDark-textSecondary hover:bg-black/5 dark:hover:bg-white/5 tap-press"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Mode Selector */}
        <div className="mt-4 grid grid-cols-3 gap-2 bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setMode('expense')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'expense'
                ? 'bg-gLight-red text-white shadow-xs'
                : 'text-gLight-textSecondary dark:text-gDark-textSecondary hover:text-gLight-textPrimary'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setMode('income')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'income'
                ? 'bg-gLight-green text-white shadow-xs'
                : 'text-gLight-textSecondary dark:text-gDark-textSecondary hover:text-gLight-textPrimary'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setMode('transfer')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'transfer'
                ? 'bg-gLight-blue text-white shadow-xs'
                : 'text-gLight-textSecondary dark:text-gDark-textSecondary hover:text-gLight-textPrimary'
            }`}
          >
            Transfer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gLight-textSecondary dark:text-gDark-textSecondary mb-1">
              Amount (BDT)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xl font-bold text-gLight-textSecondary dark:text-gDark-textSecondary">
                ৳
              </span>
              <input
                type="number"
                step="any"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 bg-gLight-surface dark:bg-gDark-surfaceHigh rounded-2xl font-bold text-2xl text-gLight-textPrimary dark:text-gDark-textPrimary focus:outline-none focus:ring-2 focus:ring-gLight-blue dark:focus:ring-gDark-blue border border-black/5 dark:border-white/5"
              />
            </div>
          </div>

          {/* Note Field */}
          <div>
            <label className="block text-xs font-semibold uppercase text-gLight-textSecondary dark:text-gDark-textSecondary mb-1">
              Description / Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={mode === 'expense' ? 'e.g. Shwapno Grocery' : mode === 'income' ? 'e.g. Monthly Salary' : 'e.g. ATM to Cash'}
              className="w-full px-4 py-3 bg-gLight-surface dark:bg-gDark-surfaceHigh rounded-2xl text-sm text-gLight-textPrimary dark:text-gDark-textPrimary focus:outline-none focus:ring-2 focus:ring-gLight-blue dark:focus:ring-gDark-blue border border-black/5 dark:border-white/5 font-medium"
            />
          </div>

          {/* Account Selector */}
          <div className={mode === 'transfer' ? 'grid grid-cols-2 gap-3' : ''}>
            <div>
              <label className="block text-xs font-semibold uppercase text-gLight-textSecondary dark:text-gDark-textSecondary mb-1">
                {mode === 'transfer' ? 'From Account' : 'Account / Wallet'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-4 py-3 bg-gLight-surface dark:bg-gDark-surfaceHigh rounded-2xl text-sm font-medium text-gLight-textPrimary dark:text-gDark-textPrimary focus:outline-none border border-black/5 dark:border-white/5"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (৳{acc.balance.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            {mode === 'transfer' && (
              <div>
                <label className="block text-xs font-semibold uppercase text-gLight-textSecondary dark:text-gDark-textSecondary mb-1">
                  To Account
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-4 py-3 bg-gLight-surface dark:bg-gDark-surfaceHigh rounded-2xl text-sm font-medium text-gLight-textPrimary dark:text-gDark-textPrimary focus:outline-none border border-black/5 dark:border-white/5"
                >
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (৳{acc.balance.toLocaleString('en-IN')})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Category Selector (only for expense/income) */}
          {mode !== 'transfer' && (
            <div>
              <label className="block text-xs font-semibold uppercase text-gLight-textSecondary dark:text-gDark-textSecondary mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 bg-gLight-surface dark:bg-gDark-surfaceHigh rounded-2xl text-sm font-medium text-gLight-textPrimary dark:text-gDark-textPrimary focus:outline-none border border-black/5 dark:border-white/5"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg font-bold text-sm shadow-md hover:opacity-95 tap-press transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">save</span>
              <span>Save Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
