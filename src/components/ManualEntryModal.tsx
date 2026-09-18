import React, { useState } from 'react';
import type { Account, Category, TransactionType } from '../types';
import { getLocalDateString } from '../utils/dateUtils';

interface ManualEntryModalProps {
  isOpen: boolean;
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

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  isOpen,
  accounts,
  categories,
  onClose,
  onSave
}) => {
  const [mode, setMode] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'cash');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || 'bkash');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'bazaar');
  const [dateType, setDateType] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customDate, setCustomDate] = useState(getLocalDateString());

  if (!isOpen) return null;

  const handleAddAmount = (add: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + add));
  };

  const handleApplyPreset = (presetNote: string, presetCat: string, presetAcc: string) => {
    setNote(presetNote);
    const matchedCat = categories.find((c) => c.name.toLowerCase().includes(presetCat) || c.id.includes(presetCat));
    if (matchedCat) setCategoryId(matchedCat.id);
    const matchedAcc = accounts.find((a) => a.type === presetAcc || a.id.includes(presetAcc));
    if (matchedAcc) setAccountId(matchedAcc.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let finalDate = customDate;
    if (dateType === 'today') {
      finalDate = getLocalDateString();
    } else if (dateType === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      finalDate = getLocalDateString(y);
    }

    onSave({
      type: mode,
      amount: num,
      note: note.trim() || (mode === 'income' ? 'আয়' : mode === 'transfer' ? 'ওয়ালেট ট্রান্সফার' : 'খরচ'),
      categoryId,
      accountId,
      toAccountId: mode === 'transfer' ? toAccountId : undefined,
      date: finalDate,
      time: timeStr
    });

    onClose();
    setAmount('');
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-150">
      <div className="bg-gLight-surface dark:bg-gDark-surface rounded-t-3xl max-w-md w-full p-6 flex flex-col gap-4 max-h-[88vh] overflow-y-auto shadow-2xl border-t border-black/10 dark:border-white/10">
        {/* Header: 3-Way Mode Switcher (Matches Stitch lines 980-999) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={() => setMode('expense')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                mode === 'expense'
                  ? 'bg-gLight-surface dark:bg-gDark-surface text-rose-500 shadow-sm'
                  : 'text-gLight-textTertiary dark:text-gDark-textTertiary hover:text-rose-500'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">trending_down</span>
              <span>খরচ</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('income')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                mode === 'income'
                  ? 'bg-gLight-surface dark:bg-gDark-surface text-gLight-green dark:text-gDark-green shadow-sm font-bold'
                  : 'text-gLight-textTertiary dark:text-gDark-textTertiary hover:text-gLight-green dark:hover:text-gDark-green'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">trending_up</span>
              <span>আয়</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('transfer')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                mode === 'transfer'
                  ? 'bg-gLight-surface dark:bg-gDark-surface text-gLight-blue dark:text-gDark-blue shadow-sm font-bold'
                  : 'text-gLight-textTertiary dark:text-gDark-textTertiary hover:text-gLight-blue dark:hover:text-gDark-blue'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
              <span>ট্রান্সফার</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center tap-press"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Big Amount Display & Input (Matches Stitch lines 1001-1020) */}
        <div className="flex flex-col items-center justify-center py-3 bg-gLight-surfaceHigh/50 dark:bg-gDark-surfaceHigh/50 rounded-2xl border border-black/5 dark:border-white/10">
          <span className="text-xs font-semibold text-gLight-textTertiary dark:text-gDark-textTertiary">
            টাকার পরিমাণ (Amount in BDT)
          </span>
          <div className="flex items-center justify-center gap-1 my-1">
            <span className="text-3xl font-extrabold text-gLight-textPrimary dark:text-gDark-textPrimary">৳</span>
            <input
              type="number"
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-48 text-3xl font-black text-center bg-transparent border-0 focus:outline-none text-gLight-textPrimary dark:text-gDark-textPrimary placeholder:text-gLight-textTertiary/40"
            />
          </div>
          {/* Quick Amount Chips */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleAddAmount(50)}
              className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 tap-press text-gLight-textSecondary dark:text-gDark-textSecondary"
            >
              +৳৫০
            </button>
            <button
              type="button"
              onClick={() => handleAddAmount(100)}
              className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 tap-press text-gLight-textSecondary dark:text-gDark-textSecondary"
            >
              +৳১০০
            </button>
            <button
              type="button"
              onClick={() => handleAddAmount(500)}
              className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 tap-press text-gLight-textSecondary dark:text-gDark-textSecondary"
            >
              +৳৫০০
            </button>
            <button
              type="button"
              onClick={() => handleAddAmount(1000)}
              className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 tap-press text-gLight-textSecondary dark:text-gDark-textSecondary"
            >
              +৳১,০০০
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode !== 'transfer' ? (
            <>
              {/* Note / Description Input (Matches Stitch lines 1025-1040) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
                  কিসের খরচ / বিবরণ (Note)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. কাঁচাবাজার, রিকশা ভাড়া, ঔষধ, চা-নাস্তা"
                  className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-gLight-blue dark:focus:ring-gDark-blue text-gLight-textPrimary dark:text-gDark-textPrimary"
                />
                {/* Quick Note Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('কাঁচাবাজার (সবজি ও মাছ)', 'bazaar', 'cash')}
                    className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 text-gLight-textTertiary dark:text-gDark-textTertiary tap-press"
                  >
                    🥦 কাঁচাবাজার
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('রিকশা ভাড়া', 'transport', 'cash')}
                    className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 text-gLight-textTertiary dark:text-gDark-textTertiary tap-press"
                  >
                    🛺 রিকশা
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('চা ও বিস্কুট', 'food', 'cash')}
                    className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 text-gLight-textTertiary dark:text-gDark-textTertiary tap-press"
                  >
                    ☕ চা-নাস্তা
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('ফার্মেসী ঔষধ', 'medical', 'bkash')}
                    className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 text-gLight-textTertiary dark:text-gDark-textTertiary tap-press"
                  >
                    💊 ঔষধ
                  </button>
                </div>
              </div>

              {/* Account Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
                  {mode === 'income' ? 'কোন অ্যাকাউন্টে জমা হবে? (Deposit To)' : 'কোন অ্যাকাউন্ট থেকে খরচ হয়েছে? (Paid From)'}
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full appearance-none bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-gLight-blue dark:focus:ring-gDark-blue text-gLight-textPrimary dark:text-gDark-textPrimary cursor-pointer"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.icon} {acc.name} (৳{acc.balance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
                  ক্যাটাগরি বাছাই করুন (Select Category)
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full appearance-none bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-gLight-blue dark:focus:ring-gDark-blue text-gLight-textPrimary dark:text-gDark-textPrimary cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            /* Transfer Fields Group (Matches Stitch lines 1081-1126) */
            <div className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
                    From (টাকা যাবে)
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-3 py-3 text-xs font-semibold border border-black/5 dark:border-white/10 focus:outline-none text-gLight-textPrimary dark:text-gDark-textPrimary"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.icon} {acc.name} (৳{acc.balance})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
                    To (টাকা ঢুকবে)
                  </label>
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    className="w-full bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-3 py-3 text-xs font-semibold border border-black/5 dark:border-white/10 focus:outline-none text-gLight-textPrimary dark:text-gDark-textPrimary"
                  >
                    {accounts
                      .filter((a) => a.id !== accountId)
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.icon} {acc.name} (৳{acc.balance})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
                  Transfer Note (ঐচ্ছিক বিবরণ)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Bank to bKash add money, ATM cash out"
                  className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 focus:outline-none text-gLight-textPrimary dark:text-gDark-textPrimary"
                />
              </div>
            </div>
          )}

          {/* Interactive Date Picker (Matches Stitch lines 1128-1152) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-gLight-blue dark:text-gDark-blue">
                  calendar_today
                </span>
                <span>তারিখ (Date):</span>
              </span>
              <span className="text-gLight-blue dark:text-gDark-blue font-bold">
                {dateType === 'today' ? 'Today' : dateType === 'yesterday' ? 'Yesterday' : customDate}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDateType('today')}
                className={`py-2.5 px-1 rounded-xl text-xs font-bold tap-press border text-center transition-all ${
                  dateType === 'today'
                    ? 'bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-onBlueContainer dark:text-gDark-onBlueContainer border-gLight-blue/40'
                    : 'bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh text-gLight-textSecondary dark:text-gDark-textSecondary border-black/5 dark:border-white/10'
                }`}
              >
                আজকে (Today)
              </button>
              <button
                type="button"
                onClick={() => setDateType('yesterday')}
                className={`py-2.5 px-1 rounded-xl text-xs font-bold tap-press border text-center transition-all ${
                  dateType === 'yesterday'
                    ? 'bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-onBlueContainer dark:text-gDark-onBlueContainer border-gLight-blue/40'
                    : 'bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh text-gLight-textSecondary dark:text-gDark-textSecondary border-black/5 dark:border-white/10'
                }`}
              >
                গতকাল (Yesterday)
              </button>
              <label
                className={`relative py-2.5 px-1 rounded-xl text-xs font-medium tap-press border text-center transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  dateType === 'custom'
                    ? 'bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-onBlueContainer dark:text-gDark-onBlueContainer border-gLight-blue/40 font-bold'
                    : 'bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh text-gLight-textSecondary dark:text-gDark-textSecondary border-black/5 dark:border-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">edit_calendar</span>
                <span>অন্য দিন</span>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setDateType('custom');
                  }}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full text-xs font-bold text-gLight-textSecondary dark:text-gDark-textSecondary hover:bg-black/5 dark:hover:bg-white/5 tap-press transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg py-3.5 rounded-full text-xs font-bold tap-press shadow-md hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{mode === 'expense' ? 'Save Expense' : mode === 'income' ? 'Save Income' : 'Transfer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
