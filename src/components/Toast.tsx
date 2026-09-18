import React from 'react';

interface ToastProps {
  message: string;
  icon?: string;
  visible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, icon = 'check_circle', visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all animate-in fade-in slide-in-from-top-3 duration-200">
      <div className="bg-gDark-surfaceHigh text-gDark-textPrimary dark:bg-gLight-surfaceHigh dark:text-gLight-textPrimary px-4 py-2.5 rounded-full shadow-lg border border-black/10 dark:border-white/10 flex items-center gap-2 text-xs font-semibold">
        <span className="material-symbols-outlined text-[18px] text-gLight-green dark:text-gDark-green">
          {icon}
        </span>
        <span>{message}</span>
      </div>
    </div>
  );
};
