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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputVal.trim()) {
      const val = inputVal.trim();
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
    }
  };

  const toggleMic = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    if (!speechService.isSupported) {
      onShowToast('Voice speech not supported on this browser.', 'mic_off');
      return;
    }

    setIsListening(true);
    setInputVal('');
    onShowToast('শুনছি... বলুন "৩৫০ টাকার মুরগি" বা "রিকশা ভাড়া ৬০"', 'mic');

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
        onShowToast(`ভয়েস রিকগনিশনে সমস্যা: ${error}`, 'mic_off');
      },
      () => {
        setIsListening(false);
      },
      'bn-BD'
    );
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-5 z-40">
      {/* Live Parse Preview Floating Tag */}
      {preview && (
        <div className="mb-2 bg-gLight-surfaceHigh/95 dark:bg-gDark-surfaceHigh/95 backdrop-blur-md rounded-2xl px-4 py-2 text-xs flex items-center justify-between text-gLight-textPrimary dark:text-gDark-textPrimary shadow-lg border border-gLight-blue/30 dark:border-gDark-blue/30 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 font-medium truncate pr-2">
            <span className="material-symbols-outlined text-[16px] text-gLight-blue dark:text-gDark-blue">
              auto_awesome
            </span>
            <span className="font-bold">{preview.note}</span>
            <span className="text-gLight-textTertiary">•</span>
            <span className="capitalize text-[11px] px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10">
              {preview.categoryId}
            </span>
          </div>
          <span className="font-extrabold text-sm text-gLight-blue dark:text-gDark-blue shrink-0">
            ৳ {preview.amount}
          </span>
        </div>
      )}

      <div
        className={`bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh/95 backdrop-blur-xl rounded-full p-2 flex items-center justify-between shadow-lg border transition-all ${
          isListening
            ? 'border-red-500 ring-2 ring-red-500/30'
            : 'border-black/5 dark:border-white/10'
        }`}
      >
        {/* Gemini Sparkle Advice Trigger */}
        <button
          onClick={onOpenAIAdvisorModal}
          aria-label="Open AI Advisor"
          title="Ask AI Advisor"
          className="flex items-center pl-2 pr-1.5 text-[#4285F4] tap-press hover:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
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
              ? 'শুনছি... বাংলায় বলুন...'
              : "Ask advice or say '350 takar murgi'..."
          }
          className="w-full bg-transparent border-0 text-gLight-textPrimary dark:text-gDark-textPrimary placeholder:text-gLight-textTertiary dark:placeholder:text-gDark-textTertiary text-sm font-medium focus:outline-none px-1"
        />

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Manual Entry Button */}
          <button
            onClick={onOpenManualModal}
            aria-label="Manual Expense Entry"
            title="ম্যানুয়াল হিসাব লিখুন"
            className="w-10 h-10 rounded-full bg-gLight-surface dark:bg-gDark-surface text-gLight-textPrimary dark:text-gDark-textPrimary flex items-center justify-center font-bold tap-press hover:bg-gLight-surfaceHighest dark:hover:bg-gDark-surfaceHighest transition-colors border border-black/5 dark:border-white/10"
          >
            <span className="material-symbols-outlined text-[20px]">edit_note</span>
          </button>

          {/* Camera Memo Scanner Button */}
          <button
            onClick={onOpenReceiptScanModal}
            aria-label="Scan Cash Memo"
            title="ক্যাশ মেমোর ছবি স্ক্যান করুন"
            className="w-10 h-10 rounded-full bg-gLight-surface dark:bg-gDark-surface text-gLight-textPrimary dark:text-gDark-textPrimary flex items-center justify-center font-bold tap-press hover:bg-gLight-surfaceHighest dark:hover:bg-gDark-surfaceHighest transition-colors border border-black/5 dark:border-white/10"
          >
            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
          </button>

          {/* Voice Mic Button */}
          <button
            onClick={toggleMic}
            aria-label="Start Voice Logging"
            className={`w-11 h-11 rounded-full flex items-center justify-center font-bold tap-press transition-all shadow-sm ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isListening ? 'graphic_eq' : 'mic'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
