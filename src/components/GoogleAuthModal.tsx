import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import {
  getStoredGoogleClientId,
  setStoredGoogleClientId,
  requestRealGoogleOAuth,
  getStoredAccessToken,
  clearGoogleSession
} from '../services/googleAuth';
import {
  uploadToGoogleDrive,
  findDriveBackupFile,
  downloadFromGoogleDrive
} from '../services/googleDriveApi';
import { createDatabaseSnapshot, importBackupFile } from '../services/driveSync';

interface GoogleAuthModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  users: UserProfile[];
  onClose: () => void;
  onSwitchUser: (user: UserProfile) => void;
  onAddUser: (user: UserProfile, isScratch: boolean) => void;
  onShowToast: (msg: string, icon?: string) => void;
  onResetToScratch: (userId: string) => void;
  onOpenOnboarding: (user: UserProfile) => void;
  onSignOut?: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  currentUser,
  users,
  onClose,
  onSwitchUser,
  onAddUser,
  onShowToast,
  onResetToScratch,
  onOpenOnboarding,
  onSignOut
}) => {
  const [clientId, setClientId] = useState(getStoredGoogleClientId());
  const [showConfig, setShowConfig] = useState(false);
  const [quickEmail, setQuickEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDriveSyncing, setIsDriveSyncing] = useState(false);
  const [driveStatus, setDriveStatus] = useState<string>('Connected');
  const hasAccessToken = !!getStoredAccessToken();

  useEffect(() => {
    setClientId(getStoredGoogleClientId());
  }, [isOpen]);

  if (!isOpen) return null;

  // Real 1-Click Google OAuth Trigger
  const handleRealGoogleSignIn = () => {
    const activeClientId = clientId.trim() || getStoredGoogleClientId();

    if (!activeClientId) {
      setShowConfig(true);
      return;
    }

    setIsLoading(true);
    setDriveStatus('Connecting to Google...');

    requestRealGoogleOAuth(
      activeClientId,
      async (userInfo, accessToken) => {
        try {
          setIsLoading(false);
          const userId = `google_${userInfo.sub}`;
          const existingUser = users.find((u) => u.id === userId || u.email === userInfo.email);

          const profile: UserProfile = {
            id: userId,
            name: userInfo.name,
            email: userInfo.email,
            avatarUrl: userInfo.picture,
            initial: userInfo.name.charAt(0).toUpperCase()
          };

          if (existingUser) {
            onSwitchUser(existingUser);
            onShowToast(`Google-এ সাইন-ইন সম্পন্ন: ${userInfo.name}`, 'cloud_done');
          } else {
            // New user: initialized FROM SCRATCH
            onAddUser(profile, true);
            onSwitchUser(profile);
            onShowToast(`নতুন অ্যাকাউন্ট তৈরি হয়েছে: ${userInfo.name}`, 'person_add');
            onOpenOnboarding(profile);
          }

          // Check if user already has an existing backup in Google Drive
          try {
            setDriveStatus('Checking Google Drive backup...');
            const existingBackup = await findDriveBackupFile(accessToken);
            if (existingBackup) {
              const confirmRestore = window.confirm(
                `Google Drive-এ আগের ব্যাকআপ ফাইল পাওয়া গেছে (Last saved: ${new Date(
                  existingBackup.modifiedTime
                ).toLocaleDateString()})। রিস্টোর করবেন?`
              );
              if (confirmRestore) {
                const snapshot = await downloadFromGoogleDrive(accessToken, existingBackup.id);
                const blob = new Blob([JSON.stringify(snapshot)], { type: 'application/json' });
                const file = new File([blob], 'drive_backup.json');
                await importBackupFile(file, userId);
                onShowToast('Google Drive ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!', 'cloud_download');
              }
            } else {
              // Automatically create initial backup on Google Drive
              const snapshot = await createDatabaseSnapshot(userId);
              await uploadToGoogleDrive(accessToken, snapshot);
              setDriveStatus('Drive: Synced');
            }
          } catch (driveErr) {
            console.warn('Drive check/init notice:', driveErr);
          }

          onClose();
        } catch (err: any) {
          setIsLoading(false);
          onShowToast(err.message || 'Google লগইন সম্পন্ন করতে সমস্যা হয়েছে', 'error');
        }
      },
      (err: any) => {
        setIsLoading(false);
        console.error('Google OAuth error:', err);
        if (err?.error === 'popup_closed_by_user') {
          onShowToast('Google সাইন-ইন উইন্ডো বন্ধ করা হয়েছে', 'info');
        } else {
          onShowToast(err?.message || 'Google OAuth ব্যর্থ হয়েছে। Client ID চেক করুন।', 'error');
          setShowConfig(true);
        }
      }
    );
  };

  // Quick Start without GCP Setup (From Scratch)
  const handleQuickScratchSignIn = (emailToUse?: string) => {
    const targetEmail = (emailToUse || quickEmail).trim();
    if (!targetEmail) return;

    setIsLoading(true);
    setTimeout(() => {
      const username = targetEmail.split('@')[0] || 'User';
      const formattedName = username
        .replace(/[._-]/g, ' ')
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

      const userId = `user_${Date.now()}`;
      const newUser: UserProfile = {
        id: userId,
        name: formattedName,
        email: targetEmail,
        initial: formattedName.charAt(0).toUpperCase()
      };

      onAddUser(newUser, true);
      onSwitchUser(newUser);
      setIsLoading(false);
      setQuickEmail('');
      onShowToast(`ফ্রেশ অ্যাকাউন্ট তৈরি হয়েছে: ${newUser.name}`, 'person_add');
      onOpenOnboarding(newUser);
      onClose();
    }, 400);
  };

  // Sync current user's data to Google Drive
  const handleSyncToDriveNow = async () => {
    const token = getStoredAccessToken();
    if (!token) {
      handleRealGoogleSignIn();
      return;
    }

    setIsDriveSyncing(true);
    try {
      const snapshot = await createDatabaseSnapshot(currentUser.id);
      await uploadToGoogleDrive(token, snapshot);
      onShowToast('Google Drive-এ ক্লাউড ব্যাকআপ সফল হয়েছে!', 'cloud_done');
      setDriveStatus('Synced just now');
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('expired')) {
        onShowToast('সেশনের মেয়াদ শেষ! পুনরায় Google সাইন-ইন করুন।', 'error');
        handleRealGoogleSignIn();
      } else {
        onShowToast('Google Drive সিঙ্ক করতে সমস্যা হয়েছে', 'error');
      }
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredGoogleClientId(clientId.trim());
    setShowConfig(false);
    onShowToast('Google Client ID সংরক্ষিত হয়েছে! এখন Sign in করুন।', 'check_circle');
    handleRealGoogleSignIn();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#ffffff] dark:bg-[#1e1f20] rounded-[28px] max-w-md w-full p-6 flex flex-col shadow-2xl border border-black/10 dark:border-white/10 text-[#1f1f1f] dark:text-[#e3e3e3] overflow-hidden relative">
        
        {/* Loading Progress Bar */}
        {(isLoading || isDriveSyncing) && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div className="h-full bg-[#1a73e8] animate-[pulse_0.8s_infinite] w-full"></div>
          </div>
        )}

        {/* Top Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="font-google font-semibold text-base tracking-tight">
              Google Account &amp; Drive Sync
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center tap-press transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* ==================== CURRENT ACTIVE USER CARD ==================== */}
        <div className="flex flex-col items-center pt-3 pb-2">
          <div className="relative">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-20 h-20 rounded-full border-2 border-emerald-500 shadow-md object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#1a73e8] text-white font-bold text-3xl flex items-center justify-center shadow-md select-none">
                {currentUser.initial}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white dark:bg-[#282a2c] shadow flex items-center justify-center text-neutral-600 dark:text-neutral-300 border border-black/10 dark:border-white/10">
              <span className="material-symbols-outlined text-[14px]">
                {hasAccessToken ? 'cloud_done' : 'account_circle'}
              </span>
            </div>
          </div>

          <div className="mt-2.5 font-bold text-base text-neutral-900 dark:text-neutral-100 text-center">
            {currentUser.name}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
            {currentUser.email}
          </div>

          {/* Drive Status Badge */}
          <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                hasAccessToken ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            ></span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300 text-[11px]">
              {hasAccessToken ? `Google Drive: ${driveStatus}` : 'Drive: Local Only (Not Synced)'}
            </span>
          </div>
        </div>

        {/* ==================== REAL 1-CLICK GOOGLE SIGN-IN BUTTON ==================== */}
        <div className="py-2">
          <button
            onClick={handleRealGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-full border border-black/15 dark:border-white/20 bg-white dark:bg-[#131314] text-neutral-800 dark:text-neutral-100 flex items-center justify-center gap-3 font-medium text-xs sm:text-sm shadow-sm hover:shadow-md tap-press transition-all"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="font-semibold">
              {hasAccessToken ? 'Switch or Re-authorize Google Account' : 'Sign in with Google (Chrome 1-Click)'}
            </span>
          </button>
        </div>

        {/* ==================== DRIVE CLOUD ACTIONS ==================== */}
        {hasAccessToken && (
          <div className="flex gap-2 py-1">
            <button
              onClick={handleSyncToDriveNow}
              disabled={isDriveSyncing}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm tap-press transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
              <span>{isDriveSyncing ? 'Syncing...' : 'Sync to Drive'}</span>
            </button>
            <button
              onClick={() => onOpenOnboarding(currentUser)}
              className="py-2.5 px-3.5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-xs font-semibold tap-press transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
              <span>Setup Wallets</span>
            </button>
          </div>
        )}

        {/* ==================== SWITCH PROFILES LIST ==================== */}
        {users.length > 1 && (
          <div className="mt-2 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Saved Profiles on Device
            </span>
            <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
              {users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    onSwitchUser(u);
                    onClose();
                  }}
                  className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer tap-press transition-colors ${
                    u.id === currentUser.id
                      ? 'bg-black/10 dark:bg-white/10 font-bold'
                      : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#1a73e8] text-white text-xs font-bold flex items-center justify-center">
                        {u.initial}
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-neutral-900 dark:text-neutral-100">{u.name}</div>
                      <div className="text-[10px] text-neutral-500">{u.email}</div>
                    </div>
                  </div>
                  {u.id === currentUser.id && (
                    <span className="material-symbols-outlined text-[16px] text-emerald-500">check</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== GOOGLE CLIENT ID CONFIG EXPANDER ==================== */}
        <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="w-full flex items-center justify-between text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 py-1 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">settings</span>
              <span>Google Cloud OAuth Settings</span>
            </span>
            <span className="material-symbols-outlined text-[16px]">
              {showConfig ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {showConfig && (
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 mt-2 flex flex-col gap-2.5 text-xs animate-in fade-in duration-150">
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11px]">
                Chrome-এর আসল এক-ক্লিক সাইন-ইন ও রিয়েল Google Drive অ্যাক্সেসের জন্য Google Cloud Console থেকে একটি 100% ফ্রি Web Client ID দিন:
              </p>
              <form onSubmit={handleSaveClientId} className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="xxxx.apps.googleusercontent.com"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gLight-bg dark:bg-gDark-bg border border-black/10 dark:border-white/10 font-mono text-[11px] outline-none focus:border-[#1a73e8]"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 rounded-xl bg-[#1a73e8] text-white font-bold text-xs"
                  >
                    Save &amp; Connect Google
                  </button>
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-black/10 dark:bg-white/10 font-semibold text-xs inline-flex items-center gap-1"
                  >
                    <span>Get ID</span>
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  </a>
                </div>
              </form>

              {/* Instant Scratch Demo without GCP setup */}
              <div className="pt-2 border-t border-black/10 dark:border-white/10 flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold text-neutral-400">
                  Or Quick Start From Scratch:
                </span>
                <div className="flex gap-1.5">
                  <input
                    type="email"
                    placeholder="Enter your Gmail"
                    value={quickEmail}
                    onChange={(e) => setQuickEmail(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-gLight-bg dark:bg-gDark-bg border border-black/10 dark:border-white/10 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuickScratchSignIn()}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shrink-0"
                  >
                    Start Scratch
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ==================== FOOTER ACTIONS ==================== */}
        <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-neutral-500">
          <button
            onClick={() => {
              if (window.confirm('আপনি কি নিশ্চিত যে আপনার বর্তমান ডাটা মুছে ফ্রেশ শুরু করতে চান?')) {
                onResetToScratch(currentUser.id);
                onShowToast('অ্যাকাউন্ট ফ্রেশ রিসেট করা হয়েছে (From Scratch)!', 'refresh');
                onClose();
              }
            }}
            className="text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 text-[11px]"
          >
            <span className="material-symbols-outlined text-[14px]">restart_alt</span>
            <span>Reset to Scratch</span>
          </button>

          <button
            onClick={() => {
              clearGoogleSession();
              localStorage.removeItem('hishab_is_logged_in');
              if (onSignOut) {
                onSignOut();
              } else {
                const defaultUser = users[0] || currentUser;
                onSwitchUser(defaultUser);
              }
              onShowToast('Google অ্যাকাউন্ট সাইন আউট করা হয়েছে', 'logout');
              onClose();
            }}
            className="hover:text-neutral-800 dark:hover:text-neutral-200 inline-flex items-center gap-1 text-[11px]"
          >
            <span className="material-symbols-outlined text-[14px]">logout</span>
            <span>Sign out / Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
