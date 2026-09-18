import React from 'react';
import type { Category } from '../types';

interface CategoryChipsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  categorySpends: Record<string, number>;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  categorySpends
}) => {
  return (
    <div className="pt-8 pb-2 px-4 sm:px-6">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {/* 'All' Chip */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-full tap-press transition-all flex items-center gap-1.5 ${
            selectedCategory === 'all'
              ? 'bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg shadow-sm'
              : 'bg-gLight-surface dark:bg-gDark-surface text-gLight-textPrimary dark:text-gDark-textPrimary hover:bg-gLight-surfaceHigh dark:hover:bg-gDark-surfaceHigh'
          }`}
        >
          <span>All Items</span>
        </button>

        {/* Dynamic Category Chips */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const spent = categorySpends[cat.id] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 text-xs font-medium px-3.5 py-2 rounded-full tap-press transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg font-semibold shadow-sm'
                  : 'bg-gLight-surface dark:bg-gDark-surface text-gLight-textPrimary dark:text-gDark-textPrimary hover:bg-gLight-surfaceHigh dark:hover:bg-gDark-surfaceHigh'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
              <span>{cat.name.split('&')[0].trim()}</span>
              {spent > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white dark:text-gDark-bg'
                      : 'bg-black/5 dark:bg-white/10 text-gLight-textSecondary dark:text-gDark-textSecondary'
                  }`}
                >
                  ৳{spent.toLocaleString('en-IN')}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
