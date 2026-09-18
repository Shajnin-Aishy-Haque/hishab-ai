import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeUserData, DEFAULT_USER, resetUserDataToScratch, updateStartingBalances } from './db/db';
import type { Account, Category, DharItem, Transaction, UserProfile, TransactionType, DharType, DharPaymentLog } from './types';
import type { ParsedExpense } from './services/nlpParser';
import type { ScanReceiptResult } from './services/geminiVision';
import {
  getStoredAccessToken,
  getStoredGoogleClientId,
  requestRealGoogleOAuth,
  clearGoogleSession
} from './services/googleAuth';
import {
  uploadToGoogleDrive,
  findDriveBackupFile,
  downloadFromGoogleDrive
} from './services/googleDriveApi';
import { createDatabaseSnapshot, importBackupFile } from './services/driveSync';

import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { WalletsView } from './components/WalletsView';
import { DharKhataView } from './components/DharKhataView';
import { AnalyticsView } from './components/AnalyticsView';
import { CategoriesView } from './components/CategoriesView';
import { SettingsView } from './components/SettingsView';
import { CapsuleBar } from './components/CapsuleBar';
import { BottomNav, type MainTabType } from './components/BottomNav';
import { Toast } from './components/Toast';

// Modals
import { EditTransactionModal } from './components/EditTransactionModal';
import { ManualEntryModal } from './components/ManualEntryModal';
import { DharSettleModal } from './components/DharSettleModal';
import { NewDharModal } from './components/NewDharModal';
import { NewCategoryModal } from './components/NewCategoryModal';
import { NewAccountModal } from './components/NewAccountModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { AIAdvisorModal } from './components/AIAdvisorModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { WelcomeGate } from './components/WelcomeGate';

