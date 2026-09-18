import React from 'react';
import type { UserProfile } from '../types';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  user: UserProfile;
  onOpenUserModal: () => void;
  onTriggerSync: () => void;
  syncText: string;
  isDriveConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  user,
  onOpenUserModal,
  onTriggerSync,
  syncText,
  isDriveConnected
}) => {
  return (
    <header className="sticky top-0 z-40 bg-gLight-bg/90 dark:bg-gDark-bg/90 backdrop-blur-md px-5 h-16 w-full flex items-center justify-between border-b border-black/5 dark:border-white/5 transition-colors">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-2xl bg-gLight-surface dark:bg-gDark-surface flex items-center justify-center text-gLight-blue dark:text-gDark-blue shadow-sm">
          <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-tight text-gLight-textPrimary dark:text-gDark-textPrimary">
            Hishab
          </span>
          {/* Google Drive Status Pill */}
          <div
            onClick={onTriggerSync}
            className="flex items-center gap-1.5 cursor-pointer tap-press group"
            title="Click to sync data with Google Drive"
          >
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 87.3 78">
              <path fill="#0066da" d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" />
              <path fill="#00ac47" d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" />
              <path fill="#ea4335" d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" />
              <path fill="#00832d" d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" />
              <path fill="#2684fc" d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" />
              <path fill="#ffba00" d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" />
            </svg>
            <span className="text-[11px] text-gLight-textTertiary dark:text-gDark-textTertiary font-medium group-hover:text-gLight-blue dark:group-hover:text-gDark-blue transition-colors">
              {syncText}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isDriveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            ></span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 rounded-full bg-gLight-surface dark:bg-gDark-surface flex items-center justify-center text-gLight-textSecondary dark:text-gDark-textSecondary hover:bg-gLight-surfaceHigh dark:hover:bg-gDark-surfaceHigh transition-colors tap-press"
        >
          <span className="material-symbols-outlined text-[20px]">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Google Profile Avatar */}
        <button
          onClick={onOpenUserModal}
          title={`Signed in as ${user.name} (${user.email})`}
          className="w-9 h-9 rounded-full overflow-hidden bg-[#1a73e8] text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-blue-500/20 cursor-pointer tap-press hover:opacity-90 transition-opacity"
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user.initial || user.name.charAt(0).toUpperCase()
          )}
        </button>
      </div>
    </header>
  );
};
