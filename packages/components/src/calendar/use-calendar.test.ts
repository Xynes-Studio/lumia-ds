import { renderHook, act } from '@testing-library/react';
import { useCalendar } from './use-calendar';
import { addMonths, subMonths, isSameMonth } from 'date-fns';
import { describe, it, expect } from 'vitest';

describe('useCalendar', () => {
  it('should initialize with the current month/year if no props provided', () => {
    const { result } = renderHook(() => useCalendar({}));
    const now = new Date();
    expect(isSameMonth(result.current.month, now)).toBe(true);
  });

  it('should initialize with provided defaultMonth', () => {
    const defaultMonth = new Date(2023, 0, 1); // Jan 2023
    const { result } = renderHook(() => useCalendar({ defaultMonth }));
    expect(isSameMonth(result.current.month, defaultMonth)).toBe(true);
  });

  it('should navigate to next month', () => {
    const defaultMonth = new Date(2023, 0, 1);
    const { result } = renderHook(() => useCalendar({ defaultMonth }));

    act(() => {
      result.current.nextMonth();
    });

    const expected = addMonths(defaultMonth, 1);
    expect(isSameMonth(result.current.month, expected)).toBe(true);
  });

  it('should navigate to previous month', () => {
    const defaultMonth = new Date(2023, 0, 1);
    const { result } = renderHook(() => useCalendar({ defaultMonth }));

    act(() => {
      result.current.prevMonth();
    });

    const expected = subMonths(defaultMonth, 1);
    expect(isSameMonth(result.current.month, expected)).toBe(true);
  });

  it('should set a specific month', () => {
    const defaultMonth = new Date(2023, 0, 1);
    const { result } = renderHook(() => useCalendar({ defaultMonth }));

    const newMonth = new Date(2023, 5, 1); // June 2023
    act(() => {
      result.current.setMonth(newMonth);
    });

    expect(isSameMonth(result.current.month, newMonth)).toBe(true);
  });

  it('should generate correct grid days for a month', () => {
    // Jan 2023 starts on Sunday (0) and ends on Tuesday (31)
    // If week starts on Sunday:
    // 1st is Sunday.
    const defaultMonth = new Date(2023, 0, 1);
    const { result } = renderHook(() => useCalendar({ defaultMonth }));

    const days = result.current.days;
    // Jan 2023 has 31 days.
    // We expect the array to include all days of the month.
    // We verify start and end.
    expect(days.length).toBeGreaterThanOrEqual(31);
    expect(days[0].getDate()).toBe(1); // Should start at 1st if no padding checks yet

    // Check if identifying current month correctly
    const dayInMonth = days.find((d) => d.getDate() === 15);
    expect(dayInMonth).toBeDefined();
  });
});
