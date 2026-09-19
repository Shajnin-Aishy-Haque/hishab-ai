import React from 'react';
import type { Account, Category, DharItem, Transaction } from '../types';
import { getLocalDateString, formatDisplayDate } from '../utils/dateUtils';

interface HomeViewProps {
  accounts: Account[];
  categories: Category[];
  dharItems: DharItem[];
  transactions: Transaction[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  onOpenWalletsView: () => void;
  onOpenDharView: () => void;
  onOpenTransferModal: () => void;
  onOpenAddAccountModal: () => void;
  onOpenAddCategoryModal: () => void;
  onOpenManualEntryModal: () => void;
  onOpenSettleModal: (item: DharItem) => void;
  onSelectTransactionToEdit: (tx: Transaction) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  accounts,
  categories,
  dharItems,
  transactions,
  selectedCategory,
  onSelectCategory,
  onOpenWalletsView,
  onOpenDharView,
  onOpenTransferModal,
  onOpenAddAccountModal,
  onOpenAddCategoryModal,
  onOpenManualEntryModal,
  onOpenSettleModal,
  onSelectTransactionToEdit
}) => {
  const todayStr = getLocalDateString();
  const currentYearMonth = todayStr.substring(0, 7);

  const totalNet = accounts.reduce((sum, a) => sum + a.balance, 0);

  const monthlyExpense = transactions
    .filter((t) => {
      if (t.type !== 'expense') return false;
      const txDate = t.date || getLocalDateString(new Date(t.timestamp));
      return txDate.startsWith(currentYearMonth);
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyTarget = categories.reduce((sum, c) => sum + (c.budget || 0), 0) || 35000;
  const spendPercent = Math.min(100, Math.round((monthlyExpense / monthlyTarget) * 100));

  const totalPabo = dharItems
    .filter((d) => d.type === 'pabo' && d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalDebo = dharItems
    .filter((d) => d.type === 'debo' && d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);

  const pendingDharItems = dharItems.filter((d) => d.status === 'pending').slice(0, 3);

  const filteredTransactions = transactions.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.categoryId.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const todayExpense = transactions
    .filter((t) => {
      if (t.type !== 'expense') return false;
      const txDate = t.date || getLocalDateString(new Date(t.timestamp));
      return txDate === todayStr;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex-1 px-5 flex flex-col gap-4 pt-3 pb-36 animate-in fade-in duration-150">
      {/* 1. ACCOUNTS & WALLETS SECTION */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div
            onClick={onOpenWalletsView}
            className="flex items-center gap-2 cursor-pointer tap-press group"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-gLight-textSecondary dark:text-gDark-textSecondary group-hover:text-gLight-blue">
              Accounts &amp; Wallets
            </span>
            <span className="text-[11px] font-bold text-gLight-green dark:text-gDark-green bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Net: ৳ {totalNet.toLocaleString('en-IN')}
            </span>
            <span className="material-symbols-outlined text-[16px] text-gLight-textTertiary group-hover:text-gLight-blue">
              chevron_right
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenTransferModal}
              className="text-xs font-bold text-gLight-blue dark:text-gDark-blue bg-gLight-blueContainer dark:bg-gDark-blueContainer px-2.5 py-1 rounded-full tap-press flex items-center gap-1 hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
              <span>⇄ Transfer</span>
            </button>
            <button
              onClick={onOpenAddAccountModal}
              className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gLight-textSecondary dark:text-gDark-textSecondary hover:bg-black/10 dark:hover:bg-white/20 tap-press"
              title="Add Account"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>
        </div>

        {/* Scrollable Account Cards */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 -mx-5 px-5">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              onClick={onOpenWalletsView}
              className="account-card shrink-0 bg-gLight-surface dark:bg-gDark-surface rounded-2xl p-3 flex flex-col justify-between w-36 h-20 border border-black/5 dark:border-white/5 tap-press shadow-sm cursor-pointer hover:border-gLight-blue/40 dark:hover:border-gDark-blue/40 transition-all"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-base">{acc.icon}</span>
                <span className="text-[10px] font-bold" style={{ color: acc.color }}>
                  {acc.name}
                </span>
              </div>
              <div>
                <div className="font-extrabold text-sm text-gLight-textPrimary dark:text-gDark-textPrimary">
                  ৳ {acc.balance.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-gLight-textTertiary dark:text-gDark-textTertiary truncate">
                  {acc.note || acc.type.toUpperCase()}
                </div>
              </div>
            </div>
          ))}

          {/* Quick Add Account Card */}
          <div
            onClick={onOpenAddAccountModal}
            className="account-card shrink-0 bg-transparent rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 w-36 h-20 border-2 border-dashed border-gLight-outline/30 dark:border-gDark-outline/30 hover:border-gLight-blue dark:hover:border-gDark-blue text-gLight-textTertiary dark:text-gDark-textTertiary hover:text-gLight-blue dark:hover:text-gDark-blue tap-press cursor-pointer transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">add</span>
            </div>
            <span className="text-[11px] font-bold">+ Add Account</span>
          </div>
        </div>
      </section>

      {/* 2. HERO SPENDING PASS CARD */}
      <section className="rounded-3xl bg-gLight-surface dark:bg-gDark-surface p-6 flex flex-col shadow-sm transition-colors border border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gLight-textSecondary dark:text-gDark-textSecondary">
            Monthly Spending
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gLight-greenContainer dark:bg-gDark-greenContainer/40 text-gLight-green dark:text-gDark-green">
            ● Normal
          </span>
        </div>

        <div className="flex items-baseline gap-1 my-1">
          <span className="text-4xl font-extrabold tracking-tight text-gLight-textPrimary dark:text-gDark-textPrimary">
            ৳ {monthlyExpense.toLocaleString('en-IN')}
          </span>
          <span className="text-sm font-medium text-gLight-textTertiary dark:text-gDark-textTertiary ml-1.5">
            / ৳ {monthlyTarget.toLocaleString('en-IN')}
          </span>
        </div>

        <p className="text-xs text-gLight-textSecondary dark:text-gDark-textSecondary mb-4">
          Daily average: <strong>৳ {Math.round(monthlyExpense / 30).toLocaleString('en-IN')}</strong> • 13 days remaining in cycle
        </p>

        <div className="w-full bg-black/10 dark:bg-white/10 h-2.5 rounded-full overflow-hidden mb-3">
          <div
            className="bg-gLight-blue dark:bg-gDark-blue h-full rounded-full transition-all duration-700"
            style={{ width: `${spendPercent}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-black/5 dark:border-white/5">
          <div className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl p-3 flex flex-col">
            <span className="text-[11px] text-gLight-textTertiary dark:text-gDark-textTertiary">
              Daily safe budget
            </span>
            <span className="text-sm font-bold text-gLight-textPrimary dark:text-gDark-textPrimary mt-0.5">
              ৳ {Math.max(0, Math.round((monthlyTarget - monthlyExpense) / 13)).toLocaleString('en-IN')} /day
            </span>
          </div>
          <div className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl p-3 flex flex-col">
            <span className="text-[11px] text-gLight-textTertiary dark:text-gDark-textTertiary">
              Compared to Last Month
            </span>
            <span className="text-sm font-bold text-gLight-green dark:text-gDark-green mt-0.5 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
              12% less
            </span>
          </div>
        </div>
      </section>

      {/* 3. DHAR-DENA (LEND & BORROW / ধার-দেনা) TONAL CARD */}
      <section className="rounded-3xl bg-gLight-surface dark:bg-gDark-surface p-5 flex flex-col gap-3 shadow-sm border border-black/5 dark:border-white/5 transition-colors">
        <div className="flex items-center justify-between">
          <div
            onClick={onOpenDharView}
            className="flex items-center gap-2 cursor-pointer tap-press group"
          >
            <span className="material-symbols-outlined text-gLight-blue dark:text-gDark-blue text-[20px]">
              swap_horiz
            </span>
            <span className="font-bold text-sm text-gLight-textPrimary dark:text-gDark-textPrimary group-hover:text-gLight-blue">
              ধার-দেনা (Lend &amp; Borrow)
            </span>
            <span className="material-symbols-outlined text-[16px] text-gLight-textTertiary group-hover:text-gLight-blue">
              chevron_right
            </span>
          </div>
          <button
            onClick={onOpenDharView}
            className="text-xs font-semibold text-gLight-blue dark:text-gDark-blue bg-gLight-blueContainer dark:bg-gDark-blueContainer px-3 py-1 rounded-full tap-press flex items-center gap-0.5"
          >
            <span className="material-symbols-outlined text-[15px]">menu_book</span>
            <span>সম্পূর্ণ খাতা</span>
          </button>
        </div>

        {/* Split Summary: পাবো vs দেবো */}
        <div className="grid grid-cols-2 gap-2.5">
          <div
            onClick={onOpenDharView}
            className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl p-3.5 flex flex-col border border-emerald-500/10 cursor-pointer tap-press"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-gLight-green dark:text-gDark-green">
                আমি পাবো
              </span>
              <span className="material-symbols-outlined text-[16px] text-gLight-green dark:text-gDark-green">
                call_received
              </span>
            </div>
            <span className="text-lg font-extrabold text-gLight-green dark:text-gDark-green">
              ৳ {totalPabo.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-gLight-textTertiary dark:text-gDark-textTertiary mt-0.5">
              {dharItems.filter((d) => d.type === 'pabo' && d.status === 'pending').length} জনের কাছে পাই
            </span>
          </div>

          <div
            onClick={onOpenDharView}
            className="bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl p-3.5 flex flex-col border border-rose-500/10 cursor-pointer tap-press"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-rose-500 dark:text-gDark-red">
                আমি দেবো
              </span>
              <span className="material-symbols-outlined text-[16px] text-rose-500 dark:text-gDark-red">
                call_made
              </span>
            </div>
            <span className="text-lg font-extrabold text-rose-500 dark:text-gDark-red">
              ৳ {totalDebo.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-gLight-textTertiary dark:text-gDark-textTertiary mt-0.5">
              {dharItems.filter((d) => d.type === 'debo' && d.status === 'pending').length} জনের বাকি আছে
            </span>
          </div>
        </div>

        {/* Mini Ledger Items */}
        <div className="flex flex-col gap-2 pt-1">
          {pendingDharItems.length === 0 ? (
            <div
              onClick={onOpenDharView}
              className="bg-gLight-surfaceHigh/40 dark:bg-gDark-surfaceHigh/40 rounded-xl px-3.5 py-3 flex items-center justify-between text-xs cursor-pointer tap-press hover:bg-gLight-surfaceHigh/60 dark:hover:bg-gDark-surfaceHigh/60 transition-colors"
            >
              <div className="flex items-center gap-2 text-gLight-textTertiary dark:text-gDark-textTertiary">
                <span className="material-symbols-outlined text-[16px] text-emerald-500">verified</span>
                <span>কোনো বকেয়া বা ঋণ নেই (হিসাব পরিষ্কার)</span>
              </div>
              <span className="text-[11px] font-semibold text-gLight-blue dark:text-gDark-blue">
                + এন্ট্রি দিন
              </span>
            </div>
          ) : (
            pendingDharItems.map((item) => {
              const isPabo = item.type === 'pabo';
              return (
                <div
                  key={item.id}
                  className="bg-gLight-surfaceHigh/60 dark:bg-gDark-surfaceHigh/60 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isPabo ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <span className="font-semibold text-gLight-textPrimary dark:text-gDark-textPrimary truncate">
                      {item.person}
                    </span>
                    <span className="text-[10px] text-gLight-textTertiary dark:text-gDark-textTertiary truncate">
                      • {item.note || 'ধার'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-bold ${isPabo ? 'text-gLight-green dark:text-gDark-green' : 'text-rose-400'}`}>
                      ৳ {item.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => onOpenSettleModal(item)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full tap-press ${
                        isPabo
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25'
                      }`}
                    >
                      {isPabo ? 'পেয়েছি' : 'পরিশোধ'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 4. CATEGORY CHIPS */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold text-gLight-textSecondary dark:text-gDark-textSecondary px-1">
          <span>Categories</span>
          <span className="text-gLight-blue dark:text-gDark-blue font-medium">
            {selectedCategory === 'all' ? 'All items' : `Filtered: ${selectedCategory}`}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-5 px-5">
          <button
            onClick={() => onSelectCategory('all')}
            className={`cat-pill shrink-0 font-semibold text-xs px-4 py-2 rounded-full tap-press transition-all ${
              selectedCategory === 'all'
                ? 'bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-onBlueContainer dark:text-gDark-onBlueContainer'
                : 'bg-gLight-surface dark:bg-gDark-surface text-gLight-textPrimary dark:text-gDark-textPrimary hover:bg-gLight-surfaceHigh dark:hover:bg-gDark-surfaceHigh'
            }`}
          >
            All (৳ {(monthlyExpense / 1000).toFixed(1)}k)
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name.toLowerCase() || selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.name.toLowerCase())}
                className={`cat-pill shrink-0 font-medium text-xs px-4 py-2 rounded-full tap-press flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-onBlueContainer dark:text-gDark-onBlueContainer font-semibold'
                    : 'bg-gLight-surface dark:bg-gDark-surface text-gLight-textPrimary dark:text-gDark-textPrimary hover:bg-gLight-surfaceHigh dark:hover:bg-gDark-surfaceHigh'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name.split('&')[0].trim()}</span>
              </button>
            );
          })}

          <button
            onClick={onOpenAddCategoryModal}
            className="shrink-0 bg-transparent border border-dashed border-gLight-outline/40 dark:border-gDark-outline/40 text-gLight-textSecondary dark:text-gDark-textSecondary hover:text-gLight-blue dark:hover:text-gDark-blue font-medium text-xs px-3.5 py-1.5 rounded-full tap-press flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            <span>Add Category</span>
          </button>
        </div>
      </section>

      {/* 5. RECENT TRANSACTIONS */}
      <section className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between text-xs text-gLight-textSecondary dark:text-gDark-textSecondary font-semibold px-1">
          <div className="flex items-center gap-1.5">
            <span>Recent Activity</span>
            <span className="text-gLight-textTertiary dark:text-gDark-textTertiary">
              • {filteredTransactions.length} items • <span>Today: ৳ {todayExpense.toLocaleString('en-IN')}</span>
            </span>
          </div>
          <button
            onClick={onOpenManualEntryModal}
            className="text-xs text-gLight-blue dark:text-gDark-blue font-bold flex items-center gap-1 hover:underline tap-press py-0.5 px-2 rounded-full bg-gLight-blueContainer/50 dark:bg-gDark-blueContainer/50 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">edit_note</span>
            <span>+ Manual Entry</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {filteredTransactions.length === 0 ? (
            <div className="py-8 px-4 rounded-3xl bg-gLight-surface dark:bg-gDark-surface border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center gap-3 animate-in fade-in duration-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-gLight-blueContainer/40 dark:bg-gDark-blueContainer/40 text-gLight-blue dark:text-gDark-blue flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">receipt_long</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-gLight-textPrimary dark:text-gDark-textPrimary">
                  কোনো লেনদেন যুক্ত করা হয়নি
                </h4>
                <p className="text-xs text-gLight-textTertiary dark:text-gDark-textTertiary mt-1 max-w-xs leading-relaxed">
                  আপনার দৈনিক আয়, বাজার ও খরচের হিসাব রাখতে নিচের যেকোনো একটি উপায়ে শুরু করুন:
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  onClick={onOpenManualEntryModal}
                  className="bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg text-xs font-bold px-3.5 py-2 rounded-full tap-press shadow-sm flex items-center gap-1.5 hover:opacity-95"
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  <span>+ প্রথম খরচ লিখুন</span>
                </button>
                <button
                  onClick={onOpenWalletsView}
                  className="bg-black/5 dark:bg-white/10 text-gLight-textPrimary dark:text-gDark-textPrimary text-xs font-semibold px-3.5 py-2 rounded-full tap-press flex items-center gap-1.5 hover:bg-black/10 dark:hover:bg-white/15"
                >
                  <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                  <span>ব্যালেন্স সেট করুন</span>
                </button>
              </div>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';
              const displayDate = tx.date ? formatDisplayDate(tx.date) : 'আজ';

              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransactionToEdit(tx)}
                  title="Click to edit or delete transaction"
                  className="tx-item bg-gLight-surface dark:bg-gDark-surface hover:bg-gLight-surfaceHigh dark:hover:bg-gDark-surfaceHigh rounded-2xl p-4 flex items-center justify-between tap-press cursor-pointer transition-colors border border-black/5 dark:border-white/5"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    <div className="w-11 h-11 rounded-2xl bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh flex items-center justify-center text-xl shrink-0">
                      {tx.icon || '💳'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm text-gLight-textPrimary dark:text-gDark-textPrimary truncate">
                        {tx.note}
                      </span>
                      <span className="text-xs text-gLight-textTertiary dark:text-gDark-textTertiary truncate">
                        {tx.location ? `${tx.location} • ` : ''}
                        {displayDate} {tx.time ? `• ${tx.time}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`font-bold text-base ${
                        isIncome
                          ? 'text-gLight-green dark:text-gDark-green'
                          : isTransfer
                          ? 'text-gLight-blue dark:text-gDark-blue'
                          : 'text-gLight-textPrimary dark:text-gDark-textPrimary'
                      }`}
                    >
                      {isIncome ? '+ ৳ ' : isTransfer ? '➔ ৳ ' : '- ৳ '}
                      {tx.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-gLight-textTertiary opacity-0 hover:opacity-100">
                      edit
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
