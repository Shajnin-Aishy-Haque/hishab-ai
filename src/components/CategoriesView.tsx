import React from 'react';
import type { Category, Transaction } from '../types';

interface CategoriesViewProps {
  categories: Category[];
  transactions: Transaction[];
  onOpenAddCategory: () => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  transactions,
  onOpenAddCategory
}) => {
  return (
    <div className="flex-1 px-5 flex flex-col gap-4 pt-3 pb-28 animate-in fade-in duration-150">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold text-gLight-textPrimary dark:text-gDark-textPrimary">
            Categories
          </h2>
          <span className="text-xs text-gLight-textTertiary dark:text-gDark-textTertiary font-medium">
            {categories.length} active categories • Synced to Drive
          </span>
        </div>
        <button
          onClick={onOpenAddCategory}
          className="bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-onBlueContainer dark:text-gDark-onBlueContainer px-3.5 py-1.5 rounded-full text-xs font-bold tap-press flex items-center gap-1.5 hover:opacity-90 shadow-sm transition-opacity"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => {
          const spent = transactions
            .filter((t) => t.type === 'expense' && (t.categoryId === cat.id || t.categoryId.startsWith(cat.id.split('_')[0])))
            .reduce((sum, t) => sum + t.amount, 0);

          const budget = cat.budget || 5000;
          const percent = Math.min(100, Math.round((spent / budget) * 100));
          const isWarning = percent >= 80;

          return (
            <div
              key={cat.id}
              className="category-card bg-gLight-surface dark:bg-gDark-surface rounded-3xl p-4 flex flex-col justify-between h-32 tap-press shadow-sm border border-black/5 dark:border-white/5 hover:border-gLight-blue/40 dark:hover:border-gDark-blue/40 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl p-1.5 rounded-2xl bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh">
                  {cat.icon}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isWarning
                      ? 'text-amber-500 bg-amber-500/10'
                      : 'text-emerald-500 bg-emerald-500/10'
                  }`}
                >
                  {percent}% used
                </span>
              </div>
              <div>
                <div className="font-bold text-sm text-gLight-textPrimary dark:text-gDark-textPrimary">
                  {cat.name}
                </div>
                <div className="text-[11px] text-gLight-textSecondary dark:text-gDark-textSecondary mt-0.5">
                  Spent: ৳ {spent.toLocaleString('en-IN')} / ৳ {(budget / 1000).toFixed(0)}k
                </div>
                <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: isWarning ? '#f59e0b' : cat.color || '#1a73e8'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Quick Add Dashed Card */}
        <div
          onClick={onOpenAddCategory}
          className="bg-transparent rounded-3xl p-4 flex flex-col items-center justify-center gap-2 h-32 tap-press border-2 border-dashed border-gLight-outline/30 dark:border-gDark-outline/30 hover:border-gLight-blue dark:hover:border-gDark-blue text-gLight-textTertiary dark:text-gDark-textTertiary hover:text-gLight-blue dark:hover:text-gDark-blue transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">add</span>
          </div>
          <span className="text-xs font-bold">Add Category</span>
        </div>
      </div>
    </div>
  );
};
