import React, { useState, useEffect } from 'react';
import type { Account, DharItem } from '../types';

interface DharSettleModalProps {
  isOpen: boolean;
  item: DharItem | null;
  accounts: Account[];
  onClose: () => void;
  onSettle: (id: number, settleAmount: number, accountId: string) => void;
  onAddMoreLoan: (id: number, addAmount: number, note: string, accountId: string) => void;
}

export const DharSettleModal: React.FC<DharSettleModalProps> = ({
  isOpen,
  item,
  accounts,
  onClose,
  onSettle,
  onAddMoreLoan
}) => {
  const [activeTab, setActiveTab] = useState<'settle' | 'addMore'>('settle');
  const [settleMode, setSettleMode] = useState<'full' | 'partial'>('full');
  const [partialAmount, setPartialAmount] = useState('');
  const [addMoreAmount, setAddMoreAmount] = useState('');
  const [addMoreNote, setAddMoreNote] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || 'cash');

  useEffect(() => {
    if (item) {
      setPartialAmount(String(item.amount));
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const isPabo = item.type === 'pabo';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.id) return;

    if (activeTab === 'settle') {
      const amt = settleMode === 'full' ? item.amount : parseFloat(partialAmount);
      if (amt && amt > 0) {
        onSettle(item.id, amt, selectedAccountId);
      }
    } else {
      const amt = parseFloat(addMoreAmount);
      if (amt && amt > 0) {
        onAddMoreLoan(item.id, amt, addMoreNote.trim(), selectedAccountId);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-150">
      <div className="bg-gLight-surface dark:bg-gDark-surface rounded-t-3xl max-w-md w-full p-6 flex flex-col gap-4 max-h-[88vh] overflow-y-auto shadow-2xl border-t border-black/10 dark:border-white/10">
        {/* Header (Matches Stitch lines 1244-1257) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl font-bold flex items-center justify-center text-base ${
                isPabo ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'
              }`}
            >
              {item.person.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-gLight-textPrimary dark:text-gDark-textPrimary">
                {item.person}
              </h3>
              <div className="text-[11px] text-gLight-textTertiary dark:text-gDark-textTertiary">
                {item.note || 'খাতা বিবরণ'}
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

        {/* Outstanding Balance Hero Banner (Matches Stitch lines 1259-1269) */}
        <div
          className={`bg-gLight-surfaceHigh/60 dark:bg-gDark-surfaceHigh/60 rounded-2xl p-4 flex items-center justify-between border ${
            isPabo ? 'border-emerald-500/20' : 'border-rose-500/20'
          }`}
        >
          <div>
            <span
              className={`text-xs font-semibold ${
                isPabo ? 'text-gLight-green dark:text-gDark-green' : 'text-rose-500 dark:text-gDark-red'
              }`}
            >
              {isPabo ? 'আমি পাবো (Receivable)' : 'আমি দেবো (Payable)'}
            </span>
            <div className="text-2xl font-black text-gLight-textPrimary dark:text-gDark-textPrimary mt-0.5">
              ৳ {item.amount.toLocaleString('en-IN')}
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              isPabo ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'
            }`}
          >
            বাকি আছে
          </span>
        </div>

        {/* 2-Way Tab Switcher: [ পরিশোধ / কিস্তি ] vs [ পুনরায় ধার বৃদ্ধি ] (Matches Stitch lines 1271-1280) */}
        <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('settle')}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'settle'
                ? 'bg-gLight-surface dark:bg-gDark-surface text-gLight-blue dark:text-gDark-blue shadow-sm'
                : 'text-gLight-textTertiary dark:text-gDark-textTertiary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">payments</span>
            <span>পরিশোধ / কিস্তি</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('addMore')}
            className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all flex items-center justify-center gap-1 ${
              activeTab === 'addMore'
                ? 'bg-gLight-surface dark:bg-gDark-surface text-gLight-blue dark:text-gDark-blue shadow-sm font-bold'
                : 'text-gLight-textTertiary dark:text-gDark-textTertiary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>পুনরায় ধার বৃদ্ধি</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'settle' ? (
            /* Action 1: Settlement Section (Matches Stitch lines 1282-1334) */
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
                  পরিশোধের ধরন (Settlement Type)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettleMode('full')}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold tap-press border text-center transition-all flex items-center justify-center gap-1.5 ${
                      settleMode === 'full'
                        ? 'bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-onBlueContainer dark:text-gDark-onBlueContainer border-gLight-blue/40'
                        : 'bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh text-gLight-textSecondary dark:text-gDark-textSecondary border-black/5 dark:border-white/10'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>সম্পূর্ণ (৳ {item.amount.toLocaleString('en-IN')})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettleMode('partial')}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-medium tap-press border text-center transition-all flex items-center justify-center gap-1.5 ${
                      settleMode === 'partial'
                        ? 'bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-onBlueContainer dark:text-gDark-onBlueContainer border-gLight-blue/40 font-bold'
                        : 'bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh text-gLight-textSecondary dark:text-gDark-textSecondary border-black/5 dark:border-white/10'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">pie_chart</span>
                    <span>আংশিক কিস্তি</span>
                  </button>
                </div>
              </div>

              {settleMode === 'partial' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
                    কিস্তির পরিমাণ (Partial Amount in BDT)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 font-bold text-sm text-gLight-textTertiary">৳</span>
                    <input
                      type="number"
                      max={item.amount}
                      value={partialAmount}
                      onChange={(e) => setPartialAmount(e.target.value)}
                      placeholder="500"
                      className="w-full bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl pl-9 pr-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-gLight-blue text-gLight-textPrimary dark:text-gDark-textPrimary"
                    />
                  </div>
                </div>
              )}

              {/* Account Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
                  {isPabo ? 'কোন অ্যাকাউন্টে টাকা রিসিভ হলো?' : 'কোন অ্যাকাউন্ট থেকে পরিশোধ করা হলো?'}
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full appearance-none bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 text-gLight-textPrimary dark:text-gDark-textPrimary"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.icon} {acc.name} (৳{acc.balance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            /* Action 2: Add More Loan Section (Matches Stitch lines 1336-1374) */
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
                  পুনরায় ধারের পরিমাণ (Additional Amount in BDT)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 font-bold text-sm text-gLight-textTertiary">৳</span>
                  <input
                    type="number"
                    required
                    value={addMoreAmount}
                    onChange={(e) => setAddMoreAmount(e.target.value)}
                    placeholder="500"
                    className="w-full bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl pl-9 pr-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-gLight-blue text-gLight-textPrimary dark:text-gDark-textPrimary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
                  কারণ / বিবরণ (Reason)
                </label>
                <input
                  type="text"
                  value={addMoreNote}
                  onChange={(e) => setAddMoreNote(e.target.value)}
                  placeholder="e.g. চা ও বিকেলের নাস্তা, উবার ভাড়া"
                  className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 focus:outline-none text-gLight-textPrimary dark:text-gDark-textPrimary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary">
                  টাকা দেয়া হলো কোন অ্যাকাউন্ট থেকে?
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full appearance-none bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl px-4 py-3 text-sm font-medium border border-black/5 dark:border-white/10 text-gLight-textPrimary dark:text-gDark-textPrimary"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.icon} {acc.name} (৳{acc.balance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full text-xs font-bold text-gLight-textSecondary dark:text-gDark-textSecondary hover:bg-black/5 dark:hover:bg-white/5 tap-press transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg py-3.5 rounded-full text-xs font-bold tap-press shadow-md hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{activeTab === 'settle' ? 'পরিশোধ নিশ্চিত করুন' : 'ধার বৃদ্ধি করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
