import React, { useState, useEffect, useRef } from 'react';
import { parseNaturalInput, type ParsedExpense } from '../services/nlpParser';
import { speechService } from '../services/speechRecognition';

interface QuickInputBarProps {
  onAddParsedExpense: (parsed: ParsedExpense) => void;
  onOpenReceiptScan: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const QuickInputBar: React.FC<QuickInputBarProps> = ({
  onAddParsedExpense,
  onOpenReceiptScan,
  onShowToast
}) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [preview, setPreview] = useState<ParsedExpense | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Live parse as user types
  useEffect(() => {
    if (text.trim().length >= 2) {
      const parsed = parseNaturalInput(text);
      if (parsed.amount > 0) {
        setPreview(parsed);
      } else {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    const parsed = parseNaturalInput(text);
    if (parsed.amount <= 0) {
      onShowToast('অনুগ্রহ করে টাকার পরিমাণ লিখুন (যেমন: Rickshaw 60)', 'warning');
      return;
    }

    onAddParsedExpense(parsed);
    setText('');
    setPreview(null);
  };

  const toggleVoice = () => {
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
    onShowToast('শুনছি... বাংলায় বলুন যেমন "৩৫০ টাকার মুরগি"', 'mic');

    speechService.startListening(
      (transcript) => {
        setText(transcript);
        const parsed = parseNaturalInput(transcript);
        if (parsed.amount > 0) {
          onAddParsedExpense(parsed);
          setText('');
          setPreview(null);
          onShowToast(`যোগ করা হয়েছে: ${parsed.note} - ৳${parsed.amount}`, 'check_circle');
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
    <div className="px-4 sm:px-6 py-2 sticky top-16 z-30 bg-gLight-bg/95 dark:bg-gDark-bg/95 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gLight-surface dark:bg-gDark-surface border transition-all ${
            isListening
              ? 'border-red-500 ring-2 ring-red-500/20'
              : 'border-black/10 dark:border-white/10 focus-within:border-gLight-blue dark:focus-within:border-gDark-blue shadow-sm'
          }`}
        >
          {/* Camera Scanner Icon */}
          <button
            type="button"
            onClick={onOpenReceiptScan}
            title="Scan Receipt Memo (Gemini Vision)"
            className="w-8 h-8 rounded-full flex items-center justify-center text-gLight-textSecondary dark:text-gDark-textSecondary hover:text-gLight-blue dark:hover:text-gDark-blue hover:bg-gLight-surfaceHigh dark:hover:bg-gDark-surfaceHigh tap-press transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[22px]">photo_camera</span>
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isListening ? 'Listening in Bangla/English...' : 'Say "Rickshaw 50" or "Bazaar 650"...'}
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-gLight-textPrimary dark:text-gDark-textPrimary placeholder:text-gLight-textTertiary dark:placeholder:text-gDark-textTertiary focus:outline-none"
          />

          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={toggleVoice}
            title={isListening ? 'Stop listening' : 'Voice input (Bangla/Banglish)'}
            className={`w-9 h-9 rounded-full flex items-center justify-center tap-press transition-all shrink-0 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-blue dark:text-gDark-blue hover:opacity-90'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isListening ? 'graphic_eq' : 'mic'}
            </span>
          </button>

          {/* Quick Submit Button */}
          {text.trim().length > 0 && (
            <button
              type="submit"
              className="w-9 h-9 rounded-full bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg flex items-center justify-center tap-press shadow-sm hover:opacity-90 shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
            </button>
          )}
        </div>

        {/* Live Parse Preview Badge */}
        {preview && (
          <div className="absolute left-3 right-3 -bottom-8 bg-gLight-blueContainer/90 dark:bg-gDark-blueContainer/90 backdrop-blur-md rounded-xl px-3 py-1 text-xs flex items-center justify-between text-gLight-onBlueContainer dark:text-gDark-onBlueContainer shadow-sm border border-gLight-blue/20 dark:border-gDark-blue/20 z-10 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center gap-1.5 font-medium truncate">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              <span>{preview.note}</span>
              <span>•</span>
              <span className="capitalize">{preview.categoryId}</span>
            </div>
            <span className="font-bold shrink-0">৳{preview.amount}</span>
          </div>
        )}
      </form>
    </div>
  );
};
