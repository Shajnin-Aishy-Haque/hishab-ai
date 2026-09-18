# Hishab AI - Living Project State Tracker

> **Authoritative State File**  
> **Last Updated:** 2026-09-19 02:20 AM BST  
> **Product Lead / Owner:** Nafis Walid (`nafiswalid.work@gmail.com`)  
> **Production Live URL:** https://hishab-ai.pages.dev  
> **GitHub Repository:** https://github.com/Shajnin-Aishy-Haque/hishab-ai  

---

## 1. Executive Summary & Architecture
Hishab AI is a zero-cost, privacy-first personal spending tracker and Dhar Khata application built for Bangladesh, featuring Bangla natural language processing, voice logging, and Google Drive cloud sync.

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS (Material 3 Dark/Light)
- **Local Database:** Dexie.js (IndexedDB v2) with full multi-user data isolation
- **Cloud Backup:** Google Drive REST API v3 (scoped to `drive.file`)
- **Hosting:** Cloudflare Pages (100% Free tier, edge CDN)
- **Authentication:** Google Identity Services OAuth 2.0 (`389500978872-fobt5t10s52o1co3h08kjis4tmomnucf.apps.googleusercontent.com`) + Instant Local Profile Switcher
- **Testing:** Native Node.js test runner (`node --test`) with 16 automated unit tests

---

## 2. Completed Milestones & Changelog

### Phase 1: Authentication & Onboarding
- [x] **Zero-Prompt Google OAuth 2.0**: Integrated official client ID directly, completely eliminating raw browser prompt blockers.
- [x] **Dual-Mode Welcome Gate**: Dedicated "Create Account" (Sign Up with Name + Email) and "Sign In" tabs.
- [x] **Wallet Onboarding Wizard**: Automated Cash, bKash, Bank, and Nagad balance initialization modal immediately upon new signup.
- [x] **Google Cloud Branding Assets**:
  - App Logo: `https://hishab-ai.pages.dev/logo.png` (120x120 px PNG)
  - Privacy Policy: `https://hishab-ai.pages.dev/privacy`
  - Terms of Service: `https://hishab-ai.pages.dev/terms`

### Phase 2: Dhar Khata & Double-Entry Accounting Sync
- [x] **Ledger Synchronization**: Every Dhar creation, repayment, and extra loan increment now automatically creates a corresponding transaction entry in `db.transactions`, keeping wallet balances, transaction feeds, and analytics 100% synchronized.
- [x] **Installment History Logs**: Added `history: DharPaymentLog[]` to each Dhar item, tracking every partial repayment with date, timestamp, and amount.
- [x] **Dhar Khata View Enhancements**: Expandable installment history accordions and deletion confirmation for settled accounts.

### Phase 3: Mobile UX & Touch Optimization
- [x] **Mobile Send Button**: Added a dedicated touch Submit/Send arrow button inside the Capsule Bar when text is entered, so users don't have to rely on the soft keyboard's Enter key.
- [x] **1-Tap Quick Preview Submit**: Tapping the floating NLP preview chip now instantly commits the parsed expense.
- [x] **Camera Memo Optimization**: Added `resizeImageForVision()` to downscale smartphone camera photos to max 1280px before base64 encoding, eliminating mobile browser freezes.

### Phase 4: Resilient Offline-First Sync
- [x] **Auto Reconnection Sync**: Added window `online` event listener that immediately syncs local IndexedDB snapshots to Google Drive as soon as network connectivity is restored.
- [x] **16 Automated Regression Tests**: Passing 100% of tests covering Bengali digit conversion, NLP intent parsing, Dhar balance math, snapshot integrity, and CSV UTF-8 BOM encoding.

---

## 3. Automated Test Suite Status
```
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
Total: 16 passed, 0 failed.
```

---

## 4. Git Repository & Deployment
- **Git Repo:** `https://github.com/Shajnin-Aishy-Haque/hishab-ai`
- **Cloudflare Pages Production:** `https://hishab-ai.pages.dev`
