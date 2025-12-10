import type { Meta, StoryObj } from '@storybook/react';
import { Calendar } from './calendar';
import { DateRange } from './types/calendar.types';
import { addDays } from 'date-fns';
import { useState } from 'react';

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'range', 'default'],
    },
    variant: {
      control: 'select',
      options: ['compact', 'full'],
    },
    selected: { control: 'date' },
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  args: {
    mode: 'single',
    variant: 'compact',
    className: 'rounded-md border shadow',
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <Calendar
        {...args}
        mode="single"
        selected={date}
        onSelect={(d) => setDate(d as Date)}
      />
    );
  },
};

export const RangeSelection: Story = {
  args: {
    mode: 'range',
    variant: 'compact',
    className: 'rounded-md border shadow',
    numberOfMonths: 2,
  },
  render: (args) => {
    const [range, setRange] = useState<DateRange | undefined>({
      from: new Date(),
      to: addDays(new Date(), 5),
    });
    return (
      <Calendar
        {...args}
        mode="range"
        selected={range}
        onSelect={(range) => setRange(range as DateRange)}
      />
    );
  },
};

export const FullVariant: Story = {
  args: {
    variant: 'full',
    className: 'w-[1200px] border rounded-md shadow',
  },
  render: (args) => {
    return <Calendar {...args} variant="full" />;
  },
};

export const CustomDayRendering: Story = {
  args: {
    mode: 'single',
    className: 'rounded-md border shadow',
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const hasEvent = (d: Date) => d.getDate() % 5 === 0;

    return (
      <Calendar
        {...args}
        mode="single"
        selected={date}
        onSelect={(d) => setDate(d as Date)}
        renderDay={(props) => (
          <div
            onClick={props.onClick}
            className={`
                            relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20
                            flex items-center justify-center cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md
                            ${props.isSelected ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' : ''}
                            ${props.isToday ? 'bg-accent text-accent-foreground' : ''}
                        `}
          >
            {props.date.getDate()}
            {hasEvent(props.date) && (
              <div className="absolute bottom-1 h-1 w-1 rounded-full bg-red-500" />
            )}
          </div>
        )}
      />
    );
  },
};

export const WithMinMaxDates: Story = {
  args: {
    mode: 'single',
    className: 'rounded-md border shadow',
    minDate: new Date(),
    maxDate: addDays(new Date(), 10),
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <Calendar
        {...args}
        mode="single"
        selected={date}
        onSelect={(d) => setDate(d as Date)}
      />
    );
  },
};
