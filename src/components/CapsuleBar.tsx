import React, { useState, useEffect, useRef } from 'react';
import { parseNaturalInput, type ParsedExpense } from '../services/nlpParser';
import { speechService } from '../services/speechRecognition';

interface CapsuleBarProps {
  onAddParsedExpense: (parsed: ParsedExpense) => void;
  onOpenManualModal: () => void;
  onOpenReceiptScanModal: () => void;
  onOpenAIAdvisorModal: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const CapsuleBar: React.FC<CapsuleBarProps> = ({
  onAddParsedExpense,
  onOpenManualModal,
  onOpenReceiptScanModal,
  onOpenAIAdvisorModal,
  onShowToast
}) => {
  const [inputVal, setInputVal] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [preview, setPreview] = useState<ParsedExpense | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputVal.trim().length >= 2) {
      const parsed = parseNaturalInput(inputVal);
      if (parsed.amount > 0) {
        setPreview(parsed);
      } else {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  }, [inputVal]);

  const submitCurrentInput = () => {
    const val = inputVal.trim();
    if (!val) return;

    if (val.includes('?') || val.toLowerCase().includes('parbo') || val.toLowerCase().includes('koto')) {
      onOpenAIAdvisorModal();
      setInputVal('');
      setPreview(null);
      return;
    }

    const parsed = parseNaturalInput(val);
    if (parsed.amount <= 0) {
      onShowToast('টাকার পরিমাণ উল্লেখ করুন (যেমন: ৩৫০ টাকার মুরগি)', 'warning');
      return;
    }

    onAddParsedExpense(parsed);
    setInputVal('');
    setPreview(null);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitCurrentInput();
    }
  };

  const toggleMic = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    if (!speechService.isSupported) {
      onShowToast('Voice recognition এই ব্রাউজারে সাপোর্ট করছে না। টাইপ করুন।', 'mic_off');
      return;
    }

    setIsListening(true);
    setInputVal('');
    onShowToast('শুনছি... বাংলায় বলুন: "৩৫০ টাকার মুরগি" বা "রিকশা ভাড়া ৬০"', 'mic');

    speechService.startListening(
      (transcript) => {
        setInputVal(transcript);
        const parsed = parseNaturalInput(transcript);
        if (parsed.amount > 0) {
          onAddParsedExpense(parsed);
          setInputVal('');
          setPreview(null);
          onShowToast(`যোগ হয়েছে: ${parsed.note} - ৳${parsed.amount}`, 'check_circle');
        }
      },
      (error) => {
        console.warn('Speech error:', error);
        setIsListening(false);
        onShowToast(`ভয়েস রিকগনিশন সমস্যা: ${error}`, 'mic_off');
      },
      () => {
        setIsListening(false);
      },
      'bn-BD'
    );
  };

  return (
    <div className="fixed bottom-20 sm:bottom-22 left-0 right-0 max-w-md mx-auto px-4 z-40 pointer-events-auto">
      {/* Live Parse Preview Floating Tag (Tap to submit immediately) */}
      {preview && (
        <div
          onClick={submitCurrentInput}
          className="mb-2 bg-gLight-surfaceHigh/95 dark:bg-gDark-surfaceHigh/95 backdrop-blur-md rounded-2xl px-3.5 py-2 text-xs flex items-center justify-between text-gLight-textPrimary dark:text-gDark-textPrimary shadow-lg border border-gLight-blue/40 dark:border-gDark-blue/40 animate-in fade-in slide-in-from-bottom-2 cursor-pointer tap-press group"
          title="ক্লিক করে যোগ করুন"
        >
          <div className="flex items-center gap-2 font-medium truncate pr-2">
            <span className="material-symbols-outlined text-[16px] text-gLight-blue dark:text-gDark-blue group-hover:scale-110 transition-transform">
              auto_awesome
            </span>
            <span className="font-bold truncate">{preview.note}</span>
            <span className="text-gLight-textTertiary">•</span>
            <span className="capitalize text-[10px] px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 shrink-0">
              {preview.categoryId}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-extrabold text-sm text-gLight-blue dark:text-gDark-blue">
              ৳ {preview.amount}
            </span>
            <span className="material-symbols-outlined text-[15px] text-gLight-blue dark:text-gDark-blue">
              arrow_forward
            </span>
          </div>
        </div>
      )}

      <div
        className={`bg-gLight-surfaceHigh/95 dark:bg-gDark-surfaceHigh/95 backdrop-blur-xl rounded-full p-1.5 sm:p-2 flex items-center justify-between shadow-xl border transition-all ${
          isListening
            ? 'border-red-500 ring-2 ring-red-500/30'
            : 'border-black/10 dark:border-white/15'
        }`}
      >
        {/* Gemini Sparkle Advice Trigger */}
        <button
          type="button"
          onClick={onOpenAIAdvisorModal}
          aria-label="Open AI Advisor"
          title="Ask AI Advisor"
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#4285F4] tap-press hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
        </button>

        {/* Natural Language Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? 'শুনছি... বলুন...'
              : "Ask advice or '350 murgi'..."
          }
          className="w-full bg-transparent border-0 text-gLight-textPrimary dark:text-gDark-textPrimary placeholder:text-gLight-textTertiary dark:placeholder:text-gDark-textTertiary text-xs sm:text-sm font-medium focus:outline-none px-2"
        />

        <div className="flex items-center gap-1 shrink-0">
          {/* If text is typed, show Send Action Button instead of Edit Note */}
          {inputVal.trim().length > 0 ? (
            <button
              type="button"
              onClick={submitCurrentInput}
              aria-label="Add expense"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white flex items-center justify-center font-bold tap-press shadow-md transition-all"
              title="যোগ করুন"
            >
              <span className="material-symbols-outlined text-[19px]">arrow_upward</span>
            </button>
          ) : (
            <>
              {/* Manual Entry Button */}
              <button
                type="button"
                onClick={onOpenManualModal}
                aria-label="Manual Expense Entry"
                title="ম্যানুয়াল হিসাব লিখুন"
                className="w-9 h-9 rounded-full bg-gLight-surface dark:bg-gDark-surface text-gLight-textPrimary dark:text-gDark-textPrimary flex items-center justify-center font-bold tap-press hover:bg-black/5 dark:hover:bg-white/10 transition-colors border border-black/5 dark:border-white/10"
              >
                <span className="material-symbols-outlined text-[19px]">edit_note</span>
              </button>

              {/* Camera Memo Scanner Button */}
              <button
                type="button"
                onClick={onOpenReceiptScanModal}
                aria-label="Scan Cash Memo"
                title="ক্যাশ মেমো স্ক্যান"
                className="w-9 h-9 rounded-full bg-gLight-surface dark:bg-gDark-surface text-gLight-textPrimary dark:text-gDark-textPrimary flex items-center justify-center font-bold tap-press hover:bg-black/5 dark:hover:bg-white/10 transition-colors border border-black/5 dark:border-white/10"
              >
                <span className="material-symbols-outlined text-[19px]">photo_camera</span>
              </button>

              {/* Voice Mic Button */}
              <button
                type="button"
                onClick={toggleMic}
                aria-label="Start Voice Logging"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold tap-press transition-all shadow-sm ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isListening ? 'graphic_eq' : 'mic'}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