export function App() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('hishab_theme') as 'dark' | 'light') || 'dark';
  });

  // Login Gate State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('hishab_is_logged_in') === 'true';
  });

  // User Profile State (Per-user data)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('hishab_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return DEFAULT_USER;
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<MainTabType>('hishab');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal States
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settlingDharItem, setSettlingDharItem] = useState<DharItem | null>(null);
  const [isNewDharModalOpen, setIsNewDharModalOpen] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isAIAdvisorModalOpen, setIsAIAdvisorModalOpen] = useState(false);
  const [isGoogleAuthModalOpen, setIsGoogleAuthModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingUser, setOnboardingUser] = useState<UserProfile | null>(null);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  // Sync animation text
  const [syncText, setSyncText] = useState('Drive: Auto-Synced');

  // Toast feedback
  const [toastMsg, setToastMsg] = useState('');
  const [toastIcon, setToastIcon] = useState('check_circle');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string, icon: string = 'check_circle') => {
    setToastMsg(msg);
    setToastIcon(icon);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2600);
  };

  // Sync theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('hishab_theme', theme);
  }, [theme]);

  // Initialize DB for current user on boot or switch
  useEffect(() => {
    initializeUserData(currentUser.id).catch((err) => console.error('DB Init Error:', err));
    localStorage.setItem('hishab_active_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Reactive DB Queries scoped to currentUser.id
  const transactions =
    useLiveQuery(
      () => db.transactions.where('userId').equals(currentUser.id).reverse().sortBy('timestamp'),
      [currentUser.id]
    ) || [];

  const accounts =
    useLiveQuery(
      () => db.accounts.where('userId').equals(currentUser.id).toArray(),
      [currentUser.id]
    ) || [];

  const categories =
    useLiveQuery(
      () => db.categories.where('userId').equals(currentUser.id).toArray(),
      [currentUser.id]
    ) || [];

  const dharItems =
    useLiveQuery(
      () => db.dharItems.where('userId').equals(currentUser.id).reverse().sortBy('timestamp'),
      [currentUser.id]
    ) || [];

  const allUsers = useLiveQuery(() => db.users.toArray(), []) || [DEFAULT_USER];

  // Background Google Drive Auto-Sync Engine
  const backgroundSyncToDrive = async () => {
    const token = getStoredAccessToken();
    if (!token) return;
    try {
      setSyncText('Syncing to Drive...');
      const snapshot = await createDatabaseSnapshot(currentUser.id);
      await uploadToGoogleDrive(token, snapshot);
      setSyncText('Drive: Synced');
    } catch (err) {
      console.warn('Background drive sync notice:', err);
      setSyncText('Drive: Local');
    }
  };

  // Manual Trigger Google Drive Sync
  const handleTriggerSync = async () => {
    const token = getStoredAccessToken();
    if (!token) {
      setIsGoogleAuthModalOpen(true);
      showToast('Google Drive সিঙ্ক করতে 1-Click সাইন-ইন করুন', 'cloud');
      return;
    }

    setSyncText('Syncing to Drive...');
    try {
      const snapshot = await createDatabaseSnapshot(currentUser.id);
      await uploadToGoogleDrive(token, snapshot);
      setSyncText('Drive: Synced');
      showToast('Google Drive-এ ক্লাউড ব্যাকআপ সফলভাবে সিঙ্ক হয়েছে!', 'cloud_done');
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('expired')) {
        setIsGoogleAuthModalOpen(true);
        showToast('Google Drive সেশনের মেয়াদ শেষ! পুনরায় সাইন-ইন করুন।', 'error');
      } else {
        showToast('Google Drive সিঙ্ক করতে সমস্যা হয়েছে', 'error');
      }
      setSyncText('Drive: Error');
    }
  };
  // Debounced auto-sync when transactions or accounts mutate
  useEffect(() => {
    if (!isLoggedIn) return;
    const timer = setTimeout(() => {
      backgroundSyncToDrive();
    }, 1800);
    return () => clearTimeout(timer);
  }, [transactions.length, accounts, dharItems.length, isLoggedIn]);

  const handleGoogleSignIn = () => {
    const clientId = getStoredGoogleClientId();
    if (!clientId) {
      showToast('Google Client ID পাওয়া যায়নি।', 'error');
      return;
    }

    setIsGoogleSigningIn(true);
    requestRealGoogleOAuth(
      clientId,
      async (userInfo, accessToken) => {
        setIsGoogleSigningIn(false);
        try {
          const userProfile: UserProfile = {
            id: `google_${userInfo.sub}`,
            name: userInfo.name,
            email: userInfo.email,
            avatarUrl: userInfo.picture,
            initial: (userInfo.name || 'U').charAt(0).toUpperCase()
          };

          await db.users.put(userProfile);
          await initializeUserData(userProfile.id, true);

          let hasRestoredBackup = false;
          // Check if Google Drive has existing backup
          try {
            setSyncText('Checking Drive...');
            const existingFile = await findDriveBackupFile(accessToken);
            if (existingFile) {
              const backupData = await downloadFromGoogleDrive(accessToken, existingFile.id);
              const blob = new Blob([JSON.stringify(backupData)], { type: 'application/json' });
              const file = new File([blob], 'drive_backup.json');
              await importBackupFile(file, userProfile.id);
              hasRestoredBackup = true;
              showToast('Google Drive ব্যাকআপ রিস্টোর সম্পন্ন!', 'cloud_download');
            } else {
              const snapshot = await createDatabaseSnapshot(userProfile.id);
              await uploadToGoogleDrive(accessToken, snapshot);
              setSyncText('Drive: Synced');
            }
          } catch (driveErr) {
            console.warn('Drive initial sync notice:', driveErr);
          }

          setCurrentUser(userProfile);
          localStorage.setItem('hishab_active_user', JSON.stringify(userProfile));
          localStorage.setItem('hishab_is_logged_in', 'true');
          setIsLoggedIn(true);

          if (!hasRestoredBackup) {
            setOnboardingUser(userProfile);
            setIsOnboardingOpen(true);
            showToast(`স্বাগতম, ${userProfile.name}! ওয়ালেট ব্যালেন্স সেট করুন।`, 'person_add');
          } else {
            showToast(`স্বাগতম, ${userProfile.name}! হিসাব প্রস্তুত।`, 'cloud_done');
          }
        } catch (err: any) {
          showToast(`লগইন ব্যর্থ: ${err?.message || 'অজানা ত্রুটি'}`, 'error');
        }
      },
      (err: any) => {
        setIsGoogleSigningIn(false);
        if (err?.error === 'popup_closed_by_user') {
          showToast('সাইন-ইন উইন্ডো বন্ধ করা হয়েছে', 'info');
        } else {
          showToast(`Google Sign-In Error: ${err?.message || err}`, 'error');
        }
      }
    );
  };

  const handleEmailAuth = async (email: string, name?: string, isNewSignup = false) => {
    const cleanEmail = email.trim().toLowerCase();
    let formattedName = name?.trim();
    if (!formattedName) {
      formattedName = (cleanEmail.split('@')[0] || 'User')
        .replace(/[._-]/g, ' ')
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
    const userId = `user_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

    const existingUser = await db.users.get(userId);
    const userProfile: UserProfile = existingUser || {
      id: userId,
      name: formattedName,
      email: cleanEmail,
      initial: formattedName.charAt(0).toUpperCase()
    };

    await db.users.put(userProfile);
    await initializeUserData(userId, !existingUser);
    setCurrentUser(userProfile);
    localStorage.setItem('hishab_active_user', JSON.stringify(userProfile));
    localStorage.setItem('hishab_is_logged_in', 'true');
    setIsLoggedIn(true);

    if (isNewSignup || !existingUser) {
      setOnboardingUser(userProfile);
      setIsOnboardingOpen(true);
      showToast(`স্বাগতম, ${userProfile.name}! ওয়ালেট সাজিয়ে নিন।`, 'person_add');
    } else {
      showToast(`স্বাগতম, ${userProfile.name}!`, 'check_circle');
    }
  };

  const handleDeleteSavedUser = async (userId: string) => {
    await db.users.delete(userId);
    showToast('প্রোফাইল ডিভাইস থেকে সরানো হয়েছে', 'delete');
  };

  const handleSignOut = () => {
    clearGoogleSession();
    localStorage.removeItem('hishab_is_logged_in');
    setIsLoggedIn(false);
    showToast('লগআউট সম্পন্ন হয়েছে।', 'logout');
  };

  // Handlers for transactions
  const handleAddParsedExpense = async (parsed: ParsedExpense) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    if (parsed.type === 'dhar') {
      // Auto create Dhar Khata item
      await db.dharItems.add({
        userId: currentUser.id,
        person: parsed.dharPerson || 'পরিচিত ব্যক্তি',
        amount: parsed.amount,
        originalAmount: parsed.amount,
        type: (parsed.dharType as DharType) || 'pabo',
        note: parsed.note,
        date: dateStr,
        timestamp: Date.now(),
        status: 'pending'
      });
      showToast(`ধার খাতায় যোগ হয়েছে: ৳${parsed.amount} (${parsed.dharPerson})`, 'menu_book');
      return;
    }

    const targetAccount = accounts.find((a) => a.type === parsed.accountId || a.id.includes(parsed.accountId)) || accounts[0];
    const accId = targetAccount?.id || `cash_${currentUser.id}`;

    let icon = '💳';
    if (parsed.categoryId === 'bazaar') icon = '🥦';
    else if (parsed.categoryId === 'transport') icon = '🛺';
    else if (parsed.categoryId === 'food') icon = '☕';
    else if (parsed.categoryId === 'bills') icon = '⚡';
    else if (parsed.categoryId === 'medical') icon = '💊';

    await db.transaction('rw', [db.transactions, db.accounts], async () => {
      await db.transactions.add({
        userId: currentUser.id,
        type: parsed.type as TransactionType,
        amount: parsed.amount,
        note: parsed.note,
        location: targetAccount?.name || 'Local',
        categoryId: parsed.categoryId,
        accountId: accId,
        date: dateStr,
        time: timeStr,
        timestamp: Date.now(),
        icon
      });

      if (targetAccount) {
        const delta = parsed.type === 'income' ? parsed.amount : -parsed.amount;
        await db.accounts.update(accId, { balance: targetAccount.balance + delta });
      }
    });

    showToast(
      `${parsed.type === 'income' ? '+ ' : '- '}৳${parsed.amount} • ${parsed.note}`,
      parsed.type === 'income' ? 'arrow_downward' : 'check_circle'
    );
  };

  const handleSaveManualTransaction = async (data: {
    type: TransactionType;
    amount: number;
    note: string;
    categoryId: string;
    accountId: string;
    toAccountId?: string;
    date: string;
    time: string;
  }) => {
    let icon = '💳';
    if (data.categoryId.includes('bazaar')) icon = '🥦';
    else if (data.categoryId.includes('transport')) icon = '🛺';
    else if (data.categoryId.includes('food')) icon = '☕';
    else if (data.categoryId.includes('bills')) icon = '⚡';
    else if (data.categoryId.includes('medical')) icon = '💊';

    await db.transaction('rw', [db.transactions, db.accounts], async () => {
      await db.transactions.add({
        userId: currentUser.id,
        type: data.type,
        amount: data.amount,
        note: data.note,
        categoryId: data.categoryId,
        accountId: data.accountId,
        toAccountId: data.toAccountId,
        date: data.date,
        time: data.time,
        timestamp: Date.now(),
        icon: data.type === 'transfer' ? 'swap_horiz' : icon
      });

      if (data.type === 'transfer' && data.toAccountId) {
        const fromAcc = accounts.find((a) => a.id === data.accountId);
        const toAcc = accounts.find((a) => a.id === data.toAccountId);
        if (fromAcc) await db.accounts.update(data.accountId, { balance: fromAcc.balance - data.amount });
        if (toAcc) await db.accounts.update(data.toAccountId, { balance: toAcc.balance + data.amount });
      } else {
        const acc = accounts.find((a) => a.id === data.accountId);
        if (acc) {
          const delta = data.type === 'income' ? data.amount : -data.amount;
          await db.accounts.update(data.accountId, { balance: acc.balance + delta });
        }
      }
    });

    showToast('লেনদেন সফলভাবে যুক্ত হয়েছে!', 'check_circle');
  };

  const handleSaveEditedTransaction = async (updated: Transaction) => {
    if (!updated.id) return;
    const oldTx = transactions.find((t) => t.id === updated.id);
    if (!oldTx) return;

    await db.transaction('rw', [db.transactions, db.accounts], async () => {
      await db.transactions.put(updated);

      // Reconcile balance
      const acc = accounts.find((a) => a.id === updated.accountId);
      if (acc) {
        const oldDelta = oldTx.type === 'income' ? oldTx.amount : -oldTx.amount;
        const newDelta = updated.type === 'income' ? updated.amount : -updated.amount;
        const balanceDiff = newDelta - oldDelta;
        await db.accounts.update(updated.accountId, { balance: acc.balance + balanceDiff });
      }
    });

    showToast('লেনদেন সফলভাবে আপডেট করা হয়েছে!', 'check_circle');
  };

  const handleDeleteTransaction = async (id: number) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    await db.transaction('rw', [db.transactions, db.accounts], async () => {
      await db.transactions.delete(id);
      const acc = accounts.find((a) => a.id === tx.accountId);
      if (acc) {
        const reverseDelta = tx.type === 'income' ? -tx.amount : tx.amount;
        await db.accounts.update(tx.accountId, { balance: acc.balance + reverseDelta });
      }
    });

    showToast('লেনদেনটি মুছে ফেলা হয়েছে।', 'delete');
  };

  // Settle Dhar Item
  const handleSettleDhar = async (id: number, settleAmount: number, accountId: string) => {
    const item = dharItems.find((d) => d.id === id);
    if (!item) return;

    const remaining = Math.max(0, item.amount - settleAmount);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLog: DharPaymentLog = {
      id: `pay_${Date.now()}`,
      amount: settleAmount,
      date: today,
      time: timeStr,
      timestamp: Date.now(),
      accountId,
      type: 'repayment'
    };

    await db.transaction('rw', [db.dharItems, db.accounts, db.transactions], async () => {
      await db.dharItems.update(id, {
        amount: remaining,
        status: remaining === 0 ? 'settled' : 'pending',
        history: [...(item.history || []), newLog]
      });

      const acc = accounts.find((a) => a.id === accountId);
      if (acc) {
        // If Pabo: someone paid me back -> income into wallet (+settleAmount)
        // If Debo: I paid them back -> expense from wallet (-settleAmount)
        const delta = item.type === 'pabo' ? settleAmount : -settleAmount;
        await db.accounts.update(accountId, { balance: acc.balance + delta });
      }

      // Record matching transaction in transaction feed
      await db.transactions.add({
        userId: currentUser.id,
        type: item.type === 'pabo' ? 'income' : 'expense',
        amount: settleAmount,
        note: item.type === 'pabo' ? `${item.person} - ধার পরিশোধ আদায়` : `${item.person} - ঋণ পরিশোধ`,
        categoryId: 'personal',
        accountId,
        date: today,
        time: timeStr,
        timestamp: Date.now(),
        icon: item.type === 'pabo' ? 'call_received' : 'call_made'
      });
    });

    showToast(`৳${settleAmount} সফলভাবে পরিশোধ সম্পন্ন হয়েছে!`, 'verified');
  };

  const handleAddMoreLoan = async (id: number, addAmount: number, note: string, accountId: string) => {
    const item = dharItems.find((d) => d.id === id);
    if (!item) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLog: DharPaymentLog = {
      id: `add_${Date.now()}`,
      amount: addAmount,
      date: today,
      time: timeStr,
      timestamp: Date.now(),
      accountId,
      note,
      type: 'add_loan'
    };

    await db.transaction('rw', [db.dharItems, db.accounts, db.transactions], async () => {
      await db.dharItems.update(id, {
        amount: item.amount + addAmount,
        originalAmount: item.originalAmount + addAmount,
        note: note ? `${item.note}, ${note}` : item.note,
        status: 'pending',
        history: [...(item.history || []), newLog]
      });

      const acc = accounts.find((a) => a.id === accountId);
      if (acc) {
        // If Pabo: gave more loan money out (-addAmount)
        // If Debo: borrowed more loan money in (+addAmount)
        const delta = item.type === 'pabo' ? -addAmount : addAmount;
        await db.accounts.update(accountId, { balance: acc.balance + delta });
      }

      await db.transactions.add({
        userId: currentUser.id,
        type: item.type === 'pabo' ? 'expense' : 'income',
        amount: addAmount,
        note: item.type === 'pabo' ? `${item.person} - অতিরিক্ত ধার প্রদান` : `${item.person} - অতিরিক্ত ঋণ গ্রহণ`,
        categoryId: 'personal',
        accountId,
        date: today,
        time: timeStr,
        timestamp: Date.now(),
        icon: item.type === 'pabo' ? 'call_made' : 'call_received'
      });
    });

    showToast(`৳${addAmount} ধার বৃদ্ধি করা হয়েছে!`, 'check_circle');
  };

  // Add new Dhar entry
  const handleSaveNewDhar = async (data: {
    person: string;
    amount: number;
    type: DharType;
    note: string;
    accountId: string;
  }) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const initialLog: DharPaymentLog = {
      id: `init_${Date.now()}`,
      amount: data.amount,
      date: today,
      time: timeStr,
      timestamp: Date.now(),
      accountId: data.accountId,
      note: data.note,
      type: 'add_loan'
    };

    await db.transaction('rw', [db.dharItems, db.accounts, db.transactions], async () => {
      await db.dharItems.add({
        userId: currentUser.id,
        person: data.person,
        amount: data.amount,
        originalAmount: data.amount,
        type: data.type,
        note: data.note,
        date: today,
        timestamp: Date.now(),
        status: 'pending',
        history: [initialLog]
      });

      const acc = accounts.find((a) => a.id === data.accountId);
      if (acc) {
        // If Pabo: gave money out (-amount)
        // If Debo: borrowed money in (+amount)
        const delta = data.type === 'pabo' ? -data.amount : data.amount;
        await db.accounts.update(data.accountId, { balance: acc.balance + delta });
      }

      await db.transactions.add({
        userId: currentUser.id,
        type: data.type === 'pabo' ? 'expense' : 'income',
        amount: data.amount,
        note: data.type === 'pabo' ? `${data.person} - ধার প্রদান` : `${data.person} - ঋণ গ্রহণ`,
        categoryId: 'personal',
        accountId: data.accountId,
        date: today,
        time: timeStr,
        timestamp: Date.now(),
        icon: data.type === 'pabo' ? 'handshake' : 'attach_money'
      });
    });

    showToast(`নতুন খাতা এন্ট্রি যুক্ত হয়েছে (${data.person})`, 'menu_book');
  };

  const handleDeleteDhar = async (id: number) => {
    await db.dharItems.delete(id);
    showToast('ধার খাতা এন্ট্রি মুছে ফেলা হয়েছে।', 'delete');
  };

  // Add new category
  const handleSaveCategory = async (cat: Omit<Category, 'id' | 'userId'>) => {
    const id = `${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    await db.categories.add({
      ...cat,
      id,
      userId: currentUser.id
    });
    showToast(`নতুন ক্যাটাগরি তৈরি হয়েছে: ${cat.name}`, 'category');
  };

  // Add new account
  const handleSaveAccount = async (acc: Omit<Account, 'id' | 'userId'>) => {
    const id = `${acc.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    await db.accounts.add({
      ...acc,
      id,
      userId: currentUser.id
    });
    showToast(`নতুন অ্যাকাউন্ট তৈরি হয়েছে: ${acc.name}`, 'account_balance');
  };

  // Confirm Receipt Scan
  const handleConfirmReceiptScan = async (result: ScanReceiptResult) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = result.date || now.toISOString().split('T')[0];

    const note = result.items.length > 0
      ? `${result.shopName} (${result.items.map((i) => i.name).join(', ').slice(0, 30)}...)`
      : result.shopName;

    const cashAcc = accounts.find((a) => a.type === 'cash') || accounts[0];
    const accId = cashAcc?.id || `cash_${currentUser.id}`;

    await db.transaction('rw', [db.transactions, db.accounts], async () => {
      await db.transactions.add({
        userId: currentUser.id,
        type: 'expense',
        amount: result.totalAmount,
        note,
        location: result.shopName,
        categoryId: 'bazaar',
        accountId: accId,
        date: dateStr,
        time: timeStr,
        timestamp: Date.now(),
        icon: '🥦'
      });

      if (cashAcc) {
        await db.accounts.update(accId, { balance: cashAcc.balance - result.totalAmount });
      }
    });

    showToast(`মেমো খরচ যোগ হয়েছে: -৳${result.totalAmount}`, 'check_circle');
  };

  const totalMonthlyBudget = categories.reduce((sum, c) => sum + (c.budget || 0), 0) || 35000;
  const totalMonthlySpent = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  if (!isLoggedIn) {
    return (
      <>
        <Toast message={toastMsg} icon={toastIcon} visible={toastVisible} />
        <WelcomeGate
          onGoogleSignIn={handleGoogleSignIn}
          onDirectEmailSignIn={handleEmailAuth}
          savedUsers={allUsers}
          onSelectSavedUser={(u) => {
            setCurrentUser(u);
            localStorage.setItem('hishab_active_user', JSON.stringify(u));
            localStorage.setItem('hishab_is_logged_in', 'true');
            setIsLoggedIn(true);
            showToast(`স্বাগতম, ${u.name}!`, 'check_circle');
          }}
          onDeleteSavedUser={handleDeleteSavedUser}
          isLoading={isGoogleSigningIn}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gLight-bg dark:bg-gDark-bg flex flex-col transition-colors duration-150">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col relative">
        {/* Toast Notification */}
        <Toast message={toastMsg} icon={toastIcon} visible={toastVisible} />

        {/* 1. Header (Matches Stitch lines 85-118) */}
        <Header
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          user={currentUser}
          onOpenUserModal={() => setIsGoogleAuthModalOpen(true)}
          onTriggerSync={handleTriggerSync}
          syncText={syncText}
          isDriveConnected={!!getStoredAccessToken()}
        />

        {/* 2. Main Views according to activeTab */}
        {activeTab === 'hishab' && (
          <HomeView
            accounts={accounts}
            categories={categories}
            dharItems={dharItems}
            transactions={transactions}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onOpenWalletsView={() => setActiveTab('wallets')}
            onOpenDharView={() => setActiveTab('dhar')}
            onOpenTransferModal={() => setIsManualModalOpen(true)}
            onOpenAddAccountModal={() => setIsNewAccountModalOpen(true)}
            onOpenAddCategoryModal={() => setIsNewCategoryModalOpen(true)}
            onOpenManualEntryModal={() => setIsManualModalOpen(true)}
            onOpenSettleModal={(item) => {
              setSettlingDharItem(item);
              setIsSettleModalOpen(true);
            }}
            onSelectTransactionToEdit={(tx) => setEditingTransaction(tx)}
          />
        )}

        {activeTab === 'wallets' && (
          <WalletsView
            accounts={accounts}
            transactions={transactions}
            onBack={() => setActiveTab('hishab')}
            onOpenTransfer={() => setIsManualModalOpen(true)}
            onOpenAddAccount={() => setIsNewAccountModalOpen(true)}
            onUpdateBalance={async (accId, newBal) => {
              await db.accounts.update(accId, { balance: newBal });
              showToast('ব্যালেন্স আপডেট হয়েছে!', 'check_circle');
            }}
          />
        )}

        {activeTab === 'dhar' && (
          <DharKhataView
            dharItems={dharItems}
            onBack={() => setActiveTab('hishab')}
            onOpenNewDhar={() => setIsNewDharModalOpen(true)}
            onOpenSettle={(item) => {
              setSettlingDharItem(item);
              setIsSettleModalOpen(true);
            }}
            onDeleteDhar={handleDeleteDhar}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView categories={categories} transactions={transactions} />
        )}

        {activeTab === 'categories' && (
          <CategoriesView
            categories={categories}
            transactions={transactions}
            onOpenAddCategory={() => setIsNewCategoryModalOpen(true)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            user={currentUser}
            onShowToast={showToast}
            onDataRestored={() => showToast('সকল ডাটা সফলভাবে রিস্টোর হয়েছে!', 'cloud_done')}
            onOpenUserModal={() => setIsGoogleAuthModalOpen(true)}
          />
        )}

        {/* 3. Floating Capsule Bar (Matches Stitch lines 638-686) */}
        {(activeTab === 'hishab' || activeTab === 'analytics' || activeTab === 'categories') && (
          <CapsuleBar
            onAddParsedExpense={handleAddParsedExpense}
            onOpenManualModal={() => setIsManualModalOpen(true)}
            onOpenReceiptScanModal={() => setIsReceiptModalOpen(true)}
            onOpenAIAdvisorModal={() => setIsAIAdvisorModalOpen(true)}
            onShowToast={showToast}
          />
        )}

        {/* 4. Material 3 Bottom Navigation Bar (Matches Stitch lines 689-717) */}
        <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

        {/* 5. Modals */}
        <EditTransactionModal
          isOpen={editingTransaction !== null}
          transaction={editingTransaction}
          accounts={accounts}
          categories={categories}
          onClose={() => setEditingTransaction(null)}
          onSave={handleSaveEditedTransaction}
          onDelete={handleDeleteTransaction}
        />

        <ManualEntryModal
          isOpen={isManualModalOpen}
          accounts={accounts}
          categories={categories}
          onClose={() => setIsManualModalOpen(false)}
          onSave={handleSaveManualTransaction}
        />

        <DharSettleModal
          isOpen={isSettleModalOpen}
          item={settlingDharItem}
          accounts={accounts}
          onClose={() => {
            setIsSettleModalOpen(false);
            setSettlingDharItem(null);
          }}
          onSettle={handleSettleDhar}
          onAddMoreLoan={handleAddMoreLoan}
        />

        <NewDharModal
          isOpen={isNewDharModalOpen}
          accounts={accounts}
          onClose={() => setIsNewDharModalOpen(false)}
          onSave={handleSaveNewDhar}
        />

        <NewCategoryModal
          isOpen={isNewCategoryModalOpen}
          onClose={() => setIsNewCategoryModalOpen(false)}
          onSave={handleSaveCategory}
        />

        <NewAccountModal
          isOpen={isNewAccountModalOpen}
          onClose={() => setIsNewAccountModalOpen(false)}
          onSave={handleSaveAccount}
        />

        <ReceiptScannerModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          onConfirm={handleConfirmReceiptScan}
          onShowToast={showToast}
        />

        <AIAdvisorModal
          isOpen={isAIAdvisorModalOpen}
          totalBudget={totalMonthlyBudget}
          totalSpent={totalMonthlySpent}
          onClose={() => setIsAIAdvisorModalOpen(false)}
        />

        <GoogleAuthModal
          isOpen={isGoogleAuthModalOpen}
          currentUser={currentUser}
          users={allUsers}
          onClose={() => setIsGoogleAuthModalOpen(false)}
          onSignOut={handleSignOut}
          onSwitchUser={(u) => {
            setCurrentUser(u);
            showToast(`প্রোফাইল পরিবর্তন: ${u.name}`, 'account_circle');
          }}
          onAddUser={async (newUser, isScratch) => {
            await db.users.put(newUser);
            await initializeUserData(newUser.id, isScratch);
            setCurrentUser(newUser);
            if (isScratch) {
              setOnboardingUser(newUser);
              setIsOnboardingOpen(true);
            }
          }}
          onShowToast={showToast}
          onResetToScratch={async (userId) => {
            await resetUserDataToScratch(userId);
            setOnboardingUser(currentUser);
            setIsOnboardingOpen(true);
          }}
          onOpenOnboarding={(user) => {
            setOnboardingUser(user);
            setIsOnboardingOpen(true);
          }}
        />

        <OnboardingModal
          isOpen={isOnboardingOpen}
          user={onboardingUser || currentUser}
          onSaveBalances={async (balances) => {
            const targetId = (onboardingUser || currentUser).id;
            await updateStartingBalances(targetId, balances);
            setIsOnboardingOpen(false);
            setOnboardingUser(null);
            showToast('ওয়ালেট ব্যালেন্স সফলভাবে সেটআপ করা হয়েছে!', 'account_balance_wallet');
            backgroundSyncToDrive();
          }}
          onSkip={() => {
            setIsOnboardingOpen(false);
            setOnboardingUser(null);
            showToast('হিসাব শুরু হয়েছে (ব্যালেন্স ৳ ০)!', 'check_circle');
            backgroundSyncToDrive();
          }}
        />
      </div>
    </div>
  );
}
