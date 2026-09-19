declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: any;
              expires_in?: number;
            }) => void;
            error_callback?: (error: any) => void;
            prompt?: string;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
          hasGrantedAllScopes: (
            tokenResponse: any,
            firstScope: string,
            ...restScopes: string[]
          ) => boolean;
        };
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (momentListener?: any) => void;
        };
      };
    };
  }
}

// Scopes required: Google profile, email, and Google Drive (per-file access for Hishab AI cloud backups)
export const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.file',
  'openid'
].join(' ');

export const DEFAULT_GOOGLE_CLIENT_ID =
  '389500978872-fobt5t10s52o1co3h08kjis4tmomnucf.apps.googleusercontent.com';

const CLIENT_ID_STORAGE_KEY = 'hishab_google_client_id';
const ACCESS_TOKEN_STORAGE_KEY = 'hishab_google_drive_token';
const TOKEN_EXPIRY_STORAGE_KEY = 'hishab_google_drive_token_expiry';

export function getStoredGoogleClientId(): string {
  return (
    localStorage.getItem(CLIENT_ID_STORAGE_KEY) ||
    (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
    DEFAULT_GOOGLE_CLIENT_ID
  );
}

export function setStoredGoogleClientId(clientId: string): void {
  if (!clientId.trim()) {
    localStorage.removeItem(CLIENT_ID_STORAGE_KEY);
  } else {
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId.trim());
  }
}

export function getStoredAccessToken(): string | null {
  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_STORAGE_KEY);

  if (!token || !expiry) return null;

  // Check if expired (with 60s safety buffer)
  if (Date.now() > parseInt(expiry, 10) - 60000) {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY);
    return null;
  }

  return token;
}

export function saveAccessToken(token: string, expiresInSeconds: number = 3600): void {
  const expiry = Date.now() + expiresInSeconds * 1000;
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, expiry.toString());
}

export function clearGoogleSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY);
}

export interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email: string;
  email_verified?: boolean;
}

export interface FormattedAuthError {
  code: string;
  title: string;
  message: string;
  canRetry: boolean;
}

/**
 * Standard RFC 5322 compatible email validation
 */
export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed || trimmed.length < 5 || trimmed.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

/**
 * Resilient loader for Google Identity Services SDK.
 * Handles race conditions, dynamic script injection, and timeouts.
 */
export async function ensureGoogleSdkLoaded(timeoutMs: number = 4000): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.google?.accounts?.oauth2) return true;

  // Check if script element is already on DOM; if not, inject it
  let script = document.querySelector<HTMLScriptElement>('script[src*="accounts.google.com/gsi/client"]');
  if (!script) {
    script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  const startTime = Date.now();
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(interval);
        resolve(true);
      } else if (Date.now() - startTime >= timeoutMs) {
        clearInterval(interval);
        resolve(false);
      }
    }, 80);
  });
}

/**
 * Format Google OAuth errors into friendly, actionable Banglish and English messages.
 */
