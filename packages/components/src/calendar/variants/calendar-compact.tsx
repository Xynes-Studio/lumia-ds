import React from 'react';
import { CalendarProps } from '../types/calendar.types';
import { Calendar } from '../calendar';

export type CalendarCompactProps = Omit<CalendarProps, 'variant'>;

export const CalendarCompact = (props: CalendarCompactProps) => {
  return <Calendar {...props} variant="compact" />;
};
