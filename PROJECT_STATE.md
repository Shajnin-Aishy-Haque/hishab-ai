# Hishab AI - Living Project State Tracker

> **Authoritative State File**  
> **Last Updated:** 2026-09-19 02:27 AM BST  
> **Product Lead / Owner:** Nafis Walid (`nafiswalid.work@gmail.com`)  
> **Production Live URL:** https://hishab-ai.pages.dev  
> **GitHub Repository:** https://github.com/Shajnin-Aishy-Haque/hishab-ai  

---

## 1. Executive Summary & Architecture
Hishab AI is a zero-cost, privacy-first personal spending tracker and Dhar Khata application built for Bangladesh, featuring Bangla natural language processing, voice logging, and Google Drive cloud sync.

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS (Material 3 Dark/Light)
- **PWA & Offline:** `vite-plugin-pwa` with precached service worker (SW v0.21.2) + crisp PNG icon manifest for iOS Safari & Android
- **Local Database:** Dexie.js (IndexedDB v2) with full multi-user data isolation
- **Cloud Backup:** Google Drive REST API v3 (scoped to `drive.file`) + Local JSON/CSV backups
- **Hosting:** Cloudflare Pages (100% Free tier, edge CDN)
- **Authentication:** Google Identity Services OAuth 2.0 (`389500978872-fobt5t10s52o1co3h08kjis4tmomnucf.apps.googleusercontent.com`) + Instant Local Profile Switcher
- **Testing:** Native Node.js test runner (`node --test`) with 27 automated unit tests running in ~90ms

---

## 2. Completed Milestones & Changelog

### Phase 1: Authentication & Onboarding
- [x] **Zero-Prompt Google OAuth 2.0**: Integrated official client ID directly, completely eliminating raw browser prompt blockers.
- [x] **Dual-Mode Welcome Gate**: Dedicated "Create Account" (Sign Up with Name + Email) and "Sign In" tabs.
- [x] **Wallet Onboarding Wizard**: Automated Cash, bKash, Bank, and Nagad balance initialization modal immediately upon new signup.
- [x] **Google Cloud Branding Assets**:
  - App Logo: `https://hishab-ai.pages.dev/logo.png` (120x120 px PNG)
  - Privacy Policy: `https://hishab-ai.pages.dev/privacy` & `/privacy.html`
  - Terms of Service: `https://hishab-ai.pages.dev/terms` & `/terms.html`

### Phase 2: Dhar Khata & Double-Entry Accounting Sync
- [x] **Ledger Synchronization**: Every Dhar creation, repayment, and extra loan increment now automatically creates a corresponding transaction entry in `db.transactions`, keeping wallet balances, transaction feeds, and analytics 100% synchronized.
- [x] **Installment History Logs**: Added `history: DharPaymentLog[]` to each Dhar item, tracking every partial repayment with date, timestamp, and amount.
- [x] **Dhar Khata View Enhancements**: Expandable installment history accordions and deletion confirmation for settled accounts.

### Phase 3: Mobile UX & Touch Optimization
- [x] **Mobile Send Button**: Added a dedicated touch Submit/Send arrow button inside the Capsule Bar when text is entered, so users don't have to rely on the soft keyboard's Enter key.
- [x] **1-Tap Quick Preview Submit**: Tapping the floating NLP preview chip now instantly commits the parsed expense.
- [x] **Camera Memo Optimization**: Added `resizeImageForVision()` to downscale smartphone camera photos to max 1280px before base64 encoding, eliminating mobile browser freezes.

### Phase 4: Timezone DISCREPANCY & Date Normalization
- [x] **Bangladesh (UTC+6) Midnight Fix**: Replaced all `new Date().toISOString().split('T')[0]` calls with a dedicated `getLocalDateString()` and `getLocalTimeString()` in `src/utils/dateUtils.ts`. Eliminated the bug where transactions between 12:00 AM and 5:59 AM BST were incorrectly tagged with yesterday's UTC date.
- [x] **Monthly Budget Scope Fix**: Scoped `HomeView` and `AnalyticsView` monthly expense sums to the actual current month rather than all-time historical data.

### Phase 5: PWA Standalone Support (iOS & Android)
- [x] **High-Resolution PNG Icon Suite**: Generated `icon-512.png`, `icon-192.png`, `apple-touch-icon.png` (180x180), and `favicon.png` from original vector artwork.
- [x] **PWA Manifest & Meta Tags**: Configured `standalone` portrait display, `theme-color: #131314`, `apple-mobile-web-app-capable: yes`, and `apple-mobile-web-app-title: Hishab AI`.
- [x] **Service Worker Pre-caching**: 12 critical assets (487KB) precached for 100% offline launch speed.

### Phase 6: Analytics & Financial Insights Engine
- [x] **Dynamic 4-Week Breakdown**: Replaced hardcoded CSS heights with real spending aggregation across Week 1 (days 1-7), Week 2 (days 8-14), Week 3 (days 15-21), and Week 4+ (days 22+). Current week highlighted in real-time.
- [x] **Cashflow Overview**: Real-time 3-column financial health metric showing Total Income, Total Expense, Net Balance, and Savings Rate percentage.
- [x] **Category Over-Budget Trajectory**: Highlights overspent categories with a red badge and exact overrun amount.

### Phase 7: Account Balancing & Cross-Wallet Reconciliations
- [x] **Cross-Account Edit Reversal**: Corrected transaction editing logic so that changing a transaction's payment wallet (e.g. from Cash to bKash) automatically credits the old account and debits the new account without balance corruption.
- [x] **Wallet Transfer Direction**: Fixed transfer sign rendering in `WalletsView` so incoming transfers show as green `+ ৳` and outgoing as `- ৳`.

