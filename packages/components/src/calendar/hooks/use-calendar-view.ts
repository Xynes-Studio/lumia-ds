import { useState, useCallback, useMemo } from 'react';
import { CalendarViewMode } from '../types/calendar.types';
import { getMonthDays, getWeekDays } from '../utils/date-utils';
// Note: We'll rely on the utils we created.

export interface UseCalendarViewOptions {
  defaultView?: CalendarViewMode;
  date?: Date;
  onViewChange?: (view: CalendarViewMode) => void;
}

export interface UseCalendarViewReturn {
  view: CalendarViewMode;
  setView: (view: CalendarViewMode) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  weekDays: Date[];
  monthDays: Date[];
  goToToday: () => void;
}

export const useCalendarView = ({
  defaultView = 'month',
  date = new Date(),
  onViewChange,
}: UseCalendarViewOptions = {}): UseCalendarViewReturn => {
  const [view, setViewState] = useState<CalendarViewMode>(defaultView);
  const [currentDate, setCurrentDate] = useState<Date>(date);

  const setView = useCallback(
    (newView: CalendarViewMode) => {
      setViewState(newView);
      onViewChange?.(newView);
    },
    [onViewChange],
  );

  const monthDays = useMemo(() => getMonthDays(currentDate), [currentDate]);
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  return {
    view,
    setView,
    currentDate,
    setCurrentDate,
    weekDays,
    monthDays,
    goToToday,
  };
};
