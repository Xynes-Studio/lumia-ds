import { useCalendarNavigation } from './use-calendar-navigation';
import { useCalendarSelection } from './use-calendar-selection';
import { useCalendarView } from './use-calendar-view';
import {
  CalendarMode,
  DateRange,
  DisabledMatcher,
  CalendarViewMode,
} from '../types/calendar.types';
import { getMonthDays } from '../utils/date-utils';

export interface UseCalendarProps {
  mode?: CalendarMode;
  defaultMonth?: Date;
  selected?: Date | DateRange;
  onSelect?: (value: Date | DateRange | undefined) => void;
  disabled?: DisabledMatcher | DisabledMatcher[];
  defaultView?: CalendarViewMode;
  minDate?: Date;
  maxDate?: Date;
  onViewChange?: (view: CalendarViewMode) => void;
}

export const useCalendar = ({
  mode = 'single',
  defaultMonth,
  selected,
  onSelect,
  disabled,
  defaultView = 'month',
  minDate,
  maxDate,
  onViewChange,
}: UseCalendarProps = {}) => {
  const navigation = useCalendarNavigation({ defaultMonth, minDate, maxDate });
  const selection = useCalendarSelection({
    mode,
    selected,
    onSelect,
    disabled,
  });
  const view = useCalendarView({
    defaultView,
    date: navigation.month,
    onViewChange,
  });

  // Compute days based on current view/month for backward compatibility and ease of use
  // Default behavior is usually month view
  const days = getMonthDays(navigation.month);

  return {
    // Navigation
    month: navigation.month,
    setMonth: navigation.setMonth,
    nextMonth: navigation.nextMonth,
    prevMonth: navigation.prevMonth,
    goToMonth: navigation.goToMonth,
    goToYear: navigation.goToYear,
    goToDate: navigation.goToDate,

    // Selection
    selectDate: selection.selectDate,
    isSelected: selection.isSelected,
    isRangeStart: selection.isRangeStart,
    isRangeEnd: selection.isRangeEnd,
    isRangeMiddle: selection.isRangeMiddle,

    // View
    view: view.view,
    setView: view.setView,
    currentDate: view.currentDate,

    // Data
    days,
    monthDays: view.monthDays,
    weekDays: view.weekDays,
  };
};