### Phase 8: Voice Recognition WebKit Resilience
- [x] **iOS Safari Lifecycle Management**: Instantiates a fresh `SpeechRecognition` object per session to avoid WebKit `InvalidStateError` when restarting listening.
- [x] **User-Friendly Error Translation**: Catches `no-speech`, `not-allowed`, and `network` events with natural Bangla prompts.

### Phase 9: Dynamic AI Financial Advisor
- [x] **Real Calendar Month Math**: Replaced hardcoded '13 days remaining' with live calculation of calendar days left in the current month (`daysInMonth - currentDay`).
- [x] **Dual AI/Rule Architecture**: Evaluates financial queries using Gemini 2.0 Flash when an API key is present, with automatic fallback to high-precision offline spending allowance math.
- [x] **Interactive Query Input**: Added direct query input field inside the AI Advisor modal allowing users to ask arbitrary purchase viability questions.

### Phase 10: MFS & Banking Transaction SMS Parser
- [x] **Native bKash & Nagad SMS Recognition**: Users can copy-paste real transaction SMS messages (e.g. `Payment Tk 350.00 to ...`, `Cash Out Tk 1,000`, `Cash In of Tk 2,500`, `TxnID`, `TrxID`).
- [x] **Safe Extraction**: Isolates actual spent amount without mistaking Fee, Balance, or phone numbers for the primary transaction value.

### Phase 11: Enterprise-Grade Authentication & Login System Refactor
- [x] **Resilient Google Identity Services (GIS) Async Loader**: Added `ensureGoogleSdkLoaded()` with graceful polling, dynamic script injection, and timeout protection, eliminating race condition initialization failures.
- [x] **Silent Token Refresh Engine**: Integrated `silentRefreshAccessToken()` utilizing GIS `prompt: ''` to automatically re-authorize Google Drive tokens in the background, eliminating sudden 1-hour session drops.
- [x] **Centralized Account Linking & ID Preservation**: Added `resolveOrLinkUser()` to link Google OAuth credentials with pre-existing local email profiles, preventing account duplication and orphaned data loss.
- [x] **Unauthenticated State Isolation**: Guarded database mutations so unauthenticated visitors never leak or seed `DEFAULT_USER` into local Dexie IndexedDB.
- [x] **1-Tap Guest / Demo Mode**: Added instant exploration mode with pre-seeded realistic Bangladesh financial data (Cash, bKash, Nagad, City Bank, bazaar expenses, and Dhar Khata) without requiring login.
- [x] **RFC 5322 Standard Email Validation**: Replaced naive email checking with comprehensive regex and inline Banglish validation prompts.
- [x] **Safe Cascading User Deletion**: Implemented `purgeUserProfileAndData()` for atomic deletion across all IndexedDB tables, eliminating orphaned database bloat.
- [x] **Multi-Tab Session Sync**: Added `StorageEvent` synchronization so login/logout actions update instantly across all open browser tabs.

---

## 3. Automated Test Suite Status (38 Tests Passing)
```
✔ reconciles same account expense adjustment (increasing amount)
✔ reconciles same account expense adjustment (decreasing amount)
✔ reconciles cross-account wallet change correctly
✔ computes savings rate and cashflow net correctly
✔ computes weekly breakdown buckets correctly for a month
✔ identifies over-budget status and remaining amounts correctly
✔ validates emails correctly according to RFC 5322 rules
✔ formats Google OAuth errors into user-friendly actionable feedback
✔ ensures token expiry validation handles 60-second safety buffer correctly
✔ verifies email normalization and deterministic user ID creation
✔ preserves user ID when account linking existing local user with Google credentials
✔ getLocalDateString returns valid YYYY-MM-DD formatted string in local time
✔ getLocalTimeString returns 12-hour formatted time with AM/PM
✔ isToday returns true for current date and false for other dates
✔ isYesterday returns true for yesterday and false for today
✔ formatDisplayDate returns Bengali label for today and yesterday
✔ calculates remaining amount correctly on full settlement
✔ calculates remaining amount correctly on partial repayment
✔ handles add more loan increments
✔ validates BackupSnapshot structure
✔ ensures CSV UTF-8 BOM encoding for Bengali character preservation
✔ normalizeBanglaDigits converts all Bengali digits to ASCII
✔ parses standard transport expense with English digits
✔ parses Bengali digits and grocery category
✔ detects bKash wallet and food category
✔ detects Bank card and shopping category
✔ detects Nagad wallet and utility bills
✔ detects income with salary keywords
✔ detects Bengali income (tuition)
✔ detects Dhar Pabo and cleans recipient name suffix
✔ detects Dhar Debo and clean store name
✔ parses decimal amount correctly
✔ parses standard bKash payment SMS correctly
✔ parses bKash received money SMS as income correctly
✔ parses bKash Cash Out SMS correctly
✔ parses Nagad payment SMS correctly
✔ parses Nagad Cash In SMS as income correctly
✔ parses Bank Card SMS correctly
Total: 38 passed, 0 failed (Execution: ~105ms).
```

---

## 4. Production Deployment Status
- **Git Repo:** `https://github.com/Shajnin-Aishy-Haque/hishab-ai`
- **Cloudflare Pages Production:** `https://hishab-ai.pages.dev`
- **Current Release:** v2.1.0 (Enterprise Authentication & Login Upgrade)
