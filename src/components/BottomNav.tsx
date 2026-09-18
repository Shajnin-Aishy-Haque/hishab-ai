import React from 'react';

export type MainTabType = 'hishab' | 'wallets' | 'dhar' | 'analytics' | 'categories' | 'settings';

interface BottomNavProps {
  activeTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 flex justify-around items-center px-3 h-20 max-w-md mx-auto bg-gLight-surface dark:bg-gDark-surface border-t border-black/5 dark:border-white/5 transition-colors">
      {/* 1. Hishab (Home) */}
      <button
        onClick={() => onChangeTab('hishab')}
        className="nav-btn flex flex-col items-center justify-center gap-1 tap-press flex-1 py-1"
      >
        <div
          className={`nav-pill w-14 h-8 rounded-full flex items-center justify-center transition-all ${
            activeTab === 'hishab'
              ? 'bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-onBlueContainer dark:text-gDark-onBlueContainer'
              : 'text-gLight-textTertiary dark:text-gDark-textTertiary'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
        </div>
        <span
          className={`nav-label text-[11px] ${
            activeTab === 'hishab'
              ? 'font-bold text-gLight-textPrimary dark:text-gDark-textPrimary'
              : 'font-medium text-gLight-textTertiary dark:text-gDark-textTertiary'
          }`}
        >
          Hishab
        </span>
      </button>

      {/* 2. Insights (Analytics) */}
      <button
        onClick={() => onChangeTab('analytics')}
        className="nav-btn flex flex-col items-center justify-center gap-1 tap-press flex-1 py-1"
      >
        <div
          className={`nav-pill w-14 h-8 rounded-full flex items-center justify-center transition-all ${
            activeTab === 'analytics'
              ? 'bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-onBlueContainer dark:text-gDark-onBlueContainer'
              : 'text-gLight-textTertiary dark:text-gDark-textTertiary'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">insights</span>
        </div>
        <span
          className={`nav-label text-[11px] ${
            activeTab === 'analytics'
              ? 'font-bold text-gLight-textPrimary dark:text-gDark-textPrimary'
              : 'font-medium text-gLight-textTertiary dark:text-gDark-textTertiary'
          }`}
        >
          Insights
        </span>
      </button>

      {/* 3. Categories */}
      <button
        onClick={() => onChangeTab('categories')}
        className="nav-btn flex flex-col items-center justify-center gap-1 tap-press flex-1 py-1"
      >
        <div
          className={`nav-pill w-14 h-8 rounded-full flex items-center justify-center transition-all ${
            activeTab === 'categories'
              ? 'bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-onBlueContainer dark:text-gDark-onBlueContainer'
              : 'text-gLight-textTertiary dark:text-gDark-textTertiary'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">category</span>
        </div>
        <span
          className={`nav-label text-[11px] ${
            activeTab === 'categories'
              ? 'font-bold text-gLight-textPrimary dark:text-gDark-textPrimary'
              : 'font-medium text-gLight-textTertiary dark:text-gDark-textTertiary'
          }`}
        >
          Categories
        </span>
      </button>

      {/* 4. Settings */}
      <button
        onClick={() => onChangeTab('settings')}
        className="nav-btn flex flex-col items-center justify-center gap-1 tap-press flex-1 py-1"
      >
        <div
          className={`nav-pill w-14 h-8 rounded-full flex items-center justify-center transition-all ${
            activeTab === 'settings'
              ? 'bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-onBlueContainer dark:text-gDark-onBlueContainer'
              : 'text-gLight-textTertiary dark:text-gDark-textTertiary'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </div>
        <span
          className={`nav-label text-[11px] ${
            activeTab === 'settings'
              ? 'font-bold text-gLight-textPrimary dark:text-gDark-textPrimary'
              : 'font-medium text-gLight-textTertiary dark:text-gDark-textTertiary'
          }`}
        >
          Settings
        </span>
      </button>
    </nav>
  );
};
