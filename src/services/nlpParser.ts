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

export function parseNaturalInput(rawInput: string): ParsedExpense {
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
