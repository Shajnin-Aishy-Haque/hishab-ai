import React from 'react';
import type { Category, Transaction } from '../types';

interface AnalyticsViewProps {
  categories: Category[];
  transactions: Transaction[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ categories, transactions }) => {
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const categoryStats = categories.map((cat) => {
    const spent = transactions
      .filter((t) => t.type === 'expense' && (t.categoryId === cat.id || t.categoryId.startsWith(cat.id.split('_')[0])))
      .reduce((sum, t) => sum + t.amount, 0);

    const percent = totalExpense > 0 ? Math.round((spent / totalExpense) * 100) : 0;
    return { ...cat, spent, percent };
  });

  return (
    <div className="flex-1 px-5 flex flex-col gap-4 pt-3 pb-28 animate-in fade-in duration-150">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold text-gLight-textPrimary dark:text-gDark-textPrimary">
          Insights &amp; Charts
        </h2>
        <span className="text-xs font-semibold text-gLight-blue dark:text-gDark-blue bg-gLight-surface dark:bg-gDark-surface px-3 py-1.5 rounded-full border border-black/5 dark:border-white/5">
          This Month
        </span>
      </div>

      {/* Spending by Category Card */}
      <section className="rounded-3xl bg-gLight-surface dark:bg-gDark-surface p-5 flex flex-col gap-4 shadow-sm border border-black/5 dark:border-white/5">
        <span className="text-xs font-bold uppercase tracking-wider text-gLight-textSecondary dark:text-gDark-textSecondary">
          Spending by Category
        </span>

        <div className="flex flex-col gap-3.5">
          {categoryStats.map((cat) => (
            <div key={cat.id}>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="flex items-center gap-1.5">
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </span>
                <span className="font-bold text-gLight-textPrimary dark:text-gDark-textPrimary">
                  ৳ {cat.spent.toLocaleString('en-IN')} ({cat.percent}%)
                </span>
              </div>
              <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${cat.percent}%`,
                    backgroundColor: cat.color || '#1a73e8'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Breakdown Card */}
      <section className="rounded-3xl bg-gLight-surface dark:bg-gDark-surface p-5 flex flex-col gap-3 shadow-sm border border-black/5 dark:border-white/5">
        <span className="text-xs font-bold uppercase tracking-wider text-gLight-textSecondary dark:text-gDark-textSecondary">
          Weekly Breakdown
        </span>
        <div className="flex items-end justify-between h-28 pt-4 gap-3 border-b border-black/5 dark:border-white/5 pb-2">
          <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <div className="w-full bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-t-xl h-[45%]"></div>
            <span className="text-[11px] text-gLight-textTertiary dark:text-gDark-textTertiary">W1</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <div className="w-full bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-t-xl h-[75%]"></div>
            <span className="text-[11px] text-gLight-textTertiary dark:text-gDark-textTertiary">W2</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <div className="w-full bg-gLight-blue dark:bg-gDark-blue rounded-t-xl h-[60%]"></div>
            <span className="text-[11px] text-gLight-blue dark:text-gDark-blue font-bold">W3</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <div className="w-full bg-black/5 dark:bg-white/5 border border-dashed border-black/20 dark:border-white/20 rounded-t-xl h-[20%]"></div>
            <span className="text-[11px] text-gLight-textTertiary dark:text-gDark-textTertiary">W4</span>
          </div>
        </div>
      </section>
    </div>
  );
};
