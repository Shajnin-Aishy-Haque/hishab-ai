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

const CATEGORY_MAP: Record<string, string[]> = {
  bazaar: [
    'bazaar', 'bazar', 'kachabazar', 'shobji', 'macher', 'mach', 'murgi', 'alu', 'piyaj', 'chal', 'tel', 'dim', 'groceries', 'bajar', 'chowl', 'mangsgo', 'goshto',
    'বাজার', 'কাঁচাবাজার', 'সবজি', 'মাছ', 'মুরগি', 'আলু', 'পেঁয়াজ', 'পেয়াজ', 'চাল', 'তেল', 'ডিম', 'ডাল', 'মাংস', 'গোশত', 'মুদি'
  ],
  food: [
    'food', 'lunch', 'dinner', 'breakfast', 'cha', 'tea', 'coffee', 'nasta', 'burger', 'pizza', 'restaurant', 'biryani', 'tehari', 'singara', 'khabar', 'khawa',
    'খাবার', 'লাঞ্চ', 'ডিনার', 'চা', 'নাস্তা', 'বিরিয়ানি', 'তেহারি', 'সিঙ্গারা', 'কফি'
  ],
  transport: [
    'rickshaw', 'riksha', 'cng', 'bus', 'uber', 'pathao', 'metro', 'petrol', 'octane', 'fuel', 'fare', 'vara', 'gari', 'bhara',
    'রিকশা', 'রিকষা', 'বাস', 'সিএনজি', 'উবার', 'পাঠাও', 'ভাড়া', 'গাড়ি', 'মেট্রো', 'ভাড়া দিলাম'
  ],
  bills: [
    'bill', 'current', 'electricity', 'gas', 'water', 'internet', 'wifi', 'recharge', 'desco', 'titas', 'net', 'flexi',
    'বিল', 'বিদ্যুৎ', 'কারেন্ট', 'গ্যাস', 'পানি', 'ইন্টারনেট', 'রিচার্জ'
  ],
  medical: [
    'medicine', 'osudh', 'doctor', 'hospital', 'pharmacy', 'test', 'clinic', 'tablet', 'syrup',
    'ঔষধ', 'ওষুধ', 'ডাক্তার', 'ফার্মেসি', 'হাসপাতাল', 'মেডিকেল'
  ],
  shopping: [
    'shopping', 'dress', 'shirt', 'pant', 'shoes', 'daraz', 'cloth', 'kapod', 'jama',
    'শপিং', 'জামা', 'কাপড়', 'জুতা'
  ]
};

export function parseNaturalInput(rawInput: string): ParsedExpense {
  const normalized = normalizeBanglaDigits(rawInput.trim());
  const lower = normalized.toLowerCase();

  // 1. Detect Dhar (Lend / Borrow) Intent
  const isDharPabo = /ধার দিলাম|পাবো|পাব|পাবে|owe me|lent/i.test(lower);
  const isDharDebo = /ধার নিলাম|বাকি নিলাম|দেনা|ধার নিলাম|borrowed|owe/i.test(lower);

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
    const isIncome = /income|salary|tuition|pelam|paisi|ashlo|credit|jama|বেতন|টিউশনি|পেলাম|আই|ইনকাম|পাঠিয়েছে/i.test(lower);
    type = isIncome ? 'income' : 'expense';
  }

  // 3. Extract Amount
  let amount = 0;
  // Look for any digit sequence
  const amountMatch = normalized.match(/(?:tk|taka|৳)?\s*(\d+(?:\.\d{1,2})?)\s*(?:tk|taka|takar|টাকা|টাকার)?/i);
  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1]);
  }

  // 4. Detect Account
  let accountId = 'cash';
  if (/bkash|বিকাশ/i.test(lower)) {
    accountId = 'bkash';
  } else if (/bank|card|ebl|brac|city|ব্যাংক|কার্ড/i.test(lower)) {
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

  // 6. Clean Note text (remove numbers, filler words)
  let cleanNote = normalized
    .replace(/(?:takar|taka|tk|টাকার|টাকা)/gi, '')
    .replace(/\d+(?:\.\d{1,2})?/g, '')
    .replace(/(?:bkash|bank|cash|nagad|বিকাশ|নগদ|ক্যাশ)/gi, '')
    .replace(/(?:আজকে|গতকাল|দিলাম|নিলাম|কিনলাম|খেলাম|খরচ|পেলুম|পেলাম)/gi, '')
    .replace(/[•,।]/g, '')
    .trim();

  // If dhar person detection
  if (type === 'dhar') {
    dharPerson = cleanNote.replace(/(?:ধার|বাকি)/gi, '').trim() || 'পরিচিত ব্যক্তি';
  }

  if (!cleanNote || cleanNote.length < 2) {
    if (categoryId === 'transport') cleanNote = 'Rickshaw / Fare';
    else if (categoryId === 'food') cleanNote = 'Food & Dining';
    else if (categoryId === 'bazaar') cleanNote = 'Bazaar / Groceries';
    else if (categoryId === 'bills') cleanNote = 'Utility Bill';
    else if (categoryId === 'medical') cleanNote = 'Medical & Pharmacy';
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
