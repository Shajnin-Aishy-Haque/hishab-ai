import Dexie, { type Table } from 'dexie';
import type { Transaction, Account, Category, DharItem, AppSettings, UserProfile } from '../types';
import { getLocalDateString } from '../utils/dateUtils';

export class HishabDatabase extends Dexie {
  transactions!: Table<Transaction, number>;
  accounts!: Table<Account, string>;
  categories!: Table<Category, string>;
  dharItems!: Table<DharItem, number>;
  settings!: Table<AppSettings, string>;
  users!: Table<UserProfile, string>;

  constructor() {
    super('HishabAI_DB_v2');
    this.version(1).stores({
      transactions: '++id, userId, type, amount, categoryId, accountId, date, timestamp',
      accounts: 'id, userId, name, type, balance',
      categories: 'id, userId, name, budget',
      dharItems: '++id, userId, person, amount, type, status, timestamp',
      settings: 'id, userId',
      users: 'id, email'
    });
  }
}

export const db = new HishabDatabase();

export const DEFAULT_USER: UserProfile = {
  id: 'user_nafis',
  name: 'Nafis Walid',
  email: 'nafiswalid.work@gmail.com',
  avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocLwn2LYA4adPbJ1gPWsfXCNQcmMz7wyjyIgbEcwbHZJAzaO_Q=s96-c',
  initial: 'N'
};

/**
 * Standard Starter Categories for Bangladesh Personal Finance
 */
export const STARTER_CATEGORIES = [
  {
    name: 'Bazaar & Groceries',
    icon: '🛒',
    color: '#1a73e8',
    keywords: [
      'bazaar', 'bazar', 'kachabazar', 'shobji', 'macher', 'mach', 'murgi',
      'alu', 'piyaj', 'chal', 'tel', 'dim', 'groceries', 'বাজার', 'সবজি',
      'মুরগি', 'মাছ', 'চাল', 'ডাল', 'তেল', 'ডিম', 'আলু', 'পেঁয়াজ'
    ]
  },
  {
    name: 'Transport & Fare',
    icon: '🛺',
    color: '#f9ab00',
    keywords: [
      'rickshaw', 'riksha', 'cng', 'bus', 'uber', 'pathao', 'metro',
      'petrol', 'fuel', 'fare', 'vara', 'রিকশা', 'বাস', 'সিএনজি', 'উবার',
      'পাঠাও', 'ভাড়া', 'মেট্রো'
    ]
  },
  {
    name: 'Food & Dining',
    icon: '🍔',
    color: '#1e8e3e',
    keywords: [
      'food', 'lunch', 'dinner', 'breakfast', 'cha', 'coffee', 'nasta',
      'burger', 'pizza', 'restaurant', 'biryani', 'খাবার', 'লাঞ্চ', 'চা',
      'নাস্তা', 'বিরিয়ানি'
    ]
  },
  {
    name: 'Bills & Utility',
    icon: '⚡',
    color: '#a142f4',
    keywords: [
      'bill', 'current', 'electricity', 'gas', 'water', 'internet',
      'wifi', 'recharge', 'desco', 'titas', 'বিল', 'বিদ্যুৎ', 'গ্যাস',
      'পানি', 'ইন্টারনেট', 'রিচার্জ'
    ]
  },
  {
    name: 'Medical & Health',
    icon: '💊',
    color: '#d93025',
    keywords: ['medicine', 'osudh', 'doctor', 'hospital', 'pharmacy', 'test', 'ঔষধ', 'ওষুধ', 'ডাক্তার', 'ফার্মেসি']
  },
  {
    name: 'Shopping & Clothes',
    icon: '🛍️',
    color: '#e91e63',
    keywords: ['shopping', 'dress', 'shirt', 'pant', 'shoes', 'cloth', 'কেনাকাটা', 'পোশাক']
  },
  {
    name: 'Personal & Misc',
    icon: '✨',
    color: '#00bcd4',
    keywords: ['personal', 'gift', 'donation', 'onno', 'other', 'অন্যান্য']
  }
];

/**
 * Initialize workspace for a user.
 * Real Google users or new signups start completely from scratch (0 balance, 0 transactions, 0 dhar).
 */
