import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNaturalInput, normalizeBanglaDigits } from '../src/services/nlpParser.ts';

test('normalizeBanglaDigits converts all Bengali digits to ASCII', () => {
  assert.equal(normalizeBanglaDigits('০১২৩৪৫৬৭৮৯'), '0123456789');
  assert.equal(normalizeBanglaDigits('বাজার ১২৫০ টাকা'), 'বাজার 1250 টাকা');
  assert.equal(normalizeBanglaDigits('123 এবং ৪৫৬'), '123 এবং 456');
});

test('parses standard transport expense with English digits', () => {
  const res = parseNaturalInput('Rickshaw 60 tk');
  assert.equal(res.amount, 60);
  assert.equal(res.categoryId, 'transport');
  assert.equal(res.accountId, 'cash');
  assert.equal(res.type, 'expense');
});

test('parses Bengali digits and grocery category', () => {
  const res = parseNaturalInput('কাঁচাবাজার ১২৫০ টাকা');
  assert.equal(res.amount, 1250);
  assert.equal(res.categoryId, 'bazaar');
  assert.equal(res.accountId, 'cash');
  assert.equal(res.type, 'expense');
});

test('detects bKash wallet and food category', () => {
  const res = parseNaturalInput('bKash e 450 taka biryani khawa');
  assert.equal(res.amount, 450);
  assert.equal(res.categoryId, 'food');
  assert.equal(res.accountId, 'bkash');
  assert.equal(res.type, 'expense');
});

test('detects Bank card and shopping category', () => {
  const res = parseNaturalInput('City bank card e 2400 tk shopping daraz');
  assert.equal(res.amount, 2400);
  assert.equal(res.categoryId, 'shopping');
  assert.equal(res.accountId, 'bank');
  assert.equal(res.type, 'expense');
});

test('detects Nagad wallet and utility bills', () => {
  const res = parseNaturalInput('Nagad e 800 tk internet bill');
  assert.equal(res.amount, 800);
  assert.equal(res.categoryId, 'bills');
  assert.equal(res.accountId, 'nagad');
  assert.equal(res.type, 'expense');
});

test('detects income with salary keywords', () => {
  const res = parseNaturalInput('Bank e 50000 tk salary ashlo');
  assert.equal(res.amount, 50000);
  assert.equal(res.accountId, 'bank');
  assert.equal(res.type, 'income');
});

test('detects Bengali income (tuition)', () => {
  const res = parseNaturalInput('টিউশনি পেলাম ৩০০০ টাকা');
  assert.equal(res.amount, 3000);
  assert.equal(res.type, 'income');
});

test('detects Dhar Pabo and cleans recipient name suffix', () => {
  const res = parseNaturalInput('সাকিবকে ১৫০০ টাকা ধার দিলাম');
  assert.equal(res.amount, 1500);
  assert.equal(res.type, 'dhar');
  assert.equal(res.dharType, 'pabo');
  assert.equal(res.dharPerson, 'সাকিব');
});

test('detects Dhar Debo and clean store name', () => {
  const res = parseNaturalInput('মদিনা স্টোর থেকে ৮০০ টাকা বাকি নিলাম');
  assert.equal(res.amount, 800);
  assert.equal(res.type, 'dhar');
  assert.equal(res.dharType, 'debo');
  assert.equal(res.dharPerson, 'মদিনা স্টোর');
});

test('parses decimal amount correctly', () => {
  const res = parseNaturalInput('150.50 tk medicine square pharma');
  assert.equal(res.amount, 150.5);
  assert.equal(res.categoryId, 'medical');
  assert.equal(res.type, 'expense');
});
