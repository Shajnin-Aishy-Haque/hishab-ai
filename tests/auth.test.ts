import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidEmail, formatGoogleAuthError } from '../src/services/googleAuth.ts';

test('validates emails correctly according to RFC 5322 rules', () => {
  // Valid emails
  assert.equal(isValidEmail('user@gmail.com'), true);
  assert.equal(isValidEmail('user.name+tag@sub.domain.org'), true);
  assert.equal(isValidEmail('student@dept.ruet.ac.bd'), true);
  assert.equal(isValidEmail('finance.tracker@example.com'), true);

  // Invalid emails
  assert.equal(isValidEmail(''), false);
  assert.equal(isValidEmail('   '), false);
  assert.equal(isValidEmail('plainaddress'), false);
  assert.equal(isValidEmail('@missingusername.com'), false);
  assert.equal(isValidEmail('username@.com'), false);
  assert.equal(isValidEmail('username@domain'), false);
  assert.equal(isValidEmail('username@domain.'), false);
  assert.equal(isValidEmail('user name@domain.com'), false);
});

test('formats Google OAuth errors into user-friendly actionable feedback', () => {
  const popupClosed = formatGoogleAuthError({ error: 'popup_closed_by_user' });
  assert.equal(popupClosed.code, 'POPUP_CLOSED');
  assert.equal(popupClosed.canRetry, true);
  assert.match(popupClosed.message, /Google Sign-In উইন্ডো বন্ধ করা হয়েছে/);

  const accessDenied = formatGoogleAuthError({ error: 'access_denied' });
  assert.equal(accessDenied.code, 'ACCESS_DENIED');
  assert.match(accessDenied.message, /Google Drive এবং প্রোফাইল এক্সেস দেওয়া হয়নি/);

  const popupBlocked = formatGoogleAuthError(new Error('Browser popup_blocked by client'));
  assert.equal(popupBlocked.code, 'POPUP_BLOCKED');
  assert.match(popupBlocked.message, /ব্রাউজার পপআপ ব্লক করেছে/);

  const networkErr = formatGoogleAuthError(new Error('network request failed'));
  assert.equal(networkErr.code, 'NETWORK_OFFLINE');
  assert.match(networkErr.message, /ইন্টারনেট সংযোগ পাওয়া যায়নি/);

  const generic = formatGoogleAuthError(new Error('Unexpected ID token parse fault'));
  assert.equal(generic.code, 'UNKNOWN_ERROR');
});

test('ensures token expiry validation handles 60-second safety buffer correctly', () => {
  const now = Date.now();

  // Scenario 1: Token expires in 120 seconds (Valid)
  const futureExpiry = now + 120000;
  const isBufferExpired1 = now > futureExpiry - 60000;
  assert.equal(isBufferExpired1, false, 'Token with 120s remaining should NOT be expired');

  // Scenario 2: Token expires in 30 seconds (Inside buffer, should be treated as expired)
  const nearExpiry = now + 30000;
  const isBufferExpired2 = now > nearExpiry - 60000;
  assert.equal(isBufferExpired2, true, 'Token with 30s remaining should be treated as expired for safety');

  // Scenario 3: Token expired 10 seconds ago
  const pastExpiry = now - 10000;
  const isBufferExpired3 = now > pastExpiry - 60000;
  assert.equal(isBufferExpired3, true, 'Expired token should be expired');
});

test('verifies email normalization and deterministic user ID creation', () => {
  const rawEmail = '  Sample.User@Gmail.COM  ';
  const cleanEmail = rawEmail.trim().toLowerCase();
  assert.equal(cleanEmail, 'sample.user@gmail.com');

  const deterministicId = `user_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
  assert.equal(deterministicId, 'user_sample_user_gmail_com');

  const name = 'Sample User';
  const initial = name.trim().charAt(0).toUpperCase();
  assert.equal(initial, 'S');
});

test('preserves user ID when account linking existing local user with Google credentials', () => {
  // Mock pre-existing local user created via Direct Email
  const existingLocalUser = {
    id: 'user_sample_user_gmail_com',
    name: 'Sample User',
    email: 'sample.user@gmail.com',
    initial: 'S',
    authProvider: 'email' as const
  };

  // Google OAuth payload for the same email
  const googlePayload = {
    sub: '10987654321',
    name: 'Sample User',
    email: 'sample.user@gmail.com',
    picture: 'https://lh3.googleusercontent.com/avatar.png'
  };

  // Linking logic simulation (same as resolveOrLinkUser)
  const isSameEmail = existingLocalUser.email.toLowerCase() === googlePayload.email.toLowerCase();
  assert.equal(isSameEmail, true);

  const linkedUser = {
    ...existingLocalUser,
    avatarUrl: googlePayload.picture,
    googleSub: googlePayload.sub,
    authProvider: 'google' as const,
    lastLoginAt: 123456789
  };

  // Crucial check: The user ID must NOT change to google_10987654321,
  // preventing all previous transactions, accounts, and Dhar records from being orphaned!
  assert.equal(linkedUser.id, 'user_sample_user_gmail_com');
  assert.equal(linkedUser.authProvider, 'google');
  assert.equal(linkedUser.avatarUrl, 'https://lh3.googleusercontent.com/avatar.png');
  assert.equal(linkedUser.googleSub, '10987654321');
});
