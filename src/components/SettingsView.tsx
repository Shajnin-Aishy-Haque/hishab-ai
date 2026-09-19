import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile } from '../types';
import { exportBackupFile, importBackupFile, exportCsvReport } from '../services/driveSync';
import { ensureStoragePersistence, type StorageStatus } from '../services/storagePersistence';

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
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGoogleConnected = user.authProvider === 'google' && Boolean(user.email);

  useEffect(() => {
    ensureStoragePersistence().then(setStorageStatus);
  }, []);

  const handleBackupNow = async () => {
    setIsBackingUp(true);
    try {
      await exportBackupFile(user.id);
      onShowToast('ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে!', 'file_download');
    } catch (err) {
      console.error(err);
      onShowToast('ব্যাকআপ ডাউনলোডে সমস্যা হয়েছে', 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await importBackupFile(file, user.id);
      if (result.success) {
        const { accounts, transactions, dharItems } = result.counts;
        onShowToast(`রিস্টোর সম্পন্ন: ${accounts}টি ওয়ালেট, ${transactions}টি লেনদেন, ${dharItems}টি ধার খাতা!`, 'cloud_done');
        onDataRestored();
      }
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || 'ভুল ফাইল ফরম্যাট! সঠিক JSON ফাইল দিন।', 'error');
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
    <div className="flex-1 px-5 flex flex-col gap-4 pt-3 pb-32 animate-in fade-in duration-150">
      <h2 className="text-lg font-bold px-1 text-gLight-textPrimary dark:text-gDark-textPrimary">
        Settings &amp; Backup
      </h2>

      {/* 1. DATA DURABILITY & STORAGE STATUS */}
      <section className="bg-gLight-surface dark:bg-gDark-surface rounded-3xl p-5 flex flex-col gap-3 shadow-sm border border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">shield</span>
            </div>
            <div>
              <div className="font-bold text-sm text-gLight-textPrimary dark:text-gDark-textPrimary">
                Local Storage Durability
              </div>
              <div className="text-xs text-gLight-textSecondary dark:text-gDark-textSecondary">
                {storageStatus?.persisted ? 'Protected against browser eviction' : 'Standard local browser storage'}
              </div>
            </div>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
            storageStatus?.persisted
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
          }`}>
            <span className="material-symbols-outlined text-[14px]">
              {storageStatus?.persisted ? 'check_circle' : 'info'}
            </span>
            {storageStatus?.persisted ? 'Persisted' : 'Standard'}
          </span>
        </div>

        <div className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl p-3 flex items-center justify-between text-xs text-gLight-textTertiary dark:text-gDark-textTertiary">
          <span>Local Space Used:</span>
          <span className="font-mono text-gLight-textPrimary dark:text-gDark-textPrimary font-semibold">
            {storageStatus?.formattedUsage || 'Calculated on write'} {storageStatus?.formattedQuota ? `(Quota: ${storageStatus.formattedQuota})` : ''}
          </span>
        </div>
      </section>

      {/* 2. LOCAL 1-CLICK BACKUP & RESTORE (100% OFFLINE & ZERO CLOUD DEPENDENCY) */}
      <section className="bg-gLight-surface dark:bg-gDark-surface rounded-3xl p-5 flex flex-col gap-3.5 shadow-sm border border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">save</span>
            </div>
            <div>
              <div className="font-bold text-sm text-gLight-textPrimary dark:text-gDark-textPrimary">
                Local Backup &amp; Restore
              </div>
              <div className="text-xs text-gLight-textSecondary dark:text-gDark-textSecondary">
                100% Private, Offline JSON File
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
            Recommended
          </span>
        </div>

        <p className="text-xs text-gLight-textTertiary dark:text-gDark-textTertiary leading-relaxed">
          আপনার সমস্ত লেনদেন, ওয়ালেট ও ধার খাতার একটি পূর্ণাঙ্গ কপি নিজের ফোনে বা কম্পিউটারে ডাউনলোড করে সংরক্ষণ করুন।
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleBackupNow}
            disabled={isBackingUp}
            className="bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg font-semibold text-xs py-2.5 px-3 rounded-full tap-press flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 transition-opacity"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>{isBackingUp ? 'ডাউনলোড হচ্ছে...' : 'Download Backup'}</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh text-gLight-textPrimary dark:text-gDark-textPrimary border border-black/5 dark:border-white/10 font-semibold text-xs py-2.5 px-3 rounded-full tap-press flex items-center justify-center gap-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-[16px]">file_upload</span>
            <span>Restore from File</span>
          </button>
        </div>

        <button
          onClick={async () => {
            await exportCsvReport();
            onShowToast('এক্সেল / CSV রিপোর্ট ডাউনলোড হয়েছে!', 'table_view');
          }}
          className="w-full py-2 bg-black/5 dark:bg-white/5 text-gLight-textSecondary dark:text-gDark-textSecondary hover:text-gLight-textPrimary rounded-full text-xs font-semibold tap-press flex items-center justify-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">table_view</span>
          <span>Export All to Excel/CSV Sheet</span>
        </button>
      </section>

      {/* 3. GOOGLE DRIVE OPTIONAL CLOUD SYNC */}
      <section className="bg-gLight-surface dark:bg-gDark-surface rounded-3xl p-5 flex flex-col gap-3.5 shadow-sm border border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div
            onClick={onOpenUserModal}
            className="flex items-center gap-3 cursor-pointer tap-press group"
          >
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 87.3 78">
                <path fill="#0066da" d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" />
                <path fill="#00ac47" d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" />
                <path fill="#ea4335" d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" />
                <path fill="#00832d" d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" />
                <path fill="#2684fc" d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" />
                <path fill="#ffba00" d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-sm text-gLight-textPrimary dark:text-gDark-textPrimary group-hover:text-gLight-blue flex items-center gap-1.5">
                <span>Google Drive Cloud Sync</span>
                {isGoogleConnected && (
                  <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                    Connected
                  </span>
                )}
              </div>
              <div className="text-xs text-gLight-textSecondary dark:text-gDark-textSecondary truncate max-w-[200px]">
                {isGoogleConnected ? user.email : 'Optional • Automatic cloud sync'}
              </div>
            </div>
          </div>

          {isGoogleConnected ? (
            <label className="relative inline-flex items-center cursor-pointer tap-press">
              <input
                type="checkbox"
                checked={autoBackup}
                onChange={(e) => setAutoBackup(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          ) : (
            <button
              onClick={onOpenUserModal}
              className="text-xs font-bold text-gLight-blue dark:text-gDark-blue bg-gLight-blueContainer dark:bg-gDark-blueContainer px-3 py-1.5 rounded-full tap-press hover:opacity-90 transition-opacity"
            >
              Connect
            </button>
          )}
        </div>
      </section>

      {/* 4. PREFERENCES LIST */}
      <div className="bg-gLight-surface dark:bg-gDark-surface rounded-3xl divide-y divide-black/5 dark:divide-white/5 overflow-hidden shadow-sm border border-black/5 dark:border-white/5">
        <div className="p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gLight-textPrimary dark:text-gDark-textPrimary">Currency</span>
          <span className="text-xs font-semibold text-gLight-blue dark:text-gDark-blue">BDT (৳)</span>
        </div>
        <div className="p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gLight-textPrimary dark:text-gDark-textPrimary">Voice &amp; NLP Parsing</span>
          <span className="text-xs font-semibold text-gLight-green dark:text-gDark-green">বাংলা, ইংরেজি ও বাংলিশ</span>
        </div>
        <div className="p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gLight-textPrimary dark:text-gDark-textPrimary">Active Profile</span>
          <span className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
            {isGoogleConnected ? `${user.name} (${user.email})` : user.name}
          </span>
        </div>
      </div>

      {/* 5. LEGAL & APP INFO */}
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

      {/* 6. GEMINI VISION KEY (OPTIONAL) */}
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
