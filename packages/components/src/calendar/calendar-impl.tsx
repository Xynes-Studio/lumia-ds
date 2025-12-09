import React from 'react';
import { cn } from '../lib/utils';
import { CalendarProps, CalendarViewMode } from './types/calendar.types';
import { useCalendar } from './hooks/use-calendar';
import { CalendarHeader } from './components/calendar-header';
import { SegmentedControl } from '../segmented-control/segmented-control';
import { DayCell } from './components/day-cell';
import { WEEK_DAYS } from './utils/constants';
import { useState } from 'react';
import { MonthSelector } from './components/month-selector';
import { YearSelector } from './components/year-selector';

export const CalendarImpl = ({
  className,
  classNames,
  showOutsideDays = true,
  viewMode: controlledViewMode,
  onViewChange: onControlledViewChange,
  variant = 'compact',
  ...props
}: CalendarProps) => {
  const {
    month,
    view,
    setView,
    nextMonth,
    prevMonth,
    goToMonth,
    goToYear,
    days,
    selectDate,
    isSelected,
    isRangeStart,
    isRangeEnd,
    isRangeMiddle,
  } = useCalendar({
    ...props,
    defaultView: controlledViewMode || 'month',
    onViewChange: onControlledViewChange,
    minDate:
      props.minDate ||
      props.startMonth ||
      (typeof props.disabled === 'object' &&
      props.disabled &&
      'before' in props.disabled
        ? (props.disabled as { before: Date }).before
        : undefined),
    maxDate:
      props.maxDate ||
      props.endMonth ||
      (typeof props.disabled === 'object' &&
      props.disabled &&
      'after' in props.disabled
        ? (props.disabled as { after: Date }).after
        : undefined),
    defaultMonth: props.defaultMonth || (props.selected as Date) || undefined,
  });

  const handleViewChange = (v: string) => {
    setView(v as CalendarViewMode);
  };

  const [selectionView, setSelectionView] = useState<
    'dates' | 'months' | 'years'
  >('dates');

  const handleMonthClick = () => {
    setSelectionView((prev) => (prev === 'months' ? 'dates' : 'months'));
  };

  const handleYearClick = () => {
    setSelectionView((prev) => (prev === 'years' ? 'dates' : 'years'));
  };

  const handleMonthSelect = (monthIndex: number) => {
    goToMonth(monthIndex);
    setSelectionView('dates');
  };

  const handleYearSelect = (year: number) => {
    goToYear(year);
    setSelectionView('months');
  };

  const DayComponent = props.dayComponent || DayCell;
  const isFull = variant === 'full';

  return (
    <div
      className={cn(
        'flex flex-col',
        // Specific dimensions for compact to prevent layout shift
        isFull ? 'w-full h-full min-h-[700px]' : 'w-[320px] h-[360px]',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between border-b',
          isFull ? 'p-4' : 'p-2 pb-4 space-x-4',
        )}
      >
        <CalendarHeader
          month={month}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          onMonthChange={goToMonth}
          onYearChange={goToYear}
          className={cn(isFull ? '' : 'w-full')}
          minDate={
            props.minDate ||
            (typeof props.disabled === 'object' &&
            props.disabled &&
            'before' in props.disabled
              ? (props.disabled as { before: Date }).before
              : undefined)
          }
          maxDate={props.maxDate || props.endMonth}
          onMonthClick={handleMonthClick}
          onYearClick={handleYearClick}
          isMonthSelectorOpen={selectionView === 'months'}
          isYearSelectorOpen={selectionView === 'years'}
        />
        {isFull && (
          <SegmentedControl
            value={view}
            onChange={handleViewChange}
            options={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
          />
        )}
      </div>

      <div
        className={cn(
          'flex-1 overflow-hidden flex flex-col',
          isFull ? 'p-4' : 'px-2 pb-2',
        )}
      >
        {selectionView === 'months' ? (
          <div className={cn('h-full w-full', isFull ? 'p-4' : 'p-0')}>
            <MonthSelector
              value={month.getMonth()}
              onChange={handleMonthSelect}
              className={cn('mt-0 w-full', isFull ? 'h-full' : 'h-auto')}
            />
          </div>
        ) : selectionView === 'years' ? (
          <div className={cn('h-full w-full', isFull ? 'p-4' : 'p-0')}>
            <YearSelector
              value={month.getFullYear()}
              onChange={handleYearSelect}
              minYear={1900}
              maxYear={2100}
              // Force full height in compact to prevent scroll jump, use full in full variant
              className={cn(
                'mt-0 w-full',
                isFull ? 'h-full max-h-none' : 'h-full max-h-none',
              )}
            />
          </div>
        ) : view === 'month' ? (
          <div className="flex flex-col h-full w-full">
            <div
              className={cn(
                'grid grid-cols-7 mb-0 flex-shrink-0',
                isFull ? 'border-b border-r' : 'gap-y-1',
              )}
            >
              {WEEK_DAYS.map((day) => (
                <div
                  key={day}
                  className={cn(
                    'text-center text-sm font-medium text-muted-foreground flex justify-center items-center',
                    isFull ? 'py-4 border-l border-t bg-muted/30' : 'py-2',
                  )}
                >
                  {day}
                </div>
              ))}
            </div>
            <div
              className={cn(
                'grid grid-cols-7 flex-1',
                isFull ? 'border-l auto-rows-fr' : 'gap-y-1',
              )}
            >
              {days.map((day, i) => {
                const isOutsideMonth = day.getMonth() !== month.getMonth();
                if (!showOutsideDays && isOutsideMonth)
                  return (
                    <div
                      key={i}
                      className={cn(
                        isFull ? 'border-b border-r min-h-[100px]' : 'w-9 h-9',
                      )}
                    />
                  );

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'aspect-square',
                      isFull &&
                        'aspect-auto h-full border-b border-r min-h-[100px]',
                    )}
                  >
                    {props.renderDay ? (
                      props.renderDay({
                        date: day,
                        isSelected: isSelected(day),
                        isToday: false, // simplified
                        isOutside: isOutsideMonth,
                        isDisabled: false, // simplified
                        isRangeStart: isRangeStart(day),
                        isRangeEnd: isRangeEnd(day),
                        isRangeMiddle: isRangeMiddle(day),
                        onClick: () => selectDate(day),
                      })
                    ) : (
                      <DayComponent
                        date={day}
                        isSelected={isSelected(day)}
                        isToday={false} // simplified
                        isOutside={isOutsideMonth}
                        isDisabled={false} // simplified
                        isRangeStart={isRangeStart(day)}
                        isRangeEnd={isRangeEnd(day)}
                        isRangeMiddle={isRangeMiddle(day)}
                        onClick={() => selectDate(day)}
                        className={cn('w-full h-full', classNames?.day)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground p-8">
            View not implemented
          </div>
        )}
      </div>
    </div>
  );
};
