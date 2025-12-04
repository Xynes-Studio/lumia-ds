/* istanbul ignore file */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { DatePicker } from './date-picker';

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Basic: Story = {
  render: () => {
    const [value, setValue] = useState<Date>();
    return (
      <div className="w-[320px] space-y-3">
        <DatePicker
          label="Due date"
          value={value}
          onChange={setValue}
          placeholder="Pick a date"
        />
        <div className="text-sm text-muted">
          Selected:{' '}
          {value
            ? value.toLocaleDateString(undefined, { dateStyle: 'medium' })
            : '–'}
        </div>
      </div>
    );
  },
};

export const WithBounds: Story = {
  render: () => {
    const [value, setValue] = useState<Date>();
    const min = new Date();
    const max = new Date();
    max.setDate(max.getDate() + 14);

    return (
      <div className="w-[320px] space-y-4">
        <DatePicker
          label="Schedule"
          hint="Next two weeks only"
          minDate={min}
          maxDate={max}
          value={value}
          onChange={setValue}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setValue(new Date())}
          >
            Today
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setValue(undefined)}>
            Clear
          </Button>
        </div>
      </div>
    );
  },
};
