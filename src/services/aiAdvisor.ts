import { normalizeBanglaDigits } from './nlpParser';

export interface AdvisorContext {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  remainingDays: number;
  currentDailySafe: number;
}

export interface AdvisorResponse {
  answer: string;
  suggestedDailyAfter?: number;
  purchaseAmount?: number;
  canAfford?: boolean;
}

export async function getFinancialAdvice(
  query: string,
  context: AdvisorContext
): Promise<AdvisorResponse> {
  const normalizedQuery = normalizeBanglaDigits(query);
  const amountMatch = normalizedQuery.match(/(\d+(?:\.\d+)?)/);
  const purchaseAmount = amountMatch ? parseFloat(amountMatch[1]) : undefined;

  const key = localStorage.getItem('hishab_gemini_key')?.trim();

  // 1. Try Gemini 2.0 Flash if API key exists and device is online
  if (key && typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
      const prompt = `You are an empathetic, practical personal financial advisor for an individual in Bangladesh using the Hishab AI app.
Current financial situation:
- Total Monthly Budget: ৳ ${context.totalBudget}
- Total Spent So Far: ৳ ${context.totalSpent}
- Remaining Budget: ৳ ${context.remaining}
- Days Remaining in Month: ${context.remainingDays} days
- Current Safe Daily Spending Limit: ৳ ${context.currentDailySafe}/day

User asks: "${query}"

Instructions:
1. Respond in natural, polite, encouraging Bangla (Bengali script or Banglish matching the user).
2. Answer clearly whether they can afford it without putting their budget at risk.
3. Show the math: what their daily spending limit will become if they make this purchase.
4. Give 1 actionable cost-saving tip.
Keep response within 3-4 short paragraphs.`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const canAfford = purchaseAmount ? context.remaining >= purchaseAmount : true;
          const suggestedDailyAfter = purchaseAmount
            ? Math.max(0, Math.round((context.remaining - purchaseAmount) / context.remainingDays))
            : undefined;

          return {
            answer: text,
            purchaseAmount,
            canAfford,
            suggestedDailyAfter
          };
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to smart rule engine:', err);
    }
  }

  // 2. High-precision rule-based offline engine
  if (purchaseAmount && purchaseAmount > 0) {
    const canAfford = context.remaining >= purchaseAmount;
    const remainingAfter = context.remaining - purchaseAmount;
    const suggestedDailyAfter = Math.max(0, Math.round(remainingAfter / context.remainingDays));

    if (canAfford) {
      const impactPercent = Math.round((purchaseAmount / (context.remaining || 1)) * 100);
      let tip = 'মাসের বাকি দিনগুলোতে বাইরের খাবার বা অতিরিক্ত কেনাকাটায় কিছুটা সংযত থাকা ভালো হবে।';
      if (impactPercent > 50) {
        tip = 'এটি আপনার অবশিষ্ট বাজেটের অর্ধেকের বেশি খরচ করে ফেলবে। জরুরি না হলে মাসের শেষে কেনার কথা বিবেচনা করতে পারেন।';
      }

      return {
        answer: `আপনার বর্তমান মাসিক বাজেট ৳ ${context.totalBudget.toLocaleString('en-IN')}, যার মধ্যে খরচ হয়েছে ৳ ${context.totalSpent.toLocaleString('en-IN')} এবং অবশিষ্ট আছে ৳ ${context.remaining.toLocaleString('en-IN')} (বাকি ${context.remainingDays} দিন)।\n\nআপনি ৳ ${purchaseAmount.toLocaleString('en-IN')} খরচ করতে পারবেন। তবে এটি কিনলে আপনার দৈনিক নিরাপদ বাজেট ৳ ${context.currentDailySafe} থেকে কমে ৳ ${suggestedDailyAfter} হবে।\n\n💡 পরামর্শ: ${tip}`,
        purchaseAmount,
        canAfford: true,
        suggestedDailyAfter
      };
    } else {
      const deficit = purchaseAmount - context.remaining;
      return {
        answer: `সতর্কতা: আপনার অবশিষ্ট বাজেট মাত্র ৳ ${context.remaining.toLocaleString('en-IN')}, কিন্তু আপনার সম্ভাব্য খরচ ৳ ${purchaseAmount.toLocaleString('en-IN')}।\n\nএটি কিনলে আপনার বাজেট ৳ ${deficit.toLocaleString('en-IN')} ঘাটতিতে পড়বে (Over budget) এবং বাকি ${context.remainingDays} দিনের জন্য দৈনিক হাতখরচ শূন্য হয়ে যাবে।\n\n💡 পরামর্শ: এই খরচটি আগামী মাসের শুরুতে বেতন পাওয়ার পর করা বেশি নিরাপদ হবে।`,
        purchaseAmount,
        canAfford: false,
        suggestedDailyAfter: 0
      };
    }
  }

  // General budget advice
  return {
    answer: `আপনার মাসিক বাজেট ৳ ${context.totalBudget.toLocaleString('en-IN')}, যার মধ্যে খরচ হয়েছে ৳ ${context.totalSpent.toLocaleString('en-IN')}।\n\nমাসে এখনও ${context.remainingDays} দিন বাকি রয়েছে এবং আপনার দৈনিক নিরাপদ ব্যয়ের সীমা ৳ ${context.currentDailySafe} / দিন।\n\n💡 সাশ্রয়ী পরামর্শ: কাঁচাবাজার ও নিত্যপ্রয়োজনীয় জিনিস একবারে তালিকা করে কিনলে অপচয় কম হয়।`,
    canAfford: true
  };
}
