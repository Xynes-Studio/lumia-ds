import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay as fnsIsSameDay,
  isBefore,
  isAfter,
  startOfDay,
} from 'date-fns';
import { DisabledMatcher } from '../types/calendar.types';

export const getMonthDays = (date: Date): Date[] => {
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));
  return eachDayOfInterval({ start, end });
};

export const getWeekDays = (date: Date): Date[] => {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  return eachDayOfInterval({ start, end });
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return fnsIsSameDay(date1, date2);
};

export const isDateDisabled = (
  date: Date,
  disabled?: DisabledMatcher | DisabledMatcher[],
): boolean => {
  if (!disabled) return false;

  if (Array.isArray(disabled)) {
    return disabled.some((matcher) => isDateDisabled(date, matcher));
  }

  if (typeof disabled === 'boolean') return disabled;

  if (disabled instanceof Date) {
    return isSameDay(date, disabled);
  }

  if (typeof disabled === 'function') {
    return disabled(date);
  }

  // Handle Matcher objects
  if ('from' in disabled && 'to' in disabled) {
    // DateRange
    if (!disabled.from) return false;
    const from = startOfDay(disabled.from);
    const to = disabled.to ? startOfDay(disabled.to) : from;
    return date >= from && date <= to;
  }

  if ('before' in disabled) {
    return isBefore(date, startOfDay(disabled.before));
  }

  if ('after' in disabled) {
    return isAfter(date, startOfDay(disabled.after));
  }

  return false;
};

export const formatDisplayDate = (date: Date): string => {
  // Simple fallback formatter if needed, but component usually handles this
  return date.toDateString();
};
