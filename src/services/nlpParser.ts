export interface ParsedExpense {
  amount: number;
  note: string;
  categoryId: string;
  accountId: string;
  type: 'expense' | 'income' | 'dhar';
  dharType?: 'pabo' | 'debo';
  dharPerson?: string;
  rawText: string;
  confidence: number;
}

export function normalizeBanglaDigits(input: string): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  let result = input;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(banglaDigits[i], 'g'), String(i));
  }
  return result;
}

export const CATEGORY_MAP: Record<string, string[]> = {
  bazaar: [
    'bazaar', 'bazar', 'kachabazar', 'shobji', 'macher', 'mach', 'murgi', 'alu', 'piyaj', 'chal', 'tel', 'dim', 'groceries', 'bajar', 'chowl', 'mangsgo', 'goshto', 'masala', 'noon', 'peyaj', 'ada', 'roshun', 'dal', 'grocery', 'shwapno', 'shopno', 'meenabazar', 'agora', 'unimart',
    'বাজার', 'কাঁচাবাজার', 'সবজি', 'মাছ', 'মুরগি', 'আলু', 'পেঁয়াজ', 'পেয়াজ', 'চাল', 'তেল', 'ডিম', 'ডাল', 'মাংস', 'গোশত', 'মুদি', 'রসুন', 'আদা', 'মসলা', 'স্বপ্ন', 'মীনা বাজার'
  ],
  food: [
    'food', 'lunch', 'dinner', 'breakfast', 'cha', 'tea', 'coffee', 'nasta', 'burger', 'pizza', 'restaurant', 'biryani', 'tehari', 'singara', 'khabar', 'khawa', 'kacchi', 'samucha', 'puri', 'fuchka', 'chotpoti', 'porota', 'dalbhat', 'shawarma', 'kfc', 'cafe',
    'খাবার', 'লাঞ্চ', 'ডিনার', 'চা', 'নাস্তা', 'বিরিয়ানি', 'বিরিয়ানি', 'কাচ্চি', 'তেহারি', 'সিঙ্গারা', 'কফি', 'ফুচকা', 'চটপটি', 'পরোটা', 'সমুচা', 'পুরি', 'রেস্টুরেন্ট'
  ],
  transport: [
    'rickshaw', 'riksha', 'cng', 'bus', 'uber', 'pathao', 'metro', 'petrol', 'octane', 'fuel', 'fare', 'vara', 'gari', 'bhara', 'indrive', 'train', 'rail', 'launch',
    'রিকশা', 'রিকষা', 'বাস', 'সিএনজি', 'উবার', 'পাঠাও', 'ভাড়া', 'গাড়ি', 'মেট্রো', 'মেট্রোরেল', 'ট্রেন', 'ভাড়া দিলাম', 'যাতায়াত'
  ],
  bills: [
    'bill', 'current', 'electricity', 'gas', 'water', 'internet', 'wifi', 'recharge', 'desco', 'dpdc', 'nesco', 'wasa', 'titas', 'net', 'flexi', 'flexiload', 'carnival', 'link3',
    'বিল', 'বিদ্যুৎ', 'কারেন্ট', 'গ্যাস', 'পানি', 'ইন্টারনেট', 'রিচার্জ', 'ফ্লেক্সিলোড', 'ওয়াইফাই', 'ওয়াসা', 'ডেসকো'
  ],
  medical: [
    'medicine', 'osudh', 'doctor', 'hospital', 'pharmacy', 'test', 'clinic', 'tablet', 'syrup', 'labaid', 'square', 'ibn sina', 'prescription', 'pharma',
    'ঔষধ', 'ওষুধ', 'ডাক্তার', 'ফার্মেসি', 'হাসপাতাল', 'মেডিকেল', 'টেস্ট', 'প্রেসক্রিপশন', 'সিরাপ'
  ],
  shopping: [
    'shopping', 'dress', 'shirt', 'pant', 'shoes', 'daraz', 'cloth', 'kapod', 'jama', 'panjabi', 'sharee', 'aarong', 'apex', 'bata', 'watch', 'bag',
    'শপিং', 'জামা', 'কাপড়', 'জুতা', 'পাঞ্জাবি', 'শাড়ি', 'আড়ং', 'পোশাক', 'ঘড়ি'
  ]
};

