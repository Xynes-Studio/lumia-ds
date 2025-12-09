import { useState, useCallback, useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
} from 'date-fns';

export interface UseCalendarProps {
  defaultMonth?: Date;
}

export const useCalendar = ({ defaultMonth }: UseCalendarProps = {}) => {
  const [month, setMonth] = useState<Date>(
    defaultMonth || startOfMonth(new Date()),
  );

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const nextMonth = useCallback(() => {
    setMonth((current) => addMonths(current, 1));
  }, []);

  const prevMonth = useCallback(() => {
    setMonth((current) => subMonths(current, 1));
  }, []);

  return {
    month,
    setMonth,
    days,
    nextMonth,
    prevMonth,
  };
};
