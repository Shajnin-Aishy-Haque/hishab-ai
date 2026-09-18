import React, { useState } from 'react';
import type { UserProfile } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  user: UserProfile;
  onSaveBalances: (balances: { cash: number; bkash: number; bank: number; nagad: number }) => void;
  onSkip: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  user,
  onSaveBalances,
  onSkip
}) => {
  const [cash, setCash] = useState('0');
  const [bkash, setBkash] = useState('0');
  const [bank, setBank] = useState('0');
  const [nagad, setNagad] = useState('0');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBalances({
      cash: parseFloat(cash) || 0,
      bkash: parseFloat(bkash) || 0,
      bank: parseFloat(bank) || 0,
      nagad: parseFloat(nagad) || 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gLight-bg dark:bg-gDark-surface rounded-3xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl border border-black/10 dark:border-white/10 text-gLight-textPrimary dark:text-gDark-textPrimary">
        
        {/* Header with Google user badge */}
        <div className="flex items-center gap-3 pb-2 border-b border-black/5 dark:border-white/5">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-12 h-12 rounded-full border-2 border-emerald-500 shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#1a73e8] text-white font-bold text-xl flex items-center justify-center shadow-sm">
              {user.initial}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Google Connected
              </span>
              <span className="text-[11px] text-gLight-textTertiary dark:text-gDark-textTertiary">
                Fresh Workspace
              </span>
            </div>
            <h3 className="text-base font-bold tracking-tight">
              স্বাগতম, {user.name.split(' ')[0]}!
            </h3>
            <p className="text-xs text-gLight-textSecondary dark:text-gDark-textSecondary">
              {user.email}
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gLight-textPrimary dark:text-gDark-textPrimary">
            আপনার অ্যাকাউন্ট সাজিয়ে নিন (From Scratch)
          </h4>
          <p className="text-xs text-gLight-textSecondary dark:text-gDark-textSecondary mt-0.5 leading-relaxed">
            কোনো ডামি ডাটা ছাড়া সম্পূর্ণ ফ্রেশ শুরু করছেন। আপনার ওয়ালেটগুলোতে বর্তমান কত ব্যালেন্স আছে তা দিয়ে দিন (পরবর্তীতে যেকোনো সময় পরিবর্তন করা যাবে):
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Cash */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">💵</span>
              <div>
                <span className="text-xs font-bold block">Cash (পকেট ক্যাশ)</span>
                <span className="text-[10px] text-gLight-textTertiary dark:text-gDark-textTertiary">হাতের নগদ টাকা</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gLight-textTertiary dark:text-gDark-textTertiary">৳</span>
              <input
                type="number"
                min="0"
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                className="w-24 text-right px-2.5 py-1.5 rounded-xl bg-gLight-bg dark:bg-gDark-bg border border-black/10 dark:border-white/10 font-bold text-sm outline-none focus:border-[#1a73e8]"
              />
            </div>
          </div>

          {/* bKash */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📱</span>
              <div>
                <span className="text-xs font-bold block">bKash (বিকাশ)</span>
                <span className="text-[10px] text-gLight-textTertiary dark:text-gDark-textTertiary">Personal Account</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gLight-textTertiary dark:text-gDark-textTertiary">৳</span>
              <input
                type="number"
                min="0"
                value={bkash}
                onChange={(e) => setBkash(e.target.value)}
                className="w-24 text-right px-2.5 py-1.5 rounded-xl bg-gLight-bg dark:bg-gDark-bg border border-black/10 dark:border-white/10 font-bold text-sm outline-none focus:border-[#e91e63]"
              />
            </div>
          </div>

          {/* Bank */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🏦</span>
              <div>
                <span className="text-xs font-bold block">Bank (ব্যাংক অ্যাকাউন্ট)</span>
                <span className="text-[10px] text-gLight-textTertiary dark:text-gDark-textTertiary">City / SCB / BRAC</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gLight-textTertiary dark:text-gDark-textTertiary">৳</span>
              <input
                type="number"
                min="0"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-24 text-right px-2.5 py-1.5 rounded-xl bg-gLight-bg dark:bg-gDark-bg border border-black/10 dark:border-white/10 font-bold text-sm outline-none focus:border-[#1a73e8]"
              />
            </div>
          </div>

          {/* Nagad */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🟧</span>
              <div>
                <span className="text-xs font-bold block">Nagad (নগদ)</span>
                <span className="text-[10px] text-gLight-textTertiary dark:text-gDark-textTertiary">Personal Wallet</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gLight-textTertiary dark:text-gDark-textTertiary">৳</span>
              <input
                type="number"
                min="0"
                value={nagad}
                onChange={(e) => setNagad(e.target.value)}
                className="w-24 text-right px-2.5 py-1.5 rounded-xl bg-gLight-bg dark:bg-gDark-bg border border-black/10 dark:border-white/10 font-bold text-sm outline-none focus:border-[#f57c00]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-sm shadow-md tap-press transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>ব্যালেন্স সেভ করে হিসাব শুরু করুন</span>
            </button>

            <button
              type="button"
              onClick={onSkip}
              className="w-full py-2.5 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 text-xs text-gLight-textTertiary dark:text-gDark-textTertiary font-medium tap-press transition-colors"
            >
              এখন স্কিপ করুন (সবকিছু ৳ ০ থেকে শুরু হবে)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
