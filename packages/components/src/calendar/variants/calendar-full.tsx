import React from 'react';
import { CalendarProps } from '../types/calendar.types';
import { CalendarImpl } from '../calendar-impl';

export type CalendarFullProps = Omit<CalendarProps, 'variant'>;

export const CalendarFull = (props: CalendarFullProps) => {
  return <CalendarImpl {...props} variant="full" />;
};