export async function initializeUserData(userId: string = DEFAULT_USER.id, isFromScratch = true) {
  // All active accounts start from scratch with 0 balance, 0 transactions, 0 dhar
  const isScratchUser = isFromScratch || userId !== 'user_demo_sample';

  const accountsCount = await db.accounts.where('userId').equals(userId).count();
  if (accountsCount === 0) {
    await db.accounts.bulkAdd([
      {
        id: `cash_${userId}`,
        userId,
        name: 'Cash',
        type: 'cash',
        balance: isScratchUser ? 0 : 5200,
        note: 'পকেট ক্যাশ',
        icon: '💵',
        color: '#137333'
      },
      {
        id: `bkash_${userId}`,
        userId,
        name: 'bKash',
        type: 'bkash',
        balance: isScratchUser ? 0 : 8400,
        note: 'Personal Wallet',
        icon: '📱',
        color: '#e91e63'
      },
      {
        id: `nagad_${userId}`,
        userId,
        name: 'Nagad',
        type: 'nagad',
        balance: isScratchUser ? 0 : 2300,
        note: 'Personal Wallet',
        icon: '🟧',
        color: '#f57c00'
      },
      {
        id: `bank_${userId}`,
        userId,
        name: 'City Bank',
        type: 'bank',
        balance: isScratchUser ? 0 : 35000,
        note: 'Primary Bank A/C',
        icon: '🏦',
        color: '#1a73e8'
      }
    ]);
  }

  const categoriesCount = await db.categories.where('userId').equals(userId).count();
  if (categoriesCount === 0) {
    await db.categories.bulkAdd(
      STARTER_CATEGORIES.map((cat, idx) => ({
        id: `cat_${idx}_${userId}`,
        userId,
        name: cat.name,
        icon: cat.icon,
        budget: isScratchUser ? 0 : (idx === 0 ? 15000 : idx === 1 ? 4000 : 6000),
        color: cat.color,
        keywords: cat.keywords
      }))
    );
  }

  // Transactions & Dhar are ONLY added for the demo account 'user_default'
  if (!isScratchUser) {
    const dharCount = await db.dharItems.where('userId').equals(userId).count();
    if (dharCount === 0) {
      const today = getLocalDateString();
      await db.dharItems.bulkAdd([
        {
          userId,
          person: 'সাকিব (Sakib)',
          amount: 1500,
          originalAmount: 1500,
          type: 'pabo',
          note: 'লাঞ্চের ধার',
          date: today,
          timestamp: Date.now() - 86400000 * 2,
          status: 'pending'
        },
        {
          userId,
          person: 'মদিনা স্টোর (দোকান বাকি)',
          amount: 800,
          originalAmount: 800,
          type: 'debo',
          note: 'ডিম ও তেল',
          date: today,
          timestamp: Date.now() - 86400000,
          status: 'pending'
        }
      ]);
    }

    const txCount = await db.transactions.where('userId').equals(userId).count();
    if (txCount === 0) {
      const today = getLocalDateString();
      await db.transactions.bulkAdd([
        {
          userId,
          type: 'expense',
          amount: 350,
          note: 'Murgi & Shobji',
          location: 'Kawran Bazar',
          categoryId: `cat_0_${userId}`,
          accountId: `cash_${userId}`,
          date: today,
          time: '11:30 AM',
          timestamp: Date.now() - 3600000 * 4,
          icon: '🥦'
        },
        {
          userId,
          type: 'expense',
          amount: 40,
          note: 'Rickshaw to Office',
          location: 'Dhanmondi',
          categoryId: `cat_1_${userId}`,
          accountId: `cash_${userId}`,
          date: today,
          time: '09:15 AM',
          timestamp: Date.now() - 3600000 * 6,
          icon: '🛺'
        },
        {
          userId,
          type: 'expense',
          amount: 25,
          note: 'Chaa & Biscuit',
          location: 'Tong er dokan',
          categoryId: `cat_2_${userId}`,
          accountId: `cash_${userId}`,
          date: today,
          time: '04:45 PM',
          timestamp: Date.now() - 3600000 * 2,
          icon: '☕'
        }
      ]);
    }
  }
}

/**
 * Reset a user's database back to 100% scratch
 */
export async function resetUserDataToScratch(userId: string) {
  await db.transaction('rw', [db.transactions, db.dharItems, db.accounts], async () => {
    await db.transactions.where('userId').equals(userId).delete();
    await db.dharItems.where('userId').equals(userId).delete();
    const accounts = await db.accounts.where('userId').equals(userId).toArray();
    for (const acc of accounts) {
      await db.accounts.update(acc.id, { balance: 0 });
    }
  });
}

/**
 * Update initial starter balances during user onboarding
 */
export async function updateStartingBalances(
  userId: string,
  balances: { cash: number; bkash: number; nagad: number; bank: number }
) {
  const accounts = await db.accounts.where('userId').equals(userId).toArray();
  for (const acc of accounts) {
    if (acc.type === 'cash') {
      await db.accounts.update(acc.id, { balance: balances.cash });
    } else if (acc.type === 'bkash') {
      await db.accounts.update(acc.id, { balance: balances.bkash });
    } else if (acc.type === 'nagad') {
      await db.accounts.update(acc.id, { balance: balances.nagad });
    } else if (acc.type === 'bank') {
      await db.accounts.update(acc.id, { balance: balances.bank });
    }
  }
}
