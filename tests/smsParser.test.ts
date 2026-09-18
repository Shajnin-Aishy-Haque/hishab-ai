import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseNaturalInput } from '../src/services/nlpParser.ts';

test('parses standard bKash payment SMS correctly', () => {
  const sms = 'Payment Tk 350.00 to 01812345678 successful. Ref Grocery. Fee Tk 0.00. Balance Tk 4,650.00. TrxID 8B7C6D5E';
  const res = parseNaturalInput(sms);

  assert.equal(res.amount, 350);
  assert.equal(res.type, 'expense');
  assert.equal(res.accountId, 'bkash');
  assert.equal(res.confidence >= 0.95, true);
});

test('parses bKash received money SMS as income correctly', () => {
  const sms = 'You have received Tk 5,000.00 from 01712345678. Fee Tk 0.00. Balance Tk 15,250.00. TrxID 9A8B7C6D';
  const res = parseNaturalInput(sms);

  assert.equal(res.amount, 5000);
  assert.equal(res.type, 'income');
  assert.equal(res.accountId, 'bkash');
});

test('parses bKash Cash Out SMS correctly', () => {
  const sms = 'Cash Out Tk 1,000.00 to 01912345678 successful. Fee Tk 18.50. Balance Tk 3,631.50. TrxID 7C6D5E4F';
  const res = parseNaturalInput(sms);

  assert.equal(res.amount, 1000);
  assert.equal(res.type, 'expense');
  assert.equal(res.accountId, 'bkash');
});

test('parses Nagad payment SMS correctly', () => {
  const sms = 'Payment of Tk 450.00 to 01800000000 is successful. TxnID: 82910293';
  const res = parseNaturalInput(sms);

  assert.equal(res.amount, 450);
  assert.equal(res.type, 'expense');
  assert.equal(res.accountId, 'nagad');
});

test('parses Nagad Cash In SMS as income correctly', () => {
  const sms = 'Cash In of Tk 2,500.00 from 01700000000 is successful. TxnID: 71839201';
  const res = parseNaturalInput(sms);

  assert.equal(res.amount, 2500);
  assert.equal(res.type, 'income');
  assert.equal(res.accountId, 'nagad');
});

test('parses Bank Card SMS correctly', () => {
  const sms = 'Your Card ending 1234 has been charged BDT 850.00 at Shwapno. Avail Bal: BDT 45,000. TrxID: 9982';
  const res = parseNaturalInput(sms);

  assert.equal(res.amount, 850);
  assert.equal(res.type, 'expense');
  assert.equal(res.accountId, 'bank');
});
