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

  // Check if expired (with 60s buffer)
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
export function requestRealGoogleOAuth(
  clientId: string,
  onSuccess: (userInfo: GoogleUserInfo, accessToken: string) => void,
  onError: (err: any) => void
): void {
  if (!window.google?.accounts?.oauth2) {
    onError(new Error('Google Identity Services SDK not loaded yet. Check your internet connection.'));
    return;
  }

  if (!clientId.trim()) {
    onError(new Error('Google Client ID is missing. Please configure your Google OAuth Client ID.'));
    return;
  }

  try {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
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
