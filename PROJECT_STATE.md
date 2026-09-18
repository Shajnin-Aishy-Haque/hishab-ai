# Hishab AI - Living Project State Tracker

> **Authoritative State File**  
> **Last Updated:** 2026-09-19  
> **Product Lead / Owner:** Nafis Walid  
> **Live Production URL:** https://hishab-ai.pages.dev  

---

## 1. Project Overview & Architecture
Hishab AI is a zero-cost, privacy-first personal spending tracker and Dhar Khata application tailored for Bangladesh, featuring Bangla natural language processing, voice entry, and private Google Drive cloud sync.

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS (Google Material Design 3 theme)
- **Local Storage:** Dexie.js (IndexedDB v2) with multi-user isolation
- **Cloud Backup:** Google Drive REST API v3 (scoped to `drive.file` per-app isolation)
- **Hosting:** Cloudflare Pages (Free tier, zero cost)
- **Authentication:** Google Identity Services OAuth 2.0 + Instant Local Profile Switcher

---

## 2. Completed Milestones (Production Ready)
- [x] **Zero-Prompt Google OAuth 2.0:** Integrated Google Client ID (`389500978872-fobt5t10s52o1co3h08kjis4tmomnucf.apps.googleusercontent.com`), eliminating raw browser prompts.
- [x] **Dual-Mode Welcome Gate:** Dedicated "Create Account" (Sign Up) and "Sign In" tabs.
- [x] **Initial Wallet Onboarding Wizard:** Cash, bKash, Bank, and Nagad balance initialization from scratch.
- [x] **OAuth Branding Assets:** 120x120 px app logo (`/logo.png`), Privacy Policy (`/privacy`), and Terms of Service (`/terms`).
- [x] **Automated Cloudflare Pages Deployment:** Live at `https://hishab-ai.pages.dev`.

---

## 3. Overnight Deep Iteration Roadmap (Autonomous Backlog)

### Cycle 1: Mobile Keyboard & Quick Input Bar Viewport UX
- Fix viewport clipping when mobile virtual keyboard opens.
- Ensure Capsule bar floats gracefully above the iOS Safari toolbar and Android Chrome navigation bar.

### Cycle 2: Dhar Khata & Calculation Edge Cases
- Support partial debt settlements with timestamped ledger histories.
- Verify reverse transaction accounting when modifying or deleting Dhar settlements.
- Bengali numeral parsing (`০-৯` to `0-9`) normalization across all quick entry inputs.

### Cycle 3: Offline-First Drive Sync & Resiliency
- Implement an offline queue for transactions created when disconnected from the internet.
- Auto-sync silently to Google Drive as soon as network connectivity is restored without blocking user interactions.
- Graceful handling of expired OAuth access tokens with non-intrusive re-authorization prompts.

### Cycle 4: Analytics, Category Budgets & Visual Reports
- Category-wise monthly spend progress indicators.
- Daily expense trajectory vs budget limits.
- Clean CSV / JSON backup export and import verification.

---

## 4. Git & Release Sync
- All updates tracked in git and pushed to GitHub with descriptive semantic commit messages.
- Continuous deployment to Cloudflare Pages on every verified release.
