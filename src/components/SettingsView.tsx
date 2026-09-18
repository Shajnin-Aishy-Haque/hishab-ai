import React, { useState, useRef } from 'react';
import type { UserProfile } from '../types';
import { exportBackupFile, importBackupFile, exportCsvReport } from '../services/driveSync';

interface SettingsViewProps {
  user: UserProfile;
  onShowToast: (msg: string, icon?: string) => void;
  onDataRestored: () => void;
  onOpenUserModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onShowToast,
  onDataRestored,
  onOpenUserModal
}) => {
  const [autoBackup, setAutoBackup] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('hishab_gemini_key') || '');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackupNow = async () => {
    setIsBackingUp(true);
    try {
      await exportBackupFile();
      onShowToast('Google Drive ব্যাকআপ ফাইল ডাউনলোড ও সিঙ্ক হয়েছে!', 'cloud_done');
    } catch (err) {
      console.error(err);
      onShowToast('ব্যাকআপে সমস্যা হয়েছে', 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const ok = await importBackupFile(file);
      if (ok) {
        onShowToast('ডাটা সফলভাবে রিস্টোর করা হয়েছে!', 'cloud_done');
        onDataRestored();
      }
    } catch (err) {
      console.error(err);
      onShowToast('ভুল ফাইল ফরম্যাট! সঠিক JSON ফাইল দিন।', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingKey(true);
    localStorage.setItem('hishab_gemini_key', apiKey.trim());
    setTimeout(() => {
      setIsSavingKey(false);
      onShowToast('Gemini API Key সংরক্ষিত হয়েছে!', 'key');
    }, 300);
  };

  return (
    <div className="flex-1 px-5 flex flex-col gap-4 pt-3 pb-28 animate-in fade-in duration-150">
      <h2 className="text-lg font-bold px-1 text-gLight-textPrimary dark:text-gDark-textPrimary">
        Settings &amp; Backup
      </h2>

      {/* GOOGLE DRIVE AUTO-BACKUP HERO CARD (Matches Stitch lines 560-612) */}
      <section className="bg-gLight-surface dark:bg-gDark-surface rounded-3xl p-5 flex flex-col gap-4 shadow-sm border border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div
            onClick={onOpenUserModal}
            className="flex items-center gap-3 cursor-pointer tap-press group"
          >
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 87.3 78">
                <path fill="#0066da" d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" />
                <path fill="#00ac47" d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" />
                <path fill="#ea4335" d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" />
                <path fill="#00832d" d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" />
                <path fill="#2684fc" d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" />
                <path fill="#ffba00" d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-sm text-gLight-textPrimary dark:text-gDark-textPrimary group-hover:text-gLight-blue">
                Google Drive Backup
              </div>
              <div className="text-xs text-gLight-textSecondary dark:text-gDark-textSecondary">
                {user.email}
              </div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer tap-press">
            <input
              type="checkbox"
              checked={autoBackup}
              onChange={(e) => setAutoBackup(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        <div className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gLight-textSecondary dark:text-gDark-textSecondary font-medium">
              Backup Status:
            </span>
            <span className="font-bold text-gLight-green dark:text-gDark-green flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Auto-Sync Active (Per-User Saved)
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gLight-textTertiary dark:text-gDark-textTertiary">
            <span>Destination:</span>
            <span className="font-mono text-[11px] text-gLight-textPrimary dark:text-gDark-textPrimary">
              My Drive / Hishab AI / data_{user.id}.json
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gLight-textTertiary dark:text-gDark-textTertiary">
            <span>Active Profile:</span>
            <span className="text-gLight-textPrimary dark:text-gDark-textPrimary font-medium">
              {user.name} ({user.email})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleBackupNow}
            disabled={isBackingUp}
            className="bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg font-semibold text-xs py-2.5 px-3 rounded-full tap-press flex items-center justify-center gap-1.5 shadow-sm transition-opacity"
          >
            <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
            <span>{isBackingUp ? 'Backing up...' : 'Back up Now'}</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh text-gLight-textPrimary dark:text-gDark-textPrimary border border-black/5 dark:border-white/10 font-semibold text-xs py-2.5 px-3 rounded-full tap-press flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">cloud_download</span>
            <span>Restore Data</span>
          </button>
        </div>
      </section>

      {/* Preferences List */}
      <div className="bg-gLight-surface dark:bg-gDark-surface rounded-3xl divide-y divide-black/5 dark:divide-white/5 overflow-hidden shadow-sm border border-black/5 dark:border-white/5">
        <div className="p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gLight-textPrimary dark:text-gDark-textPrimary">Currency</span>
          <span className="text-xs font-semibold text-gLight-blue dark:text-gDark-blue">BDT (৳)</span>
        </div>
        <div className="p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gLight-textPrimary dark:text-gDark-textPrimary">Voice Recognition</span>
          <span className="text-xs font-semibold text-gLight-green dark:text-gDark-green">Bangla &amp; Banglish</span>
        </div>
        <div
          onClick={async () => {
            await exportCsvReport();
            onShowToast('এক্সেল / CSV রিপোর্ট ডাউনলোড হয়েছে!', 'table_view');
          }}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 tap-press transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gLight-green dark:text-gDark-green text-[20px]">
              table_view
            </span>
            <span className="text-sm font-medium text-gLight-textPrimary dark:text-gDark-textPrimary">
              Export all to Excel/CSV
            </span>
          </div>
          <span className="material-symbols-outlined text-[18px] text-gLight-textTertiary dark:text-gDark-textTertiary">
            file_download
          </span>
        </div>
      </div>

      {/* Legal & App Info */}
      <div className="bg-gLight-surface dark:bg-gDark-surface rounded-3xl divide-y divide-black/5 dark:divide-white/5 overflow-hidden shadow-sm border border-black/5 dark:border-white/5">
        <a
          href="/privacy.html"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 tap-press transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gLight-blue dark:text-gDark-blue text-[20px]">
              policy
            </span>
            <span className="text-sm font-medium text-gLight-textPrimary dark:text-gDark-textPrimary">
              Privacy Policy
            </span>
          </div>
          <span className="material-symbols-outlined text-[18px] text-gLight-textTertiary dark:text-gDark-textTertiary">
            open_in_new
          </span>
        </a>
        <a
          href="/terms.html"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 tap-press transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gLight-blue dark:text-gDark-blue text-[20px]">
              description
            </span>
            <span className="text-sm font-medium text-gLight-textPrimary dark:text-gDark-textPrimary">
              Terms of Service
            </span>
          </div>
          <span className="material-symbols-outlined text-[18px] text-gLight-textTertiary dark:text-gDark-textTertiary">
            open_in_new
          </span>
        </a>
        <div className="p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gLight-textPrimary dark:text-gDark-textPrimary">App Version</span>
          <span className="text-xs font-mono text-gLight-textTertiary dark:text-gDark-textTertiary">v2.0.0 (Production)</span>
        </div>
      </div>

      {/* Gemini Vision Key */}
      <div className="p-4 rounded-3xl bg-gLight-surface dark:bg-gDark-surface border border-black/5 dark:border-white/5 space-y-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-gLight-textSecondary dark:text-gDark-textSecondary">
          Gemini 2.0 Flash API Key (Optional)
        </span>
        <p className="text-[11px] text-gLight-textTertiary">
          রসিদ ও ক্যাশ মেমো নির্ভুল স্ক্যানের জন্য আপনার ফ্রি Google AI Studio API Key দিন।
        </p>
        <form onSubmit={handleSaveApiKey} className="space-y-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-3 py-2 bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-xl text-xs font-mono border border-black/10 dark:border-white/10"
          />
          <button
            type="submit"
            className="w-full py-2 bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg rounded-xl text-xs font-bold tap-press shadow-sm"
          >
            {isSavingKey ? 'সংরক্ষণ হচ্ছে...' : 'Save API Key'}
          </button>
        </form>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleRestoreFile} />
    </div>
  );
};
