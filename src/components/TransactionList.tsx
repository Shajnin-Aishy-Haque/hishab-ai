import React from 'react';
import type { Transaction, Account, Category } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Record<string, Account>;
  categories: Record<string, Category>;
  onDeleteTransaction: (id: number) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  accounts,
  categories,
  onDeleteTransaction
}) => {
  if (transactions.length === 0) {
    return (
      <div className="px-4 sm:px-6 py-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-3xl bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh flex items-center justify-center text-gLight-textTertiary dark:text-gDark-textTertiary mb-3">
          <span className="material-symbols-outlined text-[32px]">receipt_long</span>
        </div>
        <p className="text-sm font-semibold text-gLight-textPrimary dark:text-gDark-textPrimary">
          No transactions found
        </p>
        <p className="text-xs text-gLight-textSecondary dark:text-gDark-textSecondary mt-1 max-w-[240px]">
          Say or write an expense above (e.g. &quot;Rickshaw 50&quot;) to start tracking instantly!
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-2 space-y-2.5 pb-24">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-gLight-textSecondary dark:text-gDark-textSecondary">
          Recent Transactions
        </span>
        <span className="text-xs text-gLight-textTertiary dark:text-gDark-textTertiary">
          {transactions.length} items
        </span>
      </div>

      {transactions.map((tx) => {
        const cat = categories[tx.categoryId];
        const acc = accounts[tx.accountId];
        const isIncome = tx.type === 'income';
        const isTransfer = tx.type === 'transfer';

        return (
          <div
            key={tx.id}
            className="group relative bg-gLight-surface dark:bg-gDark-surface rounded-2xl p-4 flex items-center justify-between border border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-white/15 transition-all shadow-xs"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Category Icon Box */}
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-xs"
                style={{
                  backgroundColor: cat?.color ? `${cat.color}20` : 'rgba(100,100,100,0.1)',
                  color: cat?.color || 'currentColor'
                }}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {tx.icon || cat?.icon || 'payments'}
                </span>
              </div>

              {/* Title & Metadata */}
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm text-gLight-textPrimary dark:text-gDark-textPrimary truncate">
                  {tx.note}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-gLight-textSecondary dark:text-gDark-textSecondary">
                  <span>{tx.time || 'Today'}</span>
                  <span>•</span>
                  <span className="font-medium text-[11px] px-1.5 py-0.2 rounded-md bg-black/5 dark:bg-white/10">
                    {acc?.name || 'Wallet'}
                  </span>
                  {cat && (
                    <>
                      <span>•</span>
                      <span className="truncate">{cat.name.split('&')[0]}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Amount & Delete Action */}
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`font-bold text-base sm:text-lg ${
                  isIncome
                    ? 'text-gLight-green dark:text-gDark-green'
                    : isTransfer
                    ? 'text-gLight-blue dark:text-gDark-blue'
                    : 'text-gLight-textPrimary dark:text-gDark-textPrimary'
                }`}
              >
                {isIncome ? '+ ৳' : isTransfer ? '➔ ৳' : '- ৳'}
                {tx.amount.toLocaleString('en-IN')}
              </span>

              <button
                onClick={() => tx.id && onDeleteTransaction(tx.id)}
                title="Delete Transaction"
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 w-8 h-8 rounded-full flex items-center justify-center text-gLight-textTertiary dark:text-gDark-textTertiary hover:text-red-500 hover:bg-red-500/10 transition-all tap-press"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
