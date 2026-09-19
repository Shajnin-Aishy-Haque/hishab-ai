import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { isValidEmail } from '../services/googleAuth';

interface WelcomeGateProps {
  onGoogleSignIn: () => void;
  onDirectEmailSignIn: (email: string, name?: string, isNewSignup?: boolean) => void;
  onGuestSignIn: () => void;
  savedUsers?: UserProfile[];
  onSelectSavedUser?: (user: UserProfile) => void;
  onDeleteSavedUser?: (userId: string, purgeData: boolean) => void;
  isLoading?: boolean;
  authError?: { title: string; message: string } | null;
  onClearAuthError?: () => void;
}

export const WelcomeGate: React.FC<WelcomeGateProps> = ({
  onGoogleSignIn,
  onDirectEmailSignIn,
  onGuestSignIn,
  savedUsers = [],
  onSelectSavedUser,
  onDeleteSavedUser,
  isLoading = false,
  authError = null,
  onClearAuthError
}) => {
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signinEmail, setSigninEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Deletion Modal State
  const [profileToDelete, setProfileToDelete] = useState<UserProfile | null>(null);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Clear errors when switching tabs
  useEffect(() => {
    setValidationError('');
    if (onClearAuthError) onClearAuthError();
  }, [authMode]);

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const cleanEmail = signupEmail.trim().toLowerCase();
    const cleanName = signupName.trim();

    if (!cleanName || cleanName.length < 2) {
      setValidationError('অনুগ্রহ করে আপনার নাম দিন (কমপক্ষে ২ অক্ষর)।');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setValidationError('সঠিক ইমেইল ফরম্যাট দিন (যেমন: name@gmail.com)।');
      return;
    }

    // Check if account already exists on device
    const existing = savedUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      // Smoothly sign into existing account
      onDirectEmailSignIn(cleanEmail, existing.name, false);
      return;
    }

    onDirectEmailSignIn(cleanEmail, cleanName, true);
  };

  const handleSigninSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const cleanEmail = signinEmail.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      setValidationError('সঠিক ইমেইল ফরম্যাট দিন (যেমন: yourname@gmail.com)।');
      return;
    }

    const existing = savedUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!existing) {
      setValidationError('এই ডিভাইসে এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি। "Create Account" বেছে নিন।');
      return;
    }

    onDirectEmailSignIn(cleanEmail, existing.name, false);
  };

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#131314] text-[#1f1f1f] dark:text-[#e3e3e3] flex flex-col items-center justify-between p-4 sm:p-5 select-none font-google">
      {/* Top Brand Bar */}
      <div className="w-full max-w-md flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#0b57d0]/10 dark:bg-[#a8c7fa]/15 flex items-center justify-center text-[#0b57d0] dark:text-[#a8c7fa] font-bold">
            <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight leading-none">Hishab AI</span>
            <span className="text-[10px] text-neutral-400 font-medium">Personal Finance &amp; Dhar</span>
          </div>
        </div>

        {/* Network Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 text-[11px] text-neutral-500 font-medium">
          <span
            className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}
          ></span>
          <span>{isOnline ? 'Cloudflare Live' : 'Offline Ready'}</span>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="w-full max-w-md flex flex-col items-center text-center my-auto py-3">
        {/* Animated Brand Emblem */}
        <div className="relative mb-2.5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#0b57d0] via-[#1a73e8] to-[#4285f4] shadow-xl flex items-center justify-center text-white text-3xl sm:text-4xl font-extrabold ring-4 ring-blue-500/20">
            ৳
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-white dark:bg-[#1e1f20] shadow-md flex items-center justify-center border border-black/10 dark:border-white/10">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-0.5">
          Hishab AI
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed mb-3">
          Bangladesh-focused Smart Finance &amp; Dhar Khata with 1-Click Google Drive Sync
        </p>

        {/* Offline Banner if disconnected */}
        {!isOnline && (
          <div className="w-full mb-3 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-left text-[11px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0">wifi_off</span>
            <span>অফলাইন মোড সক্রিয়: আপনার লোকাল ডাটা ডিভাইসে সম্পূর্ণ নিরাপদ রয়েছে।</span>
          </div>
        )}

        {/* Feature Highlights Pills */}
        <div className="w-full grid grid-cols-2 gap-2 mb-3.5 text-left">
          <div className="p-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 flex flex-col gap-0.5">
            <span className="text-xs font-semibold flex items-center gap-1">
              <span>🔒</span> 100% Private
            </span>
            <span className="text-[10px] text-neutral-500 leading-tight">প্রতি ইউজারের ডাটা আলাদা ও নিজস্ব লোকাল স্টোরেজে সংরক্ষিত</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 flex flex-col gap-0.5">
            <span className="text-xs font-semibold flex items-center gap-1">
              <span>☁️</span> Drive Cloud Sync
            </span>
            <span className="text-[10px] text-neutral-500 leading-tight">নতুন একাউন্টে ফ্রেশ ৳০ দিয়ে শুরু, Drive-এ 1-Click ব্যাকআপ</span>
          </div>
        </div>

        {/* Error Notification Banner */}
        {(authError || validationError) && (
          <div className="w-full mb-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-left text-xs flex items-start justify-between gap-2 animate-in fade-in duration-150">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
              <div>
                <div className="font-bold text-[11px]">{authError?.title || 'ইনপুট ত্রুটি'}</div>
                <div className="text-[11px] opacity-90 leading-tight">{validationError || authError?.message}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setValidationError('');
                if (onClearAuthError) onClearAuthError();
              }}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Main Action Container */}
        <div className="w-full flex flex-col gap-2.5">
          {/* 1-Click Native Google Sign-In */}
          <button
            type="button"
            onClick={onGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-5 rounded-2xl bg-[#1a73e8] hover:bg-[#1557b0] text-white flex items-center justify-center gap-3 font-semibold text-sm shadow-md hover:shadow-lg transition-all tap-press ring-4 ring-blue-500/20 disabled:opacity-75 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
            )}
            <span>{isLoading ? 'Google-এ সংযোগ হচ্ছে...' : 'Sign in with Google (Chrome 1-Click)'}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-0.5">
            <div className="flex-1 h-px bg-black/10 dark:bg-white/10"></div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">or</span>
            <div className="flex-1 h-px bg-black/10 dark:bg-white/10"></div>
          </div>

          {/* Dual Tab Switcher: Sign Up vs Sign In */}
          <div className="w-full bg-black/5 dark:bg-white/5 p-1 rounded-2xl flex gap-1">
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                authMode === 'signup'
                  ? 'bg-white dark:bg-[#282a2c] text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Create Account (নতুন)
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                authMode === 'signin'
                  ? 'bg-white dark:bg-[#282a2c] text-neutral-900 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Sign In (লগইন)
            </button>
          </div>

          {/* Tab 1: CREATE ACCOUNT (SIGN UP) */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="flex flex-col gap-2.5 text-left animate-in fade-in duration-150">
              <div>
                <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                  Full Name (আপনার নাম)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shakib Ahmed"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                  Personal or Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#1a73e8]"
                />
              </div>

              <button
                type="submit"
                disabled={!signupEmail.trim() || !signupName.trim() || isLoading}
                className="w-full py-2.5 rounded-2xl bg-neutral-900 dark:bg-neutral-100 hover:opacity-95 text-white dark:text-neutral-900 font-bold text-xs tap-press disabled:opacity-40 transition-opacity flex items-center justify-center gap-1.5 shadow-sm mt-1"
              >
                <span>Create Workspace &amp; Setup Wallets</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>

              <p className="text-[10px] text-neutral-400 text-center">
                পাসওয়ার্ড ছাড়াই তৎক্ষণাৎ আপনার নিজস্ব প্রাইভেট হিসাব ওয়ার্কস্পেস তৈরি হবে।
              </p>
            </form>
          )}

          {/* Tab 2: SIGN IN (EXISTING USER) */}
          {authMode === 'signin' && (
            <div className="flex flex-col gap-3 text-left animate-in fade-in duration-150">
              {/* Saved Profiles Quick Select */}
              {savedUsers && savedUsers.length > 0 && onSelectSavedUser && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Saved on this Device:
                  </span>
                  <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-0.5">
                    {savedUsers.map((u) => (
                      <div
                        key={u.id}
                        className="w-full p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.07] dark:hover:bg-white/[0.08] flex items-center justify-between transition-colors tap-press"
                      >
                        <div
                          onClick={() => onSelectSavedUser(u)}
                          className="flex items-center gap-2.5 flex-1 cursor-pointer"
                        >
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-black/10 dark:ring-white/10" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white text-[12px] font-bold flex items-center justify-center shrink-0">
                              {u.initial || u.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.authProvider === 'google' && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md font-medium">Google</span>
                              )}
                              {u.isDemo && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-md font-medium">Demo</span>
                              )}
                            </div>
                            <div className="text-[10px] text-neutral-400 truncate">{u.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onSelectSavedUser(u)}
                            className="text-xs font-bold text-[#1a73e8] px-2.5 py-1 rounded-lg hover:bg-blue-500/10 transition-colors"
                          >
                            Open →
                          </button>
                          {onDeleteSavedUser && (
                            <button
                              type="button"
                              onClick={() => setProfileToDelete(u)}
                              className="w-7 h-7 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-500 flex items-center justify-center transition-colors"
                              title="Delete or remove profile"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Email Sign-In */}
              <form onSubmit={handleSigninSubmit} className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Or Enter by Email:
                </span>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="your.email@gmail.com"
                    value={signinEmail}
                    onChange={(e) => setSigninEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-xs text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#1a73e8]"
                  />
                  <button
                    type="submit"
                    disabled={!signinEmail.trim() || isLoading}
                    className="px-4 py-2 rounded-2xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-xs shrink-0 tap-press disabled:opacity-50"
                  >
                    Enter →
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 1-Tap Explore as Demo / Guest Mode Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onGuestSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-3.5 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-2 text-xs font-semibold tap-press transition-colors cursor-pointer"
            >
              <span className="text-base">🚀</span>
              <span>Explore as Guest / Demo Mode (গেস্ট হিসেবে দেখুন)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Profile Deletion */}
      {profileToDelete && onDeleteSavedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1e1f20] rounded-3xl max-w-sm w-full p-5 flex flex-col gap-3 shadow-2xl border border-black/10 dark:border-white/10 text-left">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              <h3 className="text-sm font-bold">প্রোফাইল সরানোর অপশন</h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              আপনি <strong>{profileToDelete.name}</strong> ({profileToDelete.email}) প্রোফাইলটি মুছে ফেলতে যাচ্ছেন। কোন অপশনটি বেছে নিতে চান?
            </p>

            <div className="flex flex-col gap-2 mt-1">
              <button
                type="button"
                onClick={() => {
                  onDeleteSavedUser(profileToDelete.id, false);
                  setProfileToDelete(null);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 text-xs font-semibold text-left flex items-center justify-between"
              >
                <span>ডিভাইস লিস্ট থেকে সরান (ডাটা সংরক্ষিত থাকবে)</span>
                <span className="material-symbols-outlined text-[16px]">visibility_off</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onDeleteSavedUser(profileToDelete.id, true);
                  setProfileToDelete(null);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-600 dark:text-red-400 text-xs font-semibold text-left flex items-center justify-between"
              >
                <span>ডাটা সহ স্থায়ীভাবে ডিলিট করুন (Purge all data)</span>
                <span className="material-symbols-outlined text-[16px]">delete_forever</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileToDelete(null)}
                className="w-full py-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs font-medium text-center mt-1"
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="w-full max-w-md pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
        <span>Hishab AI • Personal Finance</span>
        <div className="flex gap-2 font-medium">
          <span>100% Free &amp; Private</span>
          <span>•</span>
          <span>Drive Sync</span>
        </div>
      </div>
    </div>
  );
};
