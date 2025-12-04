/* istanbul ignore file */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TimePicker } from './time-picker';

const meta = {
  title: 'Components/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof TimePicker>;

export const Basic: Story = {
  render: () => {
    const [value, setValue] = useState<string>();
    return (
      <div className="w-[320px] space-y-3">
        <TimePicker
          label="Reminder time"
          value={value}
          onChange={setValue}
          placeholder="Select time"
        />
        <p className="text-sm text-muted">Selected: {value ?? 'Not set'}</p>
      </div>
    );
  },
};
export const TwelveHourMode: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>(
      new Date(2024, 0, 1, 9, 30),
    );

    return (
      <div className="w-[320px] space-y-3">
        <TimePicker
          label="Meeting"
          format="12h"
          value={value}
          onChange={setValue}
          returnType="date"
          hint="12-hour clock"
        />
        <p className="text-sm text-muted">
          Selected:{' '}
          {value
            ? value.toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              })
            : 'None'}
        </p>
      </div>
    );
  },
};
