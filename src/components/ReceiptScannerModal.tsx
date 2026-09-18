import React, { useState, useRef } from 'react';
import { scanReceiptWithGemini, type ScanReceiptResult } from '../services/geminiVision';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (result: ScanReceiptResult) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onShowToast
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanReceiptResult | null>({
    shopName: 'স্বপ্ন ক্যাশ মেমো (Shwapno Memo #৪২০৯)',
    totalAmount: 480,
    items: [
      { name: 'চিনিগুঁড়া পোলাও চাল (১ কেজি)', price: 140 },
      { name: 'সয়াবিন তেল (১ লিটার)', price: 185 },
      { name: 'ফার্মের লাল ডিম (১ ডজন)', price: 155 }
    ],
    suggestedCategory: 'bazaar',
    date: new Date().toISOString().split('T')[0]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      setIsScanning(true);
      try {
        const res = await scanReceiptWithGemini(dataUrl, file.type || 'image/jpeg');
        setScanResult(res);
        onShowToast('Gemini Vision মেমো বিশ্লেষণ সম্পন্ন করেছে!', 'check_circle');
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        onShowToast(`স্ক্যান ত্রুটি: ${errMsg}`, 'error');
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddAll = () => {
    if (scanResult) {
      onConfirm(scanResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-150">
      <div className="bg-gLight-surface dark:bg-gDark-surface rounded-t-3xl max-w-md w-full p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto shadow-2xl border-t border-black/10 dark:border-white/10">
        {/* Header (Matches Stitch lines 723-731) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gLight-blue dark:text-gDark-blue text-[24px]">
              document_scanner
            </span>
            <h3 className="text-base font-bold text-gLight-textPrimary dark:text-gDark-textPrimary">
              মেমো স্ক্যানার (Gemini Vision)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center tap-press"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Hidden Camera File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Photo Preview Card (Matches Stitch lines 734-745) */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative bg-gLight-surfaceHigh dark:bg-gDark-surfaceHigh rounded-2xl p-4 border border-dashed border-gLight-blue/40 dark:border-gDark-blue/40 flex flex-col items-center text-center gap-2 cursor-pointer tap-press hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          {imagePreview ? (
            <div className="relative w-full h-40 rounded-xl overflow-hidden mb-2 bg-black flex items-center justify-center">
              <img src={imagePreview} alt="Receipt" className="max-h-full max-w-full object-contain" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs font-bold">
                ছবি পরিবর্তন করতে ট্যাপ করুন
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-gLight-blueContainer dark:bg-gDark-blueContainer text-gLight-onBlueContainer dark:text-gDark-onBlueContainer flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">receipt_long</span>
            </div>
          )}

          <div>
            <div className="font-bold text-sm text-gLight-textPrimary dark:text-gDark-textPrimary">
              {scanResult?.shopName || 'ক্যাশ মেমোর ছবি তুলুন'}
            </div>
            <div className="text-xs text-gLight-green dark:text-gDark-green font-medium flex items-center justify-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              <span>
                {isScanning
                  ? 'Gemini Vision AI বিশ্লেষণ করছে...'
                  : `Gemini Vision Auto-Extracted ${scanResult?.items.length || 0}টি আইটেম`}
              </span>
            </div>
          </div>
        </div>

        {/* Extracted Items List (Matches Stitch lines 748-779) */}
        {scanResult && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gLight-textSecondary dark:text-gDark-textSecondary">
              শনাক্তকৃত আইটেমসমূহ
            </span>

            <div className="bg-gLight-surfaceHigh/70 dark:bg-gDark-surfaceHigh/70 rounded-2xl p-3 flex flex-col divide-y divide-black/5 dark:divide-white/5 text-xs">
              {scanResult.items.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>
                      {item.name.includes('চাল') ? '🍚' : item.name.includes('তেল') ? '🍾' : item.name.includes('ডিম') ? '🥚' : '🛒'}
                    </span>
                    <span className="font-semibold text-gLight-textPrimary dark:text-gDark-textPrimary">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-bold text-gLight-textPrimary dark:text-gDark-textPrimary">
                    ৳ {item.price}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-2 pt-1 font-bold text-sm">
              <span className="text-gLight-textSecondary dark:text-gDark-textSecondary">মোট ভাউচার অ্যামাউন্ট:</span>
              <span className="text-gLight-blue dark:text-gDark-blue text-base">
                ৳ {scanResult.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        {/* Add All Button (Matches Stitch lines 781-785) */}
        <button
          onClick={handleAddAll}
          disabled={isScanning}
          className="bg-gLight-blue dark:bg-gDark-blue text-white dark:text-gDark-bg font-bold text-sm py-3 rounded-full tap-press shadow-md flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>সবগুলো খরচে যোগ করুন (Add to Bazaar)</span>
        </button>
      </div>
    </div>
  );
};
