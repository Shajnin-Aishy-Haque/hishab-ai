import React, { useState } from 'react';
import type { DharItem } from '../types';
import { formatDisplayDate } from '../utils/dateUtils';

interface DharKhataViewProps {
  dharItems: DharItem[];
  onBack: () => void;
  onOpenNewDhar: () => void;
  onOpenSettle: (item: DharItem) => void;
  onDeleteDhar?: (id: number) => void;
}

export const DharKhataView: React.FC<DharKhataViewProps> = ({
  dharItems,
  onBack,
  onOpenNewDhar,
  onOpenSettle,
  onDeleteDhar
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pabo' | 'debo' | 'settled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);

  const totalPabo = dharItems
    .filter((d) => d.type === 'pabo' && d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalDebo = dharItems
    .filter((d) => d.type === 'debo' && d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);

  const filteredItems = dharItems.filter((d) => {
    const matchesSearch =
      d.person.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.note.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'all') return d.status === 'pending';
    if (activeTab === 'pabo') return d.type === 'pabo' && d.status === 'pending';
    if (activeTab === 'debo') return d.type === 'debo' && d.status === 'pending';
    if (activeTab === 'settled') return d.status === 'settled' || d.amount === 0;
    return true;
  });

  return (
    <div className="flex-1 px-4 sm:px-5 flex flex-col gap-4 pt-3 pb-32 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-gLight-surface dark:bg-gDark-surface flex items-center justify-center text-gLight-textSecondary dark:text-gDark-textSecondary tap-press"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <h2 className="text-base sm:text-lg font-bold text-gLight-textPrimary dark:text-gDark-textPrimary">
            ধার-দেনা খাতা (Lend &amp; Borrow)
          </h2>
        </div>
        <button
          onClick={onOpenNewDhar}
          className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-1.5 rounded-full text-xs font-bold tap-press flex items-center gap-1 shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>নতুন খাতা</span>
        </button>
      </div>

      {/* Hero Summary Cards (Pabo vs Debo) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-gLight-surface dark:bg-gDark-surface p-4 flex flex-col border border-emerald-500/20 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-gLight-green dark:text-gDark-green uppercase tracking-wide">
              আমি পাবো (Pabo)
            </span>
            <span className="material-symbols-outlined text-[18px] text-gLight-green dark:text-gDark-green">
              call_received
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-gLight-green dark:text-gDark-green">
            ৳ {totalPabo.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-gLight-textTertiary dark:text-gDark-textTertiary mt-1">
            {dharItems.filter((d) => d.type === 'pabo' && d.status === 'pending').length} জনের কাছে বাকি
          </span>
        </div>

        <div className="rounded-3xl bg-gLight-surface dark:bg-gDark-surface p-4 flex flex-col border border-rose-500/20 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-rose-500 dark:text-gDark-red uppercase tracking-wide">
              আমি দেবো (Debo)
            </span>
            <span className="material-symbols-outlined text-[18px] text-rose-500 dark:text-gDark-red">
              call_made
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-rose-500 dark:text-gDark-red">
            ৳ {totalDebo.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-gLight-textTertiary dark:text-gDark-textTertiary mt-1">
            {dharItems.filter((d) => d.type === 'debo' && d.status === 'pending').length} জনের কাছে দেনা
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-gLight-textTertiary dark:text-gDark-textTertiary">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ব্যক্তি বা দোকানের নাম দিয়ে খুঁজুন..."
          className="w-full pl-10 pr-4 py-2 rounded-2xl bg-gLight-surface dark:bg-gDark-surface text-xs font-medium text-gLight-textPrimary dark:text-gDark-textPrimary placeholder:text-gLight-textTertiary dark:placeholder:text-gDark-textTertiary border border-black/5 dark:border-white/10 focus:outline-none focus:border-gLight-blue"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-black/5 dark:border-white/10">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-gLight-surface dark:bg-gDark-surface text-gLight-textPrimary dark:text-gDark-textPrimary shadow-xs'
              : 'text-gLight-textSecondary dark:text-gDark-textSecondary'
          }`}
        >
          চলতি খাতা
        </button>
        <button
          onClick={() => setActiveTab('pabo')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'pabo'
              ? 'bg-gLight-green text-white shadow-xs'
              : 'text-gLight-textSecondary dark:text-gDark-textSecondary'
          }`}
        >
          পাবো
        </button>
        <button
          onClick={() => setActiveTab('debo')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'debo'
              ? 'bg-gLight-red text-white shadow-xs'
              : 'text-gLight-textSecondary dark:text-gDark-textSecondary'
          }`}
        >
          দেবো
        </button>
        <button
          onClick={() => setActiveTab('settled')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'settled'
              ? 'bg-black/20 dark:bg-white/20 text-gLight-textPrimary dark:text-gDark-textPrimary'
              : 'text-gLight-textSecondary dark:text-gDark-textSecondary'
          }`}
        >
          পরিশোধিত
        </button>
      </div>

      {/* Ledger Items List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-gLight-textTertiary">
            কোনো হিসাব পাওয়া যায়নি।
          </div>
        ) : (
          filteredItems.map((item) => {
            const isPabo = item.type === 'pabo';
            const isSettled = item.status === 'settled' || item.amount === 0;
            const hasRepayments = (item.originalAmount || 0) > item.amount;
            const repaidAmount = Math.max(0, (item.originalAmount || 0) - item.amount);
            const isExpanded = expandedItemId === item.id;

            return (
              <div
                key={item.id}
                className="bg-gLight-surface dark:bg-gDark-surface rounded-2xl p-3.5 flex flex-col border border-black/5 dark:border-white/5 hover:border-black/10 transition-all shadow-xs gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 ${
                        isPabo
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-rose-500/15 text-rose-500'
                      }`}
                    >
                      {item.person.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-gLight-textPrimary dark:text-gDark-textPrimary truncate">
                          {item.person}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            isPabo
                              ? 'bg-gLight-greenContainer text-gLight-green dark:text-gDark-green'
                              : 'bg-gLight-redContainer text-gLight-red dark:text-gDark-red'
                          }`}
                        >
                          {isPabo ? 'পাবো' : 'দেবো'}
                        </span>
                      </div>
                      <span className="text-xs text-gLight-textSecondary dark:text-gDark-textSecondary truncate">
                        {item.note ? `${item.note} • ` : ''}{item.date ? formatDisplayDate(item.date) : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span
                        className={`font-extrabold text-base ${
                          isSettled
                            ? 'line-through text-gLight-textTertiary'
                            : isPabo
                            ? 'text-gLight-green dark:text-gDark-green'
                            : 'text-rose-500 dark:text-gDark-red'
                        }`}
                      >
                        ৳ {item.amount.toLocaleString('en-IN')}
                      </span>
                      {hasRepayments && !isSettled && (
                        <span className="text-[10px] block text-emerald-600 dark:text-emerald-400 font-medium">
                          পরিশোধ: ৳{repaidAmount.toLocaleString('en-IN')}
                        </span>
                      )}
                      {isSettled && (
                        <span className="text-[10px] block text-gLight-textTertiary font-semibold">
                          পরিশোধিত
                        </span>
                      )}
                    </div>

                    {!isSettled ? (
                      <button
                        onClick={() => onOpenSettle(item)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full tap-press shadow-xs transition-opacity ${
                          isPabo
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25'
                        }`}
                      >
                        {isPabo ? 'পেয়েছি' : 'পরিশোধ'}
                      </button>
                    ) : (
                      onDeleteDhar && item.id && (
                        <button
                          onClick={() => {
                            if (window.confirm(`${item.person}-এর হিসাব খাতা মুছে ফেলবেন?`)) {
                              onDeleteDhar(item.id!);
                            }
                          }}
                          className="w-7 h-7 rounded-full hover:bg-red-500/10 text-neutral-400 hover:text-red-500 flex items-center justify-center transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Installment History Accordion */}
                {item.history && item.history.length > 0 && (
                  <div className="pt-2 border-t border-black/5 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setExpandedItemId(isExpanded ? null : (item.id ?? null))}
                      className="w-full flex items-center justify-between text-[11px] text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 font-medium"
                    >
                      <span>
                        লেনদেন ইতিহাস ({item.history.length} টি কিস্তি/এন্ট্রি)
                      </span>
                      <span className="material-symbols-outlined text-[15px]">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="mt-1.5 space-y-1 pl-2 border-l-2 border-black/10 dark:border-white/10 animate-in fade-in duration-150">
                        {item.history.map((log) => (
                          <div key={log.id} className="flex items-center justify-between text-[10px] text-neutral-600 dark:text-neutral-400">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${log.type === 'repayment' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                              <span>{log.type === 'repayment' ? 'পরিশোধ' : 'যুক্ত ঋণ'}</span>
                              <span className="text-neutral-400">• {formatDisplayDate(log.date)} {log.time ? `(${log.time})` : ''}</span>
                            </div>
                            <span className="font-bold text-neutral-800 dark:text-neutral-200">
                              {log.type === 'repayment' ? '-' : '+'}৳{log.amount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
