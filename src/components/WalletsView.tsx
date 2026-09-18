import React, { useState } from 'react';
import type { Account, Transaction } from '../types';

interface WalletsViewProps {
  accounts: Account[];
  transactions: Transaction[];
  onBack: () => void;
  onOpenTransfer: () => void;
  onOpenAddAccount: () => void;
  onUpdateBalance: (accountId: string, newBalance: number) => void;
}

export const WalletsView: React.FC<WalletsViewProps> = ({
  accounts,
  transactions,
  onBack,
  onOpenTransfer,
  onOpenAddAccount,
  onUpdateBalance
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [selectedAccId, setSelectedAccId] = useState<string | null>(null);

  const totalNet = accounts.reduce((sum, a) => sum + a.balance, 0);

  const handleSaveEdit = (accId: string) => {
    const val = parseFloat(editAmount);
    if (!isNaN(val)) {
      onUpdateBalance(accId, val);
    }
    setEditingId(null);
  };

  const accountTxs = transactions.filter((t) => t.accountId === selectedAccId || t.toAccountId === selectedAccId);

  return (
    <div className="flex-1 px-5 flex flex-col gap-4 pt-3 pb-28 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-gLight-surface dark:bg-gDark-surface flex items-center justify-center text-gLight-textSecondary dark:text-gDark-textSecondary tap-press"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <h2 className="text-lg font-bold text-gLight-textPrimary dark:text-gDark-textPrimary">
            Wallets &amp; Accounts
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenTransfer}
            className="text-xs font-bold text-gLight-blue dark:text-gDark-blue bg-gLight-blueContainer dark:bg-gDark-blueContainer px-3 py-1.5 rounded-full tap-press flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            <span>Transfer</span>
          </button>
          <button
            onClick={onOpenAddAccount}
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gLight-textSecondary dark:text-gDark-textSecondary hover:bg-black/10 dark:hover:bg-white/20 tap-press"
            title="Add Account"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        </div>
      </div>

      {/* Net Total Hero Card */}
      <div className="rounded-3xl bg-gradient-to-br from-gLight-surface via-gLight-surfaceHigh to-gLight-blueContainer/30 dark:from-gDark-surface dark:via-gDark-surfaceHigh dark:to-gDark-blueContainer/20 p-6 flex flex-col shadow-sm border border-black/5 dark:border-white/5">
        <span className="text-xs font-semibold uppercase tracking-wider text-gLight-textSecondary dark:text-gDark-textSecondary">
          Total Net Available Funds
        </span>
        <div className="flex items-baseline gap-1 my-2">
          <span className="text-2xl font-bold text-gLight-textSecondary dark:text-gDark-textSecondary">৳</span>
          <span className="text-4xl font-extrabold tracking-tight text-gLight-textPrimary dark:text-gDark-textPrimary">
            {totalNet.toLocaleString('en-IN')}
          </span>
        </div>
        <span className="text-xs text-gLight-textTertiary dark:text-gDark-textTertiary">
          Across {accounts.length} active wallets &amp; bank accounts
        </span>
      </div>

      {/* Accounts List */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gLight-textSecondary dark:text-gDark-textSecondary px-1">
          Your Wallets
        </span>

        {accounts.map((acc) => {
          const isSelected = selectedAccId === acc.id;
          const isEditing = editingId === acc.id;

          return (
            <div
              key={acc.id}
              className={`rounded-3xl p-4.5 border transition-all ${
                isSelected
                  ? 'bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh border-gLight-blue dark:border-gDark-blue shadow-md'
                  : 'bg-gLight-surface dark:bg-gDark-surface border-black/5 dark:border-white/5 hover:border-black/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  onClick={() => setSelectedAccId(isSelected ? null : acc.id)}
                  className="flex items-center gap-3.5 cursor-pointer flex-1"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                    style={{ backgroundColor: `${acc.color}20` }}
                  >
                    <span>{acc.icon}</span>
                  </div>
                  <div>
                    <span className="font-bold text-sm sm:text-base text-gLight-textPrimary dark:text-gDark-textPrimary block">
                      {acc.name}
                    </span>
                    <span className="text-xs text-gLight-textSecondary dark:text-gDark-textSecondary">
                      {acc.note || acc.type.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-24 px-2 py-1 bg-gLight-bg dark:bg-gDark-bg rounded-xl text-sm font-bold border border-gLight-blue"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(acc.id)}
                        className="w-8 h-8 rounded-xl bg-gLight-green text-white flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setEditingId(acc.id);
                        setEditAmount(String(acc.balance));
                      }}
                      className="text-right cursor-pointer group flex items-center gap-1"
                      title="Click to adjust balance"
                    >
                      <span className="font-extrabold text-base sm:text-lg text-gLight-textPrimary dark:text-gDark-textPrimary">
                        ৳{acc.balance.toLocaleString('en-IN')}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-gLight-textTertiary dark:text-gDark-textTertiary group-hover:text-gLight-blue">
                        edit
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Account details when selected */}
              {isSelected && (
                <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs text-gLight-textSecondary dark:text-gDark-textSecondary">
                    <span>Recent Transactions ({accountTxs.length})</span>
                    <button
                      onClick={onOpenTransfer}
                      className="text-gLight-blue dark:text-gDark-blue font-bold flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                      <span>Transfer Money</span>
                    </button>
                  </div>

                  {accountTxs.length === 0 ? (
                    <p className="text-xs text-gLight-textTertiary py-2 text-center">
                      No recent transactions for this wallet.
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {accountTxs.slice(0, 5).map((tx) => {
                        const isIncoming = tx.type === 'income' || (tx.type === 'transfer' && tx.toAccountId === acc.id);
                        return (
                          <div
                            key={tx.id}
                            className="py-1.5 px-2 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs"
                          >
                            <span className="truncate pr-2 font-medium">{tx.note}</span>
                            <span
                              className={`font-bold shrink-0 ${
                                isIncoming
                                  ? 'text-gLight-green dark:text-gDark-green'
                                  : 'text-gLight-textPrimary dark:text-gDark-textPrimary'
                              }`}
                            >
                              {isIncoming ? '+ ৳' : '- ৳'}
                              {tx.amount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
