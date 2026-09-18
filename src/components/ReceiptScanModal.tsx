import React, { useState, useRef } from 'react';
import { scanReceiptWithGemini, type ScanReceiptResult } from '../services/geminiVision';

interface ReceiptScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExpense: (result: ScanReceiptResult) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const ReceiptScanModal: React.FC<ReceiptScanModalProps> = ({
  isOpen,
  onClose,
  onConfirmExpense,
  onShowToast
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanReceiptResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleStartScan = async () => {
    if (!imagePreview) return;
    setIsScanning(true);
    try {
      const result = await scanReceiptWithGemini(imagePreview, mimeType);
      setScanResult(result);
      onShowToast('মেমো সফলভাবে স্ক্যান হয়েছে!', 'check_circle');
    } catch (err: unknown) {
      console.error('Scan error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      onShowToast(`স্ক্যানে সমস্যা: ${errMsg}`, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirm = () => {
    if (!scanResult) return;
    onConfirmExpense(scanResult);
    onClose();
    setImagePreview(null);
    setScanResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-gLight-bg dark:bg-gDark-surface rounded-3xl p-6 shadow-xl border border-black/10 dark:border-white/10 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-gLight-blue dark:text-gDark-blue">
              receipt_long
            </span>
            <span className="font-bold text-lg text-gLight-textPrimary dark:text-gDark-textPrimary">
              Gemini Memo Scanner
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gLight-textSecondary dark:text-gDark-textSecondary hover:bg-black/5 dark:hover:bg-white/5 tap-press"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Upload / Camera Box */}
        <div className="mt-4 flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 rounded-2xl border-2 border-dashed border-black/20 dark:border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-gLight-blue dark:hover:border-gDark-blue transition-colors bg-black/5 dark:bg-white/5"
            >
              <div className="w-12 h-12 rounded-full bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-blue dark:text-gDark-blue flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[24px]">add_a_photo</span>
              </div>
              <span className="text-xs font-bold text-gLight-textPrimary dark:text-gDark-textPrimary">
                ক্যামেরা দিয়ে মেমোর ছবি তুলুন
              </span>
              <span className="text-[11px] text-gLight-textSecondary dark:text-gDark-textSecondary mt-0.5">
                বা গ্যালারি থেকে রসিদের ছবি আপলোড করুন
              </span>
            </div>
          ) : (
            <div className="w-full space-y-3">
              <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Receipt Preview"
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 px-3 py-1 bg-black/70 text-white rounded-xl text-xs font-semibold backdrop-blur-sm"
                >
                  Change Photo
                </button>
              </div>

              {!scanResult && (
                <button
                  disabled={isScanning}
                  onClick={handleStartScan}
                  className="w-full py-3 rounded-2xl bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg font-bold text-sm shadow-md tap-press flex items-center justify-center gap-2"
                >
                  {isScanning ? (
                    <>
                      <span className="material-symbols-outlined text-[20px] animate-spin">
                        progress_activity
                      </span>
                      <span>AI রসিদ বিশ্লেষণ করছে...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                      <span>Gemini Vision দিয়ে স্ক্যান করুন</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Scan Results Review */}
        {scanResult && (
          <div className="mt-5 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-gLight-green/30 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
              <div>
                <span className="text-xs font-bold text-gLight-textPrimary dark:text-gDark-textPrimary block">
                  {scanResult.shopName || 'Market Receipt'}
                </span>
                <span className="text-[11px] text-gLight-textSecondary dark:text-gDark-textSecondary capitalize">
                  Category: {scanResult.suggestedCategory}
                </span>
              </div>
              <span className="text-lg font-extrabold text-gLight-green dark:text-gDark-green">
                ৳{scanResult.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Item list */}
            {scanResult.items.length > 0 && (
              <div className="mt-2 space-y-1 max-h-36 overflow-y-auto">
                {scanResult.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                    <span className="text-gLight-textSecondary dark:text-gDark-textSecondary">
                      {item.name}
                    </span>
                    <span className="font-semibold text-gLight-textPrimary dark:text-gDark-textPrimary">
                      ৳{item.price}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleConfirm}
              className="mt-4 w-full py-3 rounded-xl bg-gLight-green text-white font-bold text-xs tap-press flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>খরচ হিসেবে যোগ করুন (-৳{scanResult.totalAmount})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
