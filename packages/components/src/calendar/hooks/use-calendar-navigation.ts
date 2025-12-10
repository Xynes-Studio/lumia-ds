import { useState, useCallback } from 'react';
import {
  addMonths,
  subMonths,
  setMonth as setMonthDateFns,
  setYear,
  startOfMonth,
} from 'date-fns';

export interface UseCalendarNavigationOptions {
  defaultMonth?: Date;
  minDate?: Date;
  maxDate?: Date;
}

export interface UseCalendarNavigationReturn {
  month: Date;
  setMonth: (date: Date) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  goToMonth: (month: number) => void;
  goToYear: (year: number) => void;
  goToDate: (date: Date) => void;
}

export const useCalendarNavigation = ({
  defaultMonth,
}: UseCalendarNavigationOptions = {}): UseCalendarNavigationReturn => {
  const [month, setMonthState] = useState<Date>(
    defaultMonth || startOfMonth(new Date()),
  );

  const setMonth = useCallback((date: Date) => {
    setMonthState(startOfMonth(date));
  }, []);

  const nextMonth = useCallback(() => {
    setMonthState((current) => addMonths(current, 1));
  }, []);

  const prevMonth = useCallback(() => {
    setMonthState((current) => subMonths(current, 1));
  }, []);

  const goToMonth = useCallback((monthIndex: number) => {
    setMonthState((current) => setMonthDateFns(current, monthIndex));
  }, []);

  const goToYear = useCallback((year: number) => {
    setMonthState((current) => setYear(current, year));
  }, []);

  const goToDate = useCallback((date: Date) => {
    setMonthState(startOfMonth(date));
  }, []);

  return {
    month,
    setMonth,
    nextMonth,
    prevMonth,
    goToMonth,
    goToYear,
    goToDate,
  };
};
