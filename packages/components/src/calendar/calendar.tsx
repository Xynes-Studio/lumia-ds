import React from 'react';
import { CalendarProps } from './types/calendar.types';
import { CalendarImpl } from './calendar-impl';

export * from './types/calendar.types';
export * from './types/day-cell.types';

export const Calendar = (props: CalendarProps) => {
  return <CalendarImpl {...props} />;
};
