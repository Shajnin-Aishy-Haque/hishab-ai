import React, { useState, useEffect } from 'react';
import type { Transaction, Account, Category } from '../types';

interface EditTransactionModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
  onSave: (updated: Transaction) => void;
  onDelete: (id: number) => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  transaction,
  accounts,
  categories,
  onClose,
  onSave,
  onDelete
}) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [location, setLocation] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (transaction) {
      setAmount(String(transaction.amount));
      setNote(transaction.note || '');
      setLocation(transaction.location || '');
      setCategoryId(transaction.categoryId || '');
      setAccountId(transaction.accountId || '');
      setDate(transaction.date || '');
      setTime(transaction.time || '');
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    onSave({
      ...transaction,
      amount: numAmount,
      note: note.trim() || 'Expense',
      location: location.trim(),
      categoryId,
      accountId,
      date,
      time
    });
    onClose();
  };

  const handleDelete = () => {
    if (transaction.id && confirm('আপনি কি নিশ্চিত এই লেনদেনটি মুছে ফেলতে চান?')) {
      onDelete(transaction.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-150">
      <div className="bg-gLight-surface dark:bg-gDark-surface rounded-t-3xl max-w-md w-full p-6 flex flex-col gap-4 modal-bottom-sheet overflow-y-auto shadow-2xl border-t border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gLight-blue dark:text-gDark-blue text-[22px]">
              edit_note
            </span>
            <h3 className="text-base font-bold text-gLight-textPrimary dark:text-gDark-textPrimary">
              লেনদেন সম্পাদনা (Edit Transaction)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center tap-press"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Big Amount */}
          <div className="flex flex-col items-center justify-center py-3 bg-gLight-surfaceHigh/50 dark:bg-gDark-surfaceHigh/50 rounded-2xl border border-black/5 dark:border-white/10">
            <span className="text-xs font-semibold text-gLight-textTertiary dark:text-gDark-textTertiary">
              টাকার পরিমাণ (Amount in BDT)
            </span>
            <div className="flex items-center justify-center gap-1 my-1">
              <span className="text-3xl font-extrabold text-gLight-textPrimary dark:text-gDark-textPrimary">৳</span>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-48 text-3xl font-black text-center bg-transparent border-0 focus:outline-none text-gLight-textPrimary dark:text-gDark-textPrimary"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
              বিবরণ / নোট (Description)
            </label>
            <input
              type="text"
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-gLight-blue dark:focus:ring-gDark-blue text-gLight-textPrimary dark:text-gDark-textPrimary"
            />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
              স্থান / দোকান (Location - optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kawran Bazar, Dhanmondi"
              className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-gLight-blue dark:focus:ring-gDark-blue text-gLight-textPrimary dark:text-gDark-textPrimary"
            />
          </div>

          {/* Account and Category */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
                Account / Wallet
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-3 py-3 text-xs font-semibold border border-black/5 dark:border-white/10 focus:outline-none text-gLight-textPrimary dark:text-gDark-textPrimary"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.icon} {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-3 py-3 text-xs font-semibold border border-black/5 dark:border-white/10 focus:outline-none text-gLight-textPrimary dark:text-gDark-textPrimary"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-3 py-2.5 text-xs font-semibold border border-black/5 dark:border-white/10 text-gLight-textPrimary dark:text-gDark-textPrimary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
                Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-3 py-2.5 text-xs font-semibold border border-black/5 dark:border-white/10 text-gLight-textPrimary dark:text-gDark-textPrimary"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleDelete}
              className="py-3 px-4 rounded-full text-xs font-bold text-rose-500 hover:bg-rose-500/10 tap-press transition-colors flex items-center justify-center gap-1 border border-rose-500/20"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              <span>মুছে ফেলুন</span>
            </button>
            <button
              type="submit"
              className="flex-1 bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg py-3 rounded-full text-xs font-bold tap-press shadow-md hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>পরিবর্তন সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
