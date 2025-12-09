import { useCallback } from 'react';
import { isSameDay, isBefore, isAfter } from 'date-fns';
import {
  CalendarMode,
  DateRange,
  DisabledMatcher,
} from '../types/calendar.types';
import { isDateDisabled } from '../utils/date-utils';

export interface UseCalendarSelectionOptions {
  mode?: CalendarMode;
  selected?: Date | DateRange;
  onSelect?: (date: Date | DateRange | undefined) => void;
  disabled?: DisabledMatcher | DisabledMatcher[];
}

export interface UseCalendarSelectionReturn {
  selectDate: (date: Date) => void;
  isSelected: (date: Date) => boolean;
  isRangeStart: (date: Date) => boolean;
  isRangeEnd: (date: Date) => boolean;
  isRangeMiddle: (date: Date) => boolean;
}

export const useCalendarSelection = ({
  mode = 'single',
  selected,
  onSelect,
  disabled,
}: UseCalendarSelectionOptions): UseCalendarSelectionReturn => {
  const selectDate = useCallback(
    (date: Date) => {
      if (isDateDisabled(date, disabled)) return;

      if (mode === 'single') {
        const isSelected =
          selected instanceof Date && isSameDay(date, selected);
        if (onSelect) {
          onSelect(isSelected ? undefined : date);
        }
      } else if (mode === 'range') {
        const range = (selected as DateRange) || {
          from: undefined,
          to: undefined,
        };
        let newRange: DateRange = { ...range };

        if (!range.from || (range.from && range.to)) {
          newRange = { from: date, to: undefined };
        } else if (range.from && !range.to) {
          if (isBefore(date, range.from)) {
            newRange = { from: date, to: range.from };
          } else {
            newRange = { from: range.from, to: date };
          }
        }

        if (onSelect) {
          onSelect(newRange);
        }
      }
    },
    [mode, selected, onSelect, disabled],
  );

  const isSelected = useCallback(
    (date: Date) => {
      if (mode === 'single') {
        return selected instanceof Date && isSameDay(date, selected);
      }
      if (mode === 'range') {
        const range = selected as DateRange;
        if (!range?.from) return false;
        if (isSameDay(date, range.from)) return true;
        if (range.to && isSameDay(date, range.to)) return true;
        return false;
      }
      return false;
    },
    [mode, selected],
  );

  const isRangeStart = useCallback(
    (date: Date) => {
      if (mode !== 'range') return false;
      const range = selected as DateRange;
      return !!range?.from && isSameDay(date, range.from);
    },
    [mode, selected],
  );

  const isRangeEnd = useCallback(
    (date: Date) => {
      if (mode !== 'range') return false;
      const range = selected as DateRange;
      return !!range?.to && isSameDay(date, range.to);
    },
    [mode, selected],
  );

  const isRangeMiddle = useCallback(
    (date: Date) => {
      if (mode !== 'range') return false;
      const range = selected as DateRange;
      if (!range?.from || !range?.to) return false;
      return isAfter(date, range.from) && isBefore(date, range.to);
    },
    [mode, selected],
  );

  return {
    selectDate,
    isSelected,
    isRangeStart,
    isRangeEnd,
    isRangeMiddle,
  };
};
