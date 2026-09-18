import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getLocalDateString,
  getLocalTimeString,
  isToday,
  isYesterday,
  formatDisplayDate
} from '../src/utils/dateUtils.ts';

test('getLocalDateString returns valid YYYY-MM-DD formatted string in local time', () => {
  const d = new Date(2026, 8, 19, 2, 30, 0); // Sep 19, 2026
  assert.equal(getLocalDateString(d), '2026-09-19');
});

test('getLocalTimeString returns 12-hour formatted time with AM/PM', () => {
  const amDate = new Date(2026, 8, 19, 2, 30, 0);
  assert.equal(getLocalTimeString(amDate), '02:30 AM');

  const pmDate = new Date(2026, 8, 19, 14, 45, 0);
  assert.equal(getLocalTimeString(pmDate), '02:45 PM');

  const noonDate = new Date(2026, 8, 19, 12, 0, 0);
  assert.equal(getLocalTimeString(noonDate), '12:00 PM');

  const midnightDate = new Date(2026, 8, 19, 0, 15, 0);
  assert.equal(getLocalTimeString(midnightDate), '12:15 AM');
});

test('isToday returns true for current date and false for other dates', () => {
  const todayStr = getLocalDateString();
  assert.equal(isToday(todayStr), true);
  assert.equal(isToday('2020-01-01'), false);
});

test('isYesterday returns true for yesterday and false for today', () => {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yStr = getLocalDateString(y);
  assert.equal(isYesterday(yStr), true);
  assert.equal(isYesterday(getLocalDateString()), false);
});

test('formatDisplayDate returns Bengali label for today and yesterday', () => {
  const todayStr = getLocalDateString();
  assert.equal(formatDisplayDate(todayStr), 'আজ');

  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yStr = getLocalDateString(y);
  assert.equal(formatDisplayDate(yStr), 'গতকাল');

  assert.equal(formatDisplayDate('2026-01-15'), '15 Jan');
});
