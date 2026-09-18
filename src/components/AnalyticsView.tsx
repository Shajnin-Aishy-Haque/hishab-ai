import React, { useState } from 'react';
import type { Category, Transaction } from '../types';
import { getLocalDateString } from '../utils/dateUtils';

interface AnalyticsViewProps {
  categories: Category[];
  transactions: Transaction[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ categories, transactions }) => {
  const [filterMode, setFilterMode] = useState<'thisMonth' | 'allTime'>('thisMonth');

  const todayStr = getLocalDateString();
  const currentYearMonth = todayStr.substring(0, 7); // 'YYYY-MM'
  const currentDay = parseInt(todayStr.split('-')[2], 10);

  // Month Name for UI
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthIndex = new Date().getMonth();
  const currentMonthLabel = `${monthNames[currentMonthIndex]} ${new Date().getFullYear()}`;

  // Filter transactions based on selected timeframe
  const scopedTransactions = transactions.filter((t) => {
    if (filterMode === 'allTime') return true;
    const txDate = t.date || getLocalDateString(new Date(t.timestamp));
    return txDate.startsWith(currentYearMonth);
  });

  const totalExpense = scopedTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = scopedTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Real Weekly Breakdown for Current Month
  const currentMonthExpenses = transactions.filter((t) => {
    if (t.type !== 'expense') return false;
    const txDate = t.date || getLocalDateString(new Date(t.timestamp));
    return txDate.startsWith(currentYearMonth);
  });

  const week1Spent = currentMonthExpenses
    .filter((t) => {
      const day = parseInt((t.date || '').split('-')[2] || '1', 10);
      return day >= 1 && day <= 7;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const week2Spent = currentMonthExpenses
    .filter((t) => {
      const day = parseInt((t.date || '').split('-')[2] || '1', 10);
      return day >= 8 && day <= 14;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const week3Spent = currentMonthExpenses
    .filter((t) => {
      const day = parseInt((t.date || '').split('-')[2] || '1', 10);
      return day >= 15 && day <= 21;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const week4Spent = currentMonthExpenses
    .filter((t) => {
      const day = parseInt((t.date || '').split('-')[2] || '1', 10);
      return day >= 22;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const weeks = [
    { label: 'W1', sub: '1-7', amount: week1Spent, isCurrent: currentDay >= 1 && currentDay <= 7 },
    { label: 'W2', sub: '8-14', amount: week2Spent, isCurrent: currentDay >= 8 && currentDay <= 14 },
    { label: 'W3', sub: '15-21', amount: week3Spent, isCurrent: currentDay >= 15 && currentDay <= 21 },
    { label: 'W4', sub: '22+', amount: week4Spent, isCurrent: currentDay >= 22 }
  ];

  const maxWeeklyAmount = Math.max(...weeks.map((w) => w.amount), 1);
  const avgDailySpend = currentDay > 0 ? Math.round(totalExpense / currentDay) : totalExpense;

  // Group by Category with exact mapping
  const categoryStats = categories
    .map((cat) => {
      const spent = scopedTransactions
        .filter((t) => t.type === 'expense' && (t.categoryId === cat.id || t.categoryId.toLowerCase() === cat.name.toLowerCase()))
        .reduce((sum, t) => sum + t.amount, 0);

      const percent = totalExpense > 0 ? Math.round((spent / totalExpense) * 100) : 0;
      const budget = cat.budget || 0;
      const isOverBudget = budget > 0 && spent > budget;
      const overAmount = isOverBudget ? spent - budget : 0;

      return { ...cat, spent, percent, budget, isOverBudget, overAmount };
    })
    .sort((a, b) => b.spent - a.spent);

  // Top spending category
  const topCategory = categoryStats.length > 0 && categoryStats[0].spent > 0 ? categoryStats[0] : null;

  return (
    <div className="flex-1 px-5 flex flex-col gap-4 pt-3 pb-32 animate-in fade-in duration-150">
      {/* Header with timeframe toggle */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold text-gLight-textPrimary dark:text-gDark-textPrimary">
            Analytics &amp; Insights
          </h2>
          <span className="text-xs text-gLight-textTertiary dark:text-gDark-textTertiary font-medium">
            {filterMode === 'thisMonth' ? currentMonthLabel : 'All Recorded Transactions'}
          </span>
        </div>

        {/* Toggle Pills */}
        <div className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh p-1 rounded-full flex items-center border border-black/5 dark:border-white/10 text-xs font-semibold">
          <button
            onClick={() => setFilterMode('thisMonth')}
            className={`px-3 py-1 rounded-full transition-all ${
              filterMode === 'thisMonth'
                ? 'bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg shadow-sm'
                : 'text-gLight-textSecondary dark:text-gDark-textSecondary hover:text-gLight-textPrimary'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setFilterMode('allTime')}
            className={`px-3 py-1 rounded-full transition-all ${
              filterMode === 'allTime'
                ? 'bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg shadow-sm'
                : 'text-gLight-textSecondary dark:text-gDark-textSecondary hover:text-gLight-textPrimary'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* 1. Cashflow Summary Card */}
      <section className="rounded-3xl bg-gLight-surface dark:bg-gDark-surface p-4 sm:p-5 shadow-sm border border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gLight-textSecondary dark:text-gDark-textSecondary">
            Cashflow Overview
          </span>
          {totalIncome > 0 && (
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                savingsRate >= 20
                  ? 'text-emerald-500 bg-emerald-500/10'
                  : savingsRate >= 0
                  ? 'text-blue-500 bg-blue-500/10'
                  : 'text-red-500 bg-red-500/10'
              }`}
            >
              Savings Rate: {savingsRate}%
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-black/5 dark:divide-white/10">
          <div className="flex flex-col items-center px-1">
            <span className="text-[11px] font-medium text-gLight-textTertiary dark:text-gDark-textTertiary flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[13px] text-emerald-500">arrow_downward</span>
              Income
            </span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 truncate max-w-full">
              ৳ {totalIncome.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex flex-col items-center px-1">
            <span className="text-[11px] font-medium text-gLight-textTertiary dark:text-gDark-textTertiary flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[13px] text-red-500">arrow_upward</span>
              Expense
            </span>
            <span className="text-sm sm:text-base font-extrabold text-red-600 dark:text-red-400 mt-1 truncate max-w-full">
              ৳ {totalExpense.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex flex-col items-center px-1">
            <span className="text-[11px] font-medium text-gLight-textTertiary dark:text-gDark-textTertiary flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[13px] text-gLight-blue dark:text-gDark-blue">savings</span>
              Net
            </span>
            <span
              className={`text-sm sm:text-base font-extrabold mt-1 truncate max-w-full ${
                netSavings >= 0
                  ? 'text-gLight-textPrimary dark:text-gDark-textPrimary'
                  : 'text-red-500'
              }`}
            >
              ৳ {netSavings.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Real Weekly Spending Breakdown (Current Month) */}
      <section className="rounded-3xl bg-gLight-surface dark:bg-gDark-surface p-5 flex flex-col gap-3 shadow-sm border border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gLight-textSecondary dark:text-gDark-textSecondary">
            Weekly Breakdown ({currentMonthLabel})
          </span>
          <span className="text-[11px] font-medium text-gLight-textTertiary dark:text-gDark-textTertiary">
            Avg: ৳ {avgDailySpend.toLocaleString('en-IN')} / day
          </span>
        </div>

        <div className="flex items-end justify-between h-36 pt-6 gap-3 border-b border-black/5 dark:border-white/5 pb-2">
          {weeks.map((w, idx) => {
            const heightPercent =
              maxWeeklyAmount > 0 ? Math.max(12, Math.round((w.amount / maxWeeklyAmount) * 100)) : 12;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-bold text-gLight-textSecondary dark:text-gDark-textSecondary opacity-80 group-hover:opacity-100 transition-opacity">
                  {w.amount >= 1000
                    ? `৳${(w.amount / 1000).toFixed(1)}k`
                    : `৳${w.amount}`}
                </span>
                <div className="w-full h-full flex items-end">
                  <div
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      w.isCurrent
                        ? 'bg-gLight-blue dark:bg-gDark-blue shadow-md'
                        : w.amount > 0
                        ? 'bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh hover:bg-gLight-blue/60'
                        : 'bg-black/5 dark:bg-white/5 border border-dashed border-black/15 dark:border-white/15'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                </div>
                <div className="flex flex-col items-center">
                  <span
                    className={`text-[11px] font-bold ${
                      w.isCurrent
                        ? 'text-gLight-blue dark:text-gDark-blue'
                        : 'text-gLight-textTertiary dark:text-gDark-textTertiary'
                    }`}
                  >
                    {w.label}
                  </span>
                  <span className="text-[9px] text-gLight-textTertiary dark:text-gDark-textTertiary">
                    {w.sub}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Top Spending Insight Callout */}
      {topCategory && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-500 text-[22px] shrink-0 mt-0.5">
            insights
          </span>
          <div className="text-xs">
            <span className="font-bold text-gLight-textPrimary dark:text-gDark-textPrimary">
              Top Expense: {topCategory.icon} {topCategory.name}
            </span>
            <p className="text-gLight-textSecondary dark:text-gDark-textSecondary mt-0.5">
              You spent ৳ {topCategory.spent.toLocaleString('en-IN')} on {topCategory.name}, which accounts for{' '}
              <span className="font-bold text-amber-600 dark:text-amber-400">{topCategory.percent}%</span> of all your expenses in this period.
            </p>
          </div>
        </div>
      )}

      {/* 4. Spending by Category Card */}
      <section className="rounded-3xl bg-gLight-surface dark:bg-gDark-surface p-5 flex flex-col gap-4 shadow-sm border border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gLight-textSecondary dark:text-gDark-textSecondary">
            Spending by Category
          </span>
          <span className="text-xs text-gLight-textTertiary dark:text-gDark-textTertiary font-medium">
            Total: ৳ {totalExpense.toLocaleString('en-IN')}
          </span>
        </div>

        {totalExpense === 0 ? (
          <div className="py-8 text-center text-xs text-gLight-textTertiary dark:text-gDark-textTertiary flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[32px] text-gLight-textTertiary/50">
              receipt_long
            </span>
            <span>এই সময়সীমার মধ্যে কোনো খরচের হিসাব নেই।</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {categoryStats
              .filter((c) => c.spent > 0)
              .map((cat) => (
                <div key={cat.id}>
                  <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                    <span className="flex items-center gap-1.5 truncate pr-2">
                      <span className="text-base">{cat.icon}</span>
                      <span className="font-semibold text-gLight-textPrimary dark:text-gDark-textPrimary truncate">
                        {cat.name}
                      </span>
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {cat.isOverBudget && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">
                          Over ৳{cat.overAmount}
                        </span>
                      )}
                      <span className="font-extrabold text-gLight-textPrimary dark:text-gDark-textPrimary">
                        ৳ {cat.spent.toLocaleString('en-IN')}
                        <span className="text-[11px] font-normal text-gLight-textTertiary ml-1">
                          ({cat.percent}%)
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percent}%`,
                        backgroundColor: cat.isOverBudget ? '#ef4444' : cat.color || '#1a73e8'
                      }}
                    ></div>
                  </div>
                  {cat.budget > 0 && (
                    <div className="flex justify-between text-[10px] text-gLight-textTertiary dark:text-gDark-textTertiary mt-1">
                      <span>Budget: ৳ {cat.budget.toLocaleString('en-IN')}</span>
                      <span>
                        {cat.isOverBudget
                          ? 'Limit exceeded'
                          : `Remaining: ৳ ${(cat.budget - cat.spent).toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
};
