import React from 'react';

interface BalanceCardProps {
  netBalance: number;
  monthlyExpense: number;
  monthlyIncome: number;
  totalPabo: number;
  totalDebo: number;
  onOpenManual: (mode: 'expense' | 'income' | 'transfer') => void;
  onOpenAccounts: () => void;
  onOpenDhar: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  netBalance,
  monthlyExpense,
  monthlyIncome,
  totalPabo,
  totalDebo,
  onOpenManual,
  onOpenAccounts,
  onOpenDhar
}) => {
  return (
    <section className="px-4 sm:px-6 pt-4 pb-2">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gLight-surfaceHigh via-gLight-surface to-gLight-blueContainer/30 dark:from-gDark-surfaceHigh dark:via-gDark-surface dark:to-gDark-blueContainer/20 p-5 sm:p-6 border border-black/5 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gLight-textSecondary dark:text-gDark-textSecondary">
            Net Available Balance
          </span>
          <button
            onClick={onOpenAccounts}
            className="text-xs font-semibold text-gLight-blue dark:text-gDark-blue hover:underline flex items-center gap-1 tap-press"
          >
            <span>All Wallets</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-gLight-textSecondary dark:text-gDark-textSecondary">
            ৳
          </span>
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gLight-textPrimary dark:text-gDark-textPrimary">
            {netBalance.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Income vs Expense Pills */}
        <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gLight-greenContainer dark:bg-gDark-greenContainer text-gLight-green dark:text-gDark-green flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-gLight-textSecondary dark:text-gDark-textSecondary font-medium">
                Income (Month)
              </span>
              <span className="text-sm font-bold text-gLight-green dark:text-gDark-green">
                +৳{monthlyIncome.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gLight-redContainer dark:bg-gDark-redContainer text-gLight-red dark:text-gDark-red flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-gLight-textSecondary dark:text-gDark-textSecondary font-medium">
                Spent (Month)
              </span>
              <span className="text-sm font-bold text-gLight-red dark:text-gDark-red">
                -৳{monthlyExpense.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-5 flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => onOpenManual('expense')}
            className="flex-1 bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm tap-press hover:opacity-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Add Expense</span>
          </button>

          <button
            onClick={() => onOpenManual('income')}
            className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHighest text-gLight-textPrimary dark:text-gDark-textPrimary font-semibold text-xs sm:text-sm py-2.5 px-3.5 rounded-2xl flex items-center justify-center gap-1.5 tap-press hover:bg-gLight-blueContainer/40 dark:hover:bg-gDark-blueContainer/40 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">payments</span>
            <span>+ Income</span>
          </button>

          <button
            onClick={onOpenDhar}
            className="relative bg-gLight-surfaceHigh dark:bg-gDark-surfaceHighest text-gLight-textPrimary dark:text-gDark-textPrimary font-semibold text-xs sm:text-sm py-2.5 px-3.5 rounded-2xl flex items-center justify-center gap-1.5 tap-press hover:bg-gLight-blueContainer/40 dark:hover:bg-gDark-blueContainer/40 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span>Dhar Khata</span>
            {(totalPabo > 0 || totalDebo > 0) && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
