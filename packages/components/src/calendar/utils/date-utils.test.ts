import { describe, it, expect } from 'vitest';
import { getMonthDays, getWeekDays, isDateDisabled } from './date-utils';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

describe('date-utils', () => {
  describe('getMonthDays', () => {
    it('returns all days to display for a month including padding', () => {
      const date = new Date(2023, 9, 15); // Oct 2023
      const days = getMonthDays(date);

      const start = startOfWeek(startOfMonth(date));
      const end = endOfWeek(endOfMonth(date));

      expect(days[0].toISOString()).toBe(start.toISOString());
      // eachDayOfInterval returns start of day
      expect(days[days.length - 1].toISOString()).toBe(
        new Date(end.setHours(0, 0, 0, 0)).toISOString(),
      );
      expect(days.length).toBeGreaterThanOrEqual(28);
    });
  });

  describe('getWeekDays', () => {
    it('returns 7 days for the week of the given date', () => {
      const date = new Date(2023, 9, 15); // Sunday Oct 15 2023
      const days = getWeekDays(date);

      expect(days).toHaveLength(7);
      expect(days[0].getDay()).toBe(0); // Sunday
      expect(days[6].getDay()).toBe(6); // Saturday
    });
  });

  describe('isDateDisabled', () => {
    const testDate = new Date(2023, 9, 15);

    it('returns false when no disabled matcher provided', () => {
      expect(isDateDisabled(testDate, undefined)).toBe(false);
    });

    it('handles boolean disabled (true)', () => {
      expect(isDateDisabled(testDate, true)).toBe(true);
    });

    it('handles single Date matcher', () => {
      expect(isDateDisabled(testDate, new Date(2023, 9, 15))).toBe(true);
      expect(isDateDisabled(testDate, new Date(2023, 9, 16))).toBe(false);
    });

    it('handles Date array matcher', () => {
      expect(
        isDateDisabled(testDate, [
          new Date(2023, 9, 15),
          new Date(2023, 9, 16),
        ]),
      ).toBe(true);
    });

    it('handles range matcher {from, to}', () => {
      const range = { from: new Date(2023, 9, 10), to: new Date(2023, 9, 20) };
      expect(isDateDisabled(testDate, range)).toBe(true);
      expect(isDateDisabled(new Date(2023, 9, 9), range)).toBe(false);
    });

    it('handles function matcher', () => {
      const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
      // Oct 15 2023 is Sunday
      expect(isDateDisabled(testDate, isWeekend)).toBe(true);
      // Oct 16 2023 is Monday
      expect(isDateDisabled(new Date(2023, 9, 16), isWeekend)).toBe(false);
    });

    it('handles before matcher', () => {
      const matcher = { before: new Date(2023, 9, 15) };
      // Oct 14 is before Oct 15
      expect(isDateDisabled(new Date(2023, 9, 14), matcher)).toBe(true);
      // Oct 15 is not before Oct 15 (startOfDay comparison)
      expect(isDateDisabled(new Date(2023, 9, 15), matcher)).toBe(false);
    });

    it('handles after matcher', () => {
      const matcher = { after: new Date(2023, 9, 15) };
      // Oct 16 is after Oct 15
      expect(isDateDisabled(new Date(2023, 9, 16), matcher)).toBe(true);
      // Oct 15 is not after Oct 15
      expect(isDateDisabled(new Date(2023, 9, 15), matcher)).toBe(false);
    });
  });
});
