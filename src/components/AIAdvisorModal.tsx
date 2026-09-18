import React, { useState } from 'react';

interface AIAdvisorModalProps {
  isOpen: boolean;
  totalBudget: number;
  totalSpent: number;
  onClose: () => void;
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({
  isOpen,
  totalBudget,
  totalSpent,
  onClose
}) => {
  const [selectedQuery, setSelectedQuery] = useState('আমি কি এই মাসে ৩,০০০ টাকার জুতো কিনতে পারবো?');
  const [isShoeQuery, setIsShoeQuery] = useState(true);

  if (!isOpen) return null;

  const remaining = Math.max(0, totalBudget - totalSpent);
  const remainingDays = 13;
  const currentDailySafe = Math.round(remaining / remainingDays);
  const afterShoeDaily = Math.max(0, Math.round((remaining - 3000) / remainingDays));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-150">
      <div className="bg-gLight-surface dark:bg-gDark-surface rounded-t-3xl max-w-md w-full p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto shadow-2xl border-t border-black/10 dark:border-white/10">
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
                Powered by Gemini 2.0 Flash (Free)
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

        {/* Suggested Questions Pills (Matches Stitch lines 808-816) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => {
              setSelectedQuery('আমি কি এই মাসে ৩,০০০ টাকার জুতো কিনতে পারবো?');
              setIsShoeQuery(true);
            }}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border tap-press transition-colors ${
              isShoeQuery
                ? 'bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-onBlueContainer dark:text-gDark-onBlueContainer border-gLight-blue/40'
                : 'bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh border-black/5 dark:border-white/10'
            }`}
          >
            👟 আমি কি ৩,০০০ টাকার জুতো কিনতে পারবো?
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedQuery('বাজারে কেন এত বেশি খরচ হলো?');
              setIsShoeQuery(false);
            }}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border tap-press transition-colors ${
              !isShoeQuery
                ? 'bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-onBlueContainer dark:text-gDark-onBlueContainer border-gLight-blue/40'
                : 'bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh border-black/5 dark:border-white/10'
            }`}
          >
            🥦 বাজারে কেন এত বেশি খরচ হলো?
          </button>
        </div>

        {/* Conversation Bubbles (Matches Stitch lines 818-849) */}
        <div className="flex flex-col gap-3 pt-1">
          {/* Question Bubble */}
          <div className="self-end bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] text-xs font-semibold shadow-xs">
            {selectedQuery}
          </div>

          {/* AI Answer Bubble */}
          <div className="self-start bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh text-gLight-textPrimary dark:text-gDark-textPrimary rounded-2xl rounded-tl-sm p-4 max-w-[95%] text-xs flex flex-col gap-2 shadow-sm border border-black/5 dark:border-white/5">
            <div className="flex items-center gap-1 text-[#4285F4] font-bold text-[11px]">
              <span className="material-symbols-outlined text-[15px]">insights</span>
              <span>বাজেট অ্যানালাইসিস</span>
            </div>

            {isShoeQuery ? (
              <>
                <p className="leading-relaxed">
                  আপনার মাসিক বাজেট <strong>৳ {totalBudget.toLocaleString('en-IN')}</strong>, যার মধ্যে অলরেডি খরচ হয়েছে{' '}
                  <strong>৳ {totalSpent.toLocaleString('en-IN')}</strong>। বাকি আছে{' '}
                  <strong>৳ {remaining.toLocaleString('en-IN')}</strong> (বাকি ১৩ দিন)।
                </p>
                <div className="bg-black/5 dark:bg-white/5 rounded-xl p-2.5 flex flex-col gap-1 border border-black/5 dark:border-white/10">
                  <div className="flex justify-between">
                    <span>বর্তমান দৈনিক নিরাপদ লিমিট:</span>
                    <strong className="text-gLight-green dark:text-gDark-green">
                      ৳ {currentDailySafe} /দিন
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>৩,০০০ টাকার জুতো কিনলে:</span>
                    <strong className="text-amber-400">৳ {afterShoeDaily} /দিন</strong>
                  </div>
                </div>
                <p className="leading-relaxed text-gLight-textSecondary dark:text-gDark-textSecondary">
                  💡 <strong>পরামর্শ:</strong> আপনি জুতোটা কিনতে পারবেন, তবে মাসের শেষ দিনগুলোতে কাঁচাবাজার ও বাইরে খাওয়া একটু নিয়ন্ত্রণে রাখতে হবে।
                </p>
              </>
            ) : (
              <>
                <p className="leading-relaxed">
                  আপনার কাঁচাবাজার ও গ্রোসারিতে এই মাসে নিয়মিত ব্যয়ের তুলনায় কিছুটা বাড়তি খরচ দেখা যাচ্ছে।
                </p>
                <p className="leading-relaxed text-gLight-textSecondary dark:text-gDark-textSecondary">
                  💡 <strong>পরামর্শ:</strong> মুরগি ও মাসের বড় বাজারগুলো একবারে হোলসেল বা সুপার শপের ছাড় দেখে কিনলে মাসে প্রায় ১২-১৫% সাশ্রয় করা সম্ভব।
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
