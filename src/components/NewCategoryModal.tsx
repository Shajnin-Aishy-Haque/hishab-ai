import React, { useState } from 'react';
import type { Category } from '../types';

interface NewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, 'id' | 'userId'>) => void;
}

const PRESETS = [
  { name: 'Medical & Osudh', emoji: '💊', budget: 3000 },
  { name: 'Shopping & Kapor', emoji: '🛍️', budget: 5000 },
  { name: 'Education & Boi', emoji: '📚', budget: 2500 },
  { name: 'Cafe & Adda', emoji: '☕', budget: 2000 },
  { name: 'Gym & Fitness', emoji: '🏋️', budget: 1500 },
  { name: 'Gaming & Fun', emoji: '🎮', budget: 2000 }
];

const EMOJIS = ['💊', '📚', '🛍️', '☕', '🎮', '🏋️', '✈️', '👶', '✂️', '🏠', '🍿', '💻', '🎁', '🍕', '🚕', '💡'];
const COLORS = [
  { name: 'blue', hex: '#1a73e8' },
  { name: 'green', hex: '#1e8e3e' },
  { name: 'amber', hex: '#f9ab00' },
  { name: 'orange', hex: '#e37400' },
  { name: 'red', hex: '#d93025' },
  { name: 'purple', hex: '#a142f4' }
];

export const NewCategoryModal: React.FC<NewCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('💊');
  const [budget, setBudget] = useState('3000');
  const [color, setColor] = useState('#1a73e8');

  if (!isOpen) return null;

  const handleApplyPreset = (p: typeof PRESETS[0]) => {
    setName(p.name);
    setEmoji(p.emoji);
    setBudget(String(p.budget));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      icon: emoji,
      budget: parseFloat(budget) || 3000,
      color,
      keywords: [name.toLowerCase(), emoji]
    });

    onClose();
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-150">
      <div className="bg-gLight-surface dark:bg-gDark-surface rounded-t-3xl max-w-md w-full p-6 flex flex-col gap-4 modal-bottom-sheet overflow-y-auto shadow-2xl border-t border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-onBlueContainer dark:text-gDark-onBlueContainer flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">category</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-gLight-textPrimary dark:text-gDark-textPrimary">
                New Category
              </h3>
              <div className="text-[11px] text-gLight-textTertiary dark:text-gDark-textTertiary">
                Custom icon, budget &amp; color
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

        {/* Quick Presets (Matches Stitch lines 873-895) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-gLight-textTertiary dark:text-gDark-textTertiary uppercase tracking-wider">
            Quick Suggestions (1-tap setup)
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="shrink-0 bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh text-xs font-semibold px-3 py-1.5 rounded-full tap-press border border-black/5 dark:border-white/10 hover:border-gLight-blue transition-colors"
              >
                {p.emoji} {p.name.split('&')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
              Category Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Medical & Osudh"
              className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-gLight-blue text-gLight-textPrimary dark:text-gDark-textPrimary"
            />
          </div>

          {/* Emoji Picker Grid (Matches Stitch lines 909-932) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
                Choose Icon / Emoji
              </label>
              <span className="text-base font-bold">Selected: {emoji}</span>
            </div>
            <div className="grid grid-cols-8 gap-2 p-2 bg-gLight-surfaceHigh/60 dark:bg-gDark-surfaceHigh/60 rounded-2xl border border-black/5 dark:border-white/10">
              {EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg tap-press transition-all ${
                    emoji === em
                      ? 'ring-2 ring-gLight-blue dark:ring-gDark-blue bg-black/5 dark:bg-white/10'
                      : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Budget Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
              Monthly Target Budget (৳ BDT - Optional)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-bold text-sm text-gLight-textTertiary">৳</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="3000"
                className="w-full bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl pl-9 pr-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-gLight-blue text-gLight-textPrimary dark:text-gDark-textPrimary"
              />
            </div>
          </div>

          {/* Color Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
              Material Tonal Accent
            </label>
            <div className="flex items-center gap-3">
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`w-7 h-7 rounded-full tap-press transition-all ${
                    color === c.hex ? 'ring-2 ring-offset-2 ring-white dark:ring-gDark-surfaceHigh' : ''
                  }`}
                  style={{ backgroundColor: c.hex }}
                ></button>
              ))}
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
              className="flex-1 bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg py-3 rounded-full text-xs font-bold tap-press shadow-md hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Save Category</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