export function parseTransactionalSMS(rawInput: string): ParsedExpense | null {
  const normalized = normalizeBanglaDigits(rawInput.trim());
  const lower = normalized.toLowerCase();

  // Check if text looks like a banking/MFS SMS
  const isSMS =
    /(?:trxid|txnid|transaction id|cash in|cash out|send money|payment tk|received tk|debited for|credited for|card.*charged)/i.test(
      lower
    );

  if (!isSMS) return null;

  // 1. Detect Account
  let accountId = 'bkash';
  if (/nagad|নগদ|txnid/i.test(lower)) accountId = 'nagad';
  else if (/acct|card|bank|ebl|brac|city|scb|ব্যাংক|কার্ড/i.test(lower)) accountId = 'bank';
  else if (/bkash|বিকাশ|trxid/i.test(lower)) accountId = 'bkash';

  // 2. Detect Type (Income vs Expense)
  let type: 'income' | 'expense' = 'expense';
  if (/received tk|cash in of|credited for|deposit/i.test(lower)) {
    type = 'income';
  }

  // 3. Extract exact transaction amount (avoid fee or remaining balance)
  let amount = 0;
  const amountMatch = normalized.match(
    /(?:payment|received|cash out|cash in|send money|recharge|debited for|credited for|charged)\s+(?:of\s+)?(?:tk\.?|bdt|৳)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
  );

  if (amountMatch) {
    const rawVal = amountMatch[1].replace(/,/g, '');
    const num = parseFloat(rawVal);
    if (!isNaN(num) && num > 0) amount = num;
  }

  if (amount <= 0) {
    const fallbackMatch = normalized.match(/(?:tk\.?|bdt|৳)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
    if (fallbackMatch) {
      const num = parseFloat(fallbackMatch[1].replace(/,/g, ''));
      if (!isNaN(num) && num > 0) amount = num;
    }
  }

  if (amount <= 0) return null;

  // 4. Extract counterparty or reference
  const brand = accountId === 'bkash' ? 'bKash' : accountId === 'nagad' ? 'Nagad' : 'Bank';
  let action = type === 'income' ? 'Received' : 'Payment';
  if (/cash out/i.test(lower)) action = 'Cash Out';
  else if (/send money/i.test(lower)) action = 'Send Money';
  else if (/recharge/i.test(lower)) action = 'Mobile Recharge';

  let note = `${brand} ${action}`;

  const recipientMatch = normalized.match(/(?:to|from)\s+([0-9A-Za-z\s]+?)(?:\s+successful|\s+ref|\.|\,)/i);
  if (recipientMatch) {
    const recipient = recipientMatch[1].trim();
    if (recipient.length > 2 && recipient.length < 30) {
      note += ` (${recipient})`;
    }
  }

  const refMatch = normalized.match(/ref\s+([A-Za-z0-9\s]+?)(?:\.|\,)/i);
  if (refMatch) {
    const ref = refMatch[1].trim();
    if (ref.length > 1 && ref.length < 20) {
      note += ` - ${ref}`;
    }
  }

  // 5. Category detection
  let categoryId = type === 'income' ? 'personal' : 'bazaar';
  if (/recharge|flexi/i.test(lower)) categoryId = 'bills';
  else if (/food|restaurant|dine|cafe/i.test(lower)) categoryId = 'food';
  else if (/uber|pathao/i.test(lower)) categoryId = 'transport';
  else if (/pharma|hospital|clinic/i.test(lower)) categoryId = 'medical';
  else if (/daraz|aarong|apex|bata/i.test(lower)) categoryId = 'shopping';

  return {
    amount,
    note,
    categoryId,
    accountId,
    type,
    rawText: rawInput,
    confidence: 0.98
  };
}

export function parseNaturalInput(rawInput: string): ParsedExpense {
  // Check if input is a transactional SMS first
  const smsResult = parseTransactionalSMS(rawInput);
  if (smsResult) return smsResult;

  const normalized = normalizeBanglaDigits(rawInput.trim());
  const lower = normalized.toLowerCase();

  // 1. Detect Dhar (Lend / Borrow) Intent
  const isDharPabo = /ধার দিলাম|পাবো|পাব|পাবে|owe me|lent|dhar dilam|dhar disi/i.test(lower);
  const isDharDebo = /ধার নিলাম|বাকি নিলাম|দেনা|ধার নিলাম|borrowed|owe|dhar nilam|baki nilam|baki/i.test(lower);

  let type: 'expense' | 'income' | 'dhar' = 'expense';
  let dharType: 'pabo' | 'debo' | undefined = undefined;
  let dharPerson: string | undefined = undefined;

  if (isDharPabo) {
    type = 'dhar';
    dharType = 'pabo';
  } else if (isDharDebo) {
    type = 'dhar';
    dharType = 'debo';
  } else {
    // 2. Detect Intent: Income vs Expense
    const isIncome =
      /income|salary|tuition|pelam|paisi|ashlo|credit|jama|bonus|profit|cashback|বেতন|টিউশনি|পেলাম|আই|ইনকাম|পাঠিয়েছে|বোনাস|লাভ|ক্যাশব্যাক|টাকা আসলো|টাকা পেয়েছি/i.test(
        lower
      );
    type = isIncome ? 'income' : 'expense';
  }

  // 3. Extract Amount
  let amount = 0;
  // Match digit sequences, optionally with currency prefix or suffix
  const amountMatches = [...normalized.matchAll(/(?:tk|taka|৳)?\s*(\d+(?:\.\d{1,2})?)\s*(?:tk|taka|takar|টাকা|টাকার|৳)?/gi)];
  for (const m of amountMatches) {
    const val = parseFloat(m[1]);
    if (!isNaN(val) && val > 0) {
      amount = val;
      break;
    }
  }

  // 4. Detect Account
  let accountId = 'cash';
  if (/bkash|বিকাশ/i.test(lower)) {
    accountId = 'bkash';
  } else if (/bank|card|ebl|brac|city|scb|ব্যাংক|কার্ড/i.test(lower)) {
    accountId = 'bank';
  } else if (/nagad|নগদ/i.test(lower)) {
    accountId = 'nagad';
  }

  // 5. Extract Category & Clean Note
  let categoryId = 'bazaar';
  let bestScore = 0;

  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        if (kw.length > bestScore) {
          bestScore = kw.length;
          categoryId = cat;
        }
      }
    }
  }

  // 6. Clean Note text
  let cleanNote = normalized
    .replace(/(?:takar|taka|tk|টাকার|টাকা|৳)/gi, '')
    .replace(/\b\d+(?:\.\d{1,2})?\b/g, '')
    .replace(/(?:bkash|bank|cash|nagad|বিকাশ|নগদ|ক্যাশ|কার্ড)/gi, '')
    .replace(/(?:আজকে|গতকাল|দিলাম|নিলাম|কিনলাম|খেলাম|খরচ|পেলুম|পেলাম|পেয়েছি|আসলো|দিসিলাম|দিসি|নিসি)/gi, '')
    .replace(/[•,।]/g, '')
    .trim();

  // If Dhar: Extract Person Name cleanly by stripping case markers (কে, রে, থেকে, এর)
  if (type === 'dhar') {
    let person = cleanNote
      .replace(/(?:ধার|বাকি)/gi, '')
      .replace(/(?:থেকে|হতে|কাছে|কাছ থেকে)/gi, '')
      .trim();

    // Strip common Bangla objective suffixes (-কে, -রে, -er, -ke, -re)
    person = person
      .replace(/(?:কে|রে)$/gi, '')
      .replace(/(?:ke|re|er)$/gi, '')
      .trim();

    dharPerson = person || (dharType === 'pabo' ? 'পরিচিত ব্যক্তি' : 'দোকানদার / ঋণদাতা');
    cleanNote = dharType === 'pabo' ? `${dharPerson}-কে ধার প্রদান` : `${dharPerson}-এর থেকে ঋণ/বাকি`;
  }

  if (!cleanNote || cleanNote.length < 2) {
    if (categoryId === 'transport') cleanNote = 'Rickshaw / Transport Fare';
    else if (categoryId === 'food') cleanNote = 'Food & Dining';
    else if (categoryId === 'bazaar') cleanNote = 'Bazaar & Groceries';
    else if (categoryId === 'bills') cleanNote = 'Utility Bill';
    else if (categoryId === 'medical') cleanNote = 'Medical & Pharmacy';
    else if (categoryId === 'shopping') cleanNote = 'Shopping & Clothes';
    else cleanNote = rawInput.trim();
  } else {
    cleanNote = cleanNote.charAt(0).toUpperCase() + cleanNote.slice(1);
  }

  return {
    amount,
    note: cleanNote,
    categoryId,
    accountId,
    type,
    dharType,
    dharPerson,
    rawText: rawInput,
    confidence: amount > 0 ? 0.95 : 0.3
  };
}
