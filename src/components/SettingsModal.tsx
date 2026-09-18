import React, { useState } from 'react';
import { exportBackupFile, importBackupFile, exportCsvReport } from '../services/driveSync';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, icon?: string) => void;
  onDataRestored: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onDataRestored
}) => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('hishab_gemini_key') || '');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingKey(true);
    localStorage.setItem('hishab_gemini_key', apiKey.trim());
    setTimeout(() => {
      setIsSavingKey(false);
      onShowToast('Gemini API Key সংরক্ষিত হয়েছে!', 'key');
    }, 300);
  };

  const handleExportBackup = async () => {
    try {
      await exportBackupFile();
      onShowToast('ব্যাকআপ JSON ফাইল ডাউনলোড হয়েছে!', 'cloud_download');
    } catch (e) {
      console.error(e);
      onShowToast('ব্যাকআপ তৈরিতে সমস্যা হয়েছে।', 'error');
    }
  };

  const handleExportCsv = async () => {
    try {
      await exportCsvReport();
      onShowToast('এক্সেল / CSV রিপোর্ট ডাউনলোড হয়েছে!', 'table_view');
    } catch (e) {
      console.error(e);
      onShowToast('CSV তৈরিতে সমস্যা হয়েছে।', 'error');
    }
  };

  const handleFileRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const ok = await importBackupFile(file);
      if (ok) {
        onShowToast('ডাটা সফলভাবে রিস্টোর করা হয়েছে!', 'cloud_done');
        onDataRestored();
        onClose();
      }
    } catch (err) {
      console.error(err);
      onShowToast('ভুল ফাইল ফরম্যাট! সঠিক JSON ফাইল আপলোড করুন।', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-gLight-bg dark:bg-gDark-surface rounded-3xl p-6 shadow-xl border border-black/10 dark:border-white/10 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-gLight-textPrimary dark:text-gDark-textPrimary">
              settings
            </span>
            <span className="font-bold text-lg text-gLight-textPrimary dark:text-gDark-textPrimary">
              Settings & Backup
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gLight-textSecondary dark:text-gDark-textSecondary hover:bg-black/5 dark:hover:bg-white/5 tap-press"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Cloud & Data Section */}
        <div className="mt-5 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-gLight-textSecondary dark:text-gDark-textSecondary">
            Data Backup & Sync (Zero Data Loss)
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleExportBackup}
              className="p-3 rounded-2xl bg-gLight-surface dark:bg-gDark-surfaceHigh border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center tap-press hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="material-symbols-outlined text-[24px] text-gLight-blue dark:text-gDark-blue mb-1">
                cloud_upload
              </span>
              <span className="text-xs font-bold text-gLight-textPrimary dark:text-gDark-textPrimary">
                Backup to File
              </span>
              <span className="text-[10px] text-gLight-textSecondary dark:text-gDark-textSecondary">
                JSON Snapshot
              </span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl bg-gLight-surface dark:bg-gDark-surfaceHigh border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center tap-press hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="material-symbols-outlined text-[24px] text-gLight-green dark:text-gDark-green mb-1">
                cloud_download
              </span>
              <span className="text-xs font-bold text-gLight-textPrimary dark:text-gDark-textPrimary">
                Restore Backup
              </span>
              <span className="text-[10px] text-gLight-textSecondary dark:text-gDark-textSecondary">
                Upload JSON
              </span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileRestore}
          />

          <button
            onClick={handleExportCsv}
            className="w-full py-2.5 rounded-2xl bg-gLight-surface dark:bg-gDark-surfaceHigh border border-black/5 dark:border-white/5 font-semibold text-xs text-gLight-textPrimary dark:text-gDark-textPrimary tap-press flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">table_view</span>
            <span>Export to Excel / CSV Report</span>
          </button>
        </div>

        {/* Gemini API Key Section */}
        <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gLight-textSecondary dark:text-gDark-textSecondary">
            Free Gemini API Key (Optional)
          </span>
          <p className="text-[11px] text-gLight-textSecondary dark:text-gDark-textSecondary">
            রসিদ ও মেমো ১০০% এক্যুরেট স্ক্যান করতে আপনার ফ্রি Google AI Studio API Key দিন (আপনার ডিভাইসেই নিরাপদে সংরক্ষিত থাকবে)।
          </p>

          <form onSubmit={handleSaveApiKey} className="space-y-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2.5 bg-gLight-surface dark:bg-gDark-surfaceHigh rounded-xl text-xs font-mono text-gLight-textPrimary dark:text-gDark-textPrimary border border-black/10 dark:border-white/10"
            />
            <button
              type="submit"
              className="w-full py-2 bg-gLight-blue dark:bg-gDark-blue text-white rounded-xl text-xs font-bold tap-press flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">key</span>
              <span>{isSavingKey ? 'সংরক্ষণ হচ্ছে...' : 'Save API Key'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
