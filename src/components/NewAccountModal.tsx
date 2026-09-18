import React, { useState } from 'react';
import type { Account, AccountType } from '../types';

interface NewAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Omit<Account, 'id' | 'userId'>) => void;
}

export const NewAccountModal: React.FC<NewAccountModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let icon = '🏦';
    let color = '#1a73e8';

    if (type === 'cash') {
      icon = '💵';
      color = '#137333';
    } else if (type === 'bkash') {
      icon = '📱';
      color = '#e91e63';
    } else if (type === 'nagad') {
      icon = '🟧';
      color = '#f57c00';
    }

    onSave({
      name: name.trim(),
      type,
      balance: parseFloat(balance) || 0,
      note: type === 'bank' ? 'Bank Account' : type === 'cash' ? 'Cash' : 'MFS Wallet',
      icon,
      color
    });

    onClose();
    setName('');
    setBalance('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-150">
      <div className="bg-gLight-surface dark:bg-gDark-surface rounded-t-3xl max-w-md w-full p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto shadow-2xl border-t border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-onBlueContainer dark:text-gDark-onBlueContainer flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">account_balance</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-gLight-textPrimary dark:text-gDark-textPrimary">
                Add New Account / Wallet
              </h3>
              <div className="text-[11px] text-gLight-textTertiary dark:text-gDark-textTertiary">
                Manage separate balances easily
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
          {/* Account Name Input (Matches Stitch lines 1188-1196) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
              Account Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Brac Bank, Rocket, Upay, Savings"
              className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-gLight-blue text-gLight-textPrimary dark:text-gDark-textPrimary"
            />
          </div>

          {/* Account Type Selector Dropdown (Matches Stitch lines 1199-1209) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
              Account Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full appearance-none bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-gLight-blue text-gLight-textPrimary dark:text-gDark-textPrimary cursor-pointer"
            >
              <option value="bank">🏦 Bank Account (Commercial Bank)</option>
              <option value="bkash">📱 bKash (Mobile Banking)</option>
              <option value="nagad">🟧 Nagad (Mobile Banking)</option>
              <option value="cash">💵 Cash Wallet (পকেট ক্যাশ)</option>
            </select>
          </div>

          {/* Initial Balance Input (Matches Stitch lines 1211-1223) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
              Current Balance (৳ BDT)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-bold text-sm text-gLight-textTertiary">৳</span>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="5000"
                className="w-full bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl pl-9 pr-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-gLight-blue text-gLight-textPrimary dark:text-gDark-textPrimary"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 pt-2">
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
              <span>Save Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
