import React, { useState } from 'react';
import type { Account, DharType } from '../types';

interface NewDharModalProps {
  isOpen: boolean;
  accounts: Account[];
  onClose: () => void;
  onSave: (data: {
    person: string;
    amount: number;
    type: DharType;
    note: string;
    accountId: string;
  }) => void;
}

export const NewDharModal: React.FC<NewDharModalProps> = ({
  isOpen,
  accounts,
  onClose,
  onSave
}) => {
  const [type, setType] = useState<DharType>('pabo');
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'cash');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!person.trim() || !num || num <= 0) return;

    onSave({
      person: person.trim(),
      amount: num,
      type,
      note: note.trim() || 'ধার',
      accountId
    });

    onClose();
    setPerson('');
    setAmount('');
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-150">
      <div className="bg-gLight-surface dark:bg-gDark-surface rounded-t-3xl max-w-md w-full p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto shadow-2xl border-t border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-onBlueContainer dark:text-gDark-onBlueContainer flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-gLight-textPrimary dark:text-gDark-textPrimary">
                নতুন ধার / দেনা হিসাব
              </h3>
              <div className="text-[11px] text-gLight-textTertiary dark:text-gDark-textTertiary">
                Track lending &amp; borrowing
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center tap-press"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle: আমি পাবো vs আমি দেবো (Matches Stitch lines 1409-1418) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('pabo')}
              className={`py-2.5 rounded-2xl text-xs font-bold tap-press flex items-center justify-center gap-1 border transition-all ${
                type === 'pabo'
                  ? 'bg-gLight-surface dark:bg-gDark-surface text-gLight-green dark:text-gDark-green shadow-sm border-emerald-500/30'
                  : 'text-gLight-textTertiary dark:text-gDark-textTertiary border-black/5 dark:border-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">call_received</span>
              <span>আমি পাবো (Lent)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('debo')}
              className={`py-2.5 rounded-2xl text-xs font-bold tap-press flex items-center justify-center gap-1 border transition-all ${
                type === 'debo'
                  ? 'bg-gLight-surface dark:bg-gDark-surface text-rose-500 shadow-sm border-rose-500/30'
                  : 'text-gLight-textTertiary dark:text-gDark-textTertiary border-black/5 dark:border-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">call_made</span>
              <span>আমি দেবো (Borrowed)</span>
            </button>
          </div>

          {/* Person / Shop Name Input (Matches Stitch lines 1420-1436) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
              ব্যক্তি বা দোকানের নাম (Person / Shop)
            </label>
            <input
              type="text"
              required
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              placeholder="e.g. তানভীর, মদিনা স্টোর, রুমমেট রাকিব"
              className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-gLight-blue text-gLight-textPrimary dark:text-gDark-textPrimary"
            />
            {/* Quick Saved Contacts */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {['সাকিব', 'মদিনা স্টোর', 'তানভীর', 'রাকিব (রুমমেট)'].map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setPerson(name)}
                  className="quick-contact-chip shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 text-gLight-textTertiary dark:text-gDark-textTertiary tap-press"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
              টাকার পরিমাণ (Amount in BDT)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-bold text-sm text-gLight-textTertiary">৳</span>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                className="w-full bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl pl-9 pr-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-gLight-blue text-gLight-textPrimary dark:text-gDark-textPrimary"
              />
            </div>
          </div>

          {/* Note Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
              বিবরণ (Note / Reason)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. লাঞ্চ বিল ধার, গ্রোসারি বাকি"
              className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-gLight-blue text-gLight-textPrimary dark:text-gDark-textPrimary"
            />
          </div>

          {/* Account Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
              {type === 'pabo' ? 'টাকা দেয়া হলো কোন অ্যাকাউন্ট থেকে? (Paid From)' : 'টাকা রিসিভ হলো কোন অ্যাকাউন্টে? (Received In)'}
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full appearance-none bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 text-gLight-textPrimary dark:text-gDark-textPrimary cursor-pointer"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.icon} {acc.name} (৳{acc.balance.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
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
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>হিসাব যোগ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