export function formatGoogleAuthError(err: any): FormattedAuthError {
  const raw = String(err?.message || err?.error || err || '').toLowerCase();

  if (raw.includes('popup_closed') || err?.error === 'popup_closed_by_user') {
    return {
      code: 'POPUP_CLOSED',
      title: 'Sign-In Cancelled',
      message: 'Google Sign-In উইন্ডো বন্ধ করা হয়েছে। প্রয়োজনে আবার চেষ্টা করতে পারেন।',
      canRetry: true
    };
  }

  if (raw.includes('access_denied') || err?.error === 'access_denied') {
    return {
      code: 'ACCESS_DENIED',
      title: 'Permission Denied',
      message: 'Google Drive এবং প্রোফাইল এক্সেস দেওয়া হয়নি। ক্লাউড ব্যাকআপের জন্য পারমিশন প্রয়োজন।',
      canRetry: true
    };
  }

  if (raw.includes('popup_blocked') || raw.includes('blocked')) {
    return {
      code: 'POPUP_BLOCKED',
      title: 'Popup Blocked',
      message: 'ব্রাউজার পপআপ ব্লক করেছে। অনুগ্রহ করে ব্রাউজার সেটিংসে পপআপ Allow করুন।',
      canRetry: true
    };
  }

  if (raw.includes('network') || (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' && !navigator.onLine)) {
    return {
      code: 'NETWORK_OFFLINE',
      title: 'Internet Disconnected',
      message: 'ইন্টারনেট সংযোগ পাওয়া যায়নি। অফলাইনে আপনি Direct Email বা গেস্ট মোড ব্যবহার করতে পারেন।',
      canRetry: true
    };
  }

  if (raw.includes('idpiframe_initialization_failed') || raw.includes('cookies')) {
    return {
      code: 'COOKIE_BLOCKED',
      title: 'Third-Party Cookies Required',
      message: 'ব্রাউজারে থার্ড-পার্টি কুকি ব্লক করা থাকতে পারে। ব্রাউজার সেটিংসে কুকি এনাবল করুন।',
      canRetry: true
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    title: 'Google Sign-In Failed',
    message: err?.message || 'Google সাইন-ইনে সমস্যা হয়েছে। Client ID এবং সংযোগ যাচাই করুন।',
    canRetry: true
  };
}

/**
 * Silent Refresh Access Token using Google Identity Services tokenClient.
 * Renews access token without opening an interactive popup if already authorized.
 */
export async function silentRefreshAccessToken(clientId: string): Promise<string | null> {
  const isLoaded = await ensureGoogleSdkLoaded(2500);
  const oauth2 = window.google?.accounts?.oauth2;
  if (!isLoaded || !oauth2) return null;

  return new Promise((resolve) => {
    try {
      let isSettled = false;
      const timeout = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          resolve(null);
        }
      }, 7000);

      const tokenClient = oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: GOOGLE_OAUTH_SCOPES,
        prompt: '', // Silent re-authorization without consent popup
        callback: (response) => {
          if (isSettled) return;
          isSettled = true;
          clearTimeout(timeout);
          if (response.access_token) {
            saveAccessToken(response.access_token, response.expires_in || 3600);
            resolve(response.access_token);
          } else {
            resolve(null);
          }
        },
        error_callback: () => {
          if (isSettled) return;
          isSettled = true;
          clearTimeout(timeout);
          resolve(null);
        }
      });

      tokenClient.requestAccessToken({ prompt: '' });
    } catch {
      resolve(null);
    }
  });
}

/**
 * Fetch real Google User Profile using OAuth Access Token
 */
export async function fetchGoogleUserProfile(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Google user profile: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Trigger Real 1-Click Google OAuth Sign-In via Google Identity Services
 */
export async function requestRealGoogleOAuth(
  clientId: string,
  onSuccess: (userInfo: GoogleUserInfo, accessToken: string) => void,
  onError: (err: any) => void
): Promise<void> {
  if (!clientId.trim()) {
    onError(new Error('Google Client ID is missing. Please configure your Google OAuth Client ID.'));
    return;
  }

  // Gracefully ensure GIS SDK is loaded before initiating flow
  const isLoaded = await ensureGoogleSdkLoaded(4000);
  const oauth2 = window.google?.accounts?.oauth2;
  if (!isLoaded || !oauth2) {
    onError(new Error('Google Identity Services SDK লোড হতে পারেনি। ইন্টারনেট বা Ad-blocker চেক করুন।'));
    return;
  }

  try {
    const tokenClient = oauth2.initTokenClient({
      client_id: clientId.trim(),
      scope: GOOGLE_OAUTH_SCOPES,
      prompt: 'select_account',
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          onError(tokenResponse.error);
          return;
        }

        if (tokenResponse.access_token) {
          try {
            saveAccessToken(tokenResponse.access_token, tokenResponse.expires_in || 3600);
            const userInfo = await fetchGoogleUserProfile(tokenResponse.access_token);
            onSuccess(userInfo, tokenResponse.access_token);
          } catch (fetchErr) {
            onError(fetchErr);
          }
        }
      },
      error_callback: (err) => {
        onError(err);
      }
    });

    // Opens Google's native browser popup with Chrome's logged in accounts!
    tokenClient.requestAccessToken({ prompt: 'select_account' });
  } catch (err) {
    onError(err);
  }
}
