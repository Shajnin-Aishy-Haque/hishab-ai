import React, { useState, useEffect } from 'react';
import { getFinancialAdvice, type AdvisorResponse } from '../services/aiAdvisor';

interface AIAdvisorModalProps {
  isOpen: boolean;
  totalBudget: number;
  totalSpent: number;
  onClose: () => void;
  initialQuery?: string;
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({
  isOpen,
  totalBudget,
  totalSpent,
  onClose,
  initialQuery = 'আমি কি এই মাসে ৩,০০০ টাকার জুতো কিনতে পারবো?'
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [currentQuestion, setCurrentQuestion] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<AdvisorResponse | null>(null);

  // Dynamic calendar days calculation
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();
  const remainingDays = Math.max(1, daysInMonth - currentDay);
  const remaining = Math.max(0, totalBudget - totalSpent);
  const currentDailySafe = Math.round(remaining / remainingDays);

  const context = {
    totalBudget,
    totalSpent,
    remaining,
    remainingDays,
    currentDailySafe
  };

  const handleFetchAdvice = async (q: string) => {
    setIsLoading(true);
    setCurrentQuestion(q);
    try {
      const res = await getFinancialAdvice(q, context);
      setAdvice(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleFetchAdvice(initialQuery);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    handleFetchAdvice(query.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-150">
      <div className="bg-gLight-surface dark:bg-gDark-surface rounded-t-3xl max-w-md w-full p-6 flex flex-col gap-4 max-h-[88vh] overflow-y-auto shadow-2xl border-t border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#4285F4]/15 flex items-center justify-center text-[#4285F4]">
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-gLight-textPrimary dark:text-gDark-textPrimary">
                হিসাব এআই অ্যাডভাইজর
              </h3>
              <div className="text-[11px] text-gLight-textTertiary dark:text-gDark-textTertiary">
                Gemini 2.0 Flash + Intelligent Financial Engine
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

        {/* Suggested Quick Questions */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => {
              setQuery('আমি কি এই মাসে ৩,০০০ টাকার জুতো কিনতে পারবো?');
              handleFetchAdvice('আমি কি এই মাসে ৩,০০০ টাকার জুতো কিনতে পারবো?');
            }}
            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh border-black/5 dark:border-white/10 tap-press hover:border-gLight-blue"
          >
            👟 ৩,০০০ টাকার জুতো কিনবো?
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('আমি কি ৫,০০০ টাকা সেভিংস করতে পারবো?');
              handleFetchAdvice('আমি কি ৫,০০০ টাকা সেভিংস করতে পারবো?');
            }}
            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh border-black/5 dark:border-white/10 tap-press hover:border-gLight-blue"
          >
            💰 ৫,০০০ টাকা সেভিংস সম্ভব?
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('বাজারে কেন এত বেশি খরচ হলো?');
              handleFetchAdvice('বাজারে কেন এত বেশি খরচ হলো?');
            }}
            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh border-black/5 dark:border-white/10 tap-press hover:border-gLight-blue"
          >
            🥦 বাজারের খরচ কমানোর উপায়?
          </button>
        </div>

        {/* Conversation Bubbles */}
        <div className="flex flex-col gap-3 pt-1">
          {/* Question Bubble */}
          <div className="self-end bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] text-xs font-semibold shadow-xs">
            {currentQuestion}
          </div>

          {/* AI Answer Bubble */}
          <div className="self-start bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh text-gLight-textPrimary dark:text-gDark-textPrimary rounded-2xl rounded-tl-sm p-4 w-full text-xs flex flex-col gap-2.5 shadow-sm border border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between text-[#4285F4] font-bold text-[11px]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">insights</span>
                <span>বাজেট অ্যানালাইসিস</span>
              </span>
              <span className="text-[10px] text-gLight-textTertiary dark:text-gDark-textTertiary font-normal">
                বাকি {remainingDays} দিন
              </span>
            </div>

            {isLoading ? (
              <div className="py-6 flex items-center justify-center gap-2 text-gLight-textTertiary">
                <span className="w-4 h-4 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin"></span>
                <span>হিসাব বিশ্লেষণ হচ্ছে...</span>
              </div>
            ) : advice ? (
              <>
                {/* Financial Allowance Snapshot */}
                <div className="bg-black/5 dark:bg-white/5 rounded-xl p-2.5 flex flex-col gap-1.5 border border-black/5 dark:border-white/10">
                  <div className="flex justify-between text-[11px]">
                    <span>দৈনিক নিরাপদ ব্যয়ের সীমা:</span>
                    <strong className="text-emerald-500 font-bold">
                      ৳ {currentDailySafe} /দিন
                    </strong>
                  </div>
                  {advice.purchaseAmount && advice.suggestedDailyAfter !== undefined && (
                    <div className="flex justify-between text-[11px]">
                      <span>৳ {advice.purchaseAmount.toLocaleString('en-IN')} খরচ করার পর:</span>
                      <strong className={advice.canAfford ? 'text-amber-400 font-bold' : 'text-red-500 font-bold'}>
                        ৳ {advice.suggestedDailyAfter} /দিন
                      </strong>
                    </div>
                  )}
                </div>

                <div className="whitespace-pre-line leading-relaxed text-gLight-textSecondary dark:text-gDark-textSecondary">
                  {advice.answer}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Custom Question Input Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1 border-t border-black/5 dark:border-white/10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="আপনার প্রশ্ন লিখুন (যেমন: আমি কি ২,০০০ টাকার ঘড়ি কিনতে পারবো?)"
            className="flex-1 bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh border border-black/10 dark:border-white/10 rounded-full px-4 py-2.5 text-xs text-gLight-textPrimary dark:text-gDark-textPrimary focus:outline-none focus:border-gLight-blue placeholder:text-gLight-textTertiary"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="w-9 h-9 rounded-full bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg flex items-center justify-center tap-press shadow-sm disabled:opacity-50 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
